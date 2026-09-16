import { Hono } from 'hono'
import type { Context } from 'hono'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { mountVersion } from '@mspbots/react/server'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { closeAll } from './lib/db.ts'
import { getUser, requireUser } from './lib/auth.ts'
import { buildScorecard, readMode } from './lib/scorecard.ts'
import { GROUP_LABELS, ROWS } from './lib/rows.ts'
import { writeManualValues } from './lib/manual-metrics.ts'
import { writeThresholdOverride } from './lib/thresholds.ts'
import { SETTING_DEFS, invalidateSettings, maskSecret, readSettings, writeSettings } from './lib/settings.ts'

const MANUAL_ROW_IDS = new Set(ROWS.filter((r) => r.kind === 'manual').map((r) => r.id))
const THRESHOLD_EDITABLE_IDS = new Set(ROWS.filter((r) => r.thresholdEditable).map((r) => r.id))

const serverDir = dirname(fileURLToPath(import.meta.url))

const basePath = (process.env.BASE_URL ?? '/').replace(/\/+$/, '')

const app = basePath ? new Hono().basePath(basePath) : new Hono()

// ---- Public (no token) -----------------------------------------------------------------------
// Registered BEFORE the guarded group: Hono runs middleware in registration order.

// Build identity (GET /api/_version): App Publish polls it to confirm a deploy rolled to the new image.
mountVersion(app, { name: 'product-scorecards', version: process.env.APP_VERSION })

app.get('/api/health', (c) =>
  c.json({
    app: process.env.APP_NAME ?? 'product-scorecards',
    version: process.env.APP_VERSION ?? 'dev',
    time: new Date().toISOString(),
  }),
)

// ---- Private: every business route needs a platform login (Bearer JWT, or a tenant API key) ----
//
// The scorecard is an internal L10 board: every page requires a login, so every data route does too.
// Reads and writes are scoped to the tenant on the caller's token. There is no cross-tenant route,
// so nothing here needs requirePlatformAdmin(); nothing manages tenant membership either, so
// nothing needs requireAdmin(). The one role in play is "signed-in user".
const api = new Hono()
api.use('*', requireUser())
// A token without a tenant cannot be mapped to a database, so it cannot read or write anything.
api.use('*', async (c, next) => {
  if (!getUser(c)?.tenantId) return c.json({ error: 'the token carries no tenant' }, 403)
  await next()
})

/** The caller's tenant: the only tenant this request may touch. Never taken from a header or query. */
const tenantOf = (c: Context): string => getUser(c)!.tenantId!
/** Who to record as the author of a write. */
const editorOf = (c: Context): string | null => {
  const me = getUser(c)
  return me?.email ?? me?.displayName ?? me?.id ?? null
}

api.get('/mode', async (c) => c.json({ mode: await readMode(tenantOf(c)) }))

/**
 * Settings. Reads never return the API key itself, only a masked hint, so the page can confirm a
 * key is configured without the secret crossing back to a browser.
 */
api.get('/settings', async (c) => {
  const { values, origin, storageError } = await readSettings(tenantOf(c))
  return c.json({
    storageError,
    items: SETTING_DEFS.map((def) => ({
      key: def.key,
      secret: def.secret ?? false,
      env: def.env,
      default: def.default,
      origin: origin[def.key],
      value: def.secret ? '' : values[def.key],
      hint: def.secret ? maskSecret(values[def.key]) : '',
      configured: Boolean(values[def.key]),
    })),
  })
})

/** Writing settings changes how the app authenticates to the reports API; it is stored per tenant. */
api.put('/settings', async (c) => {
  const tenantId = tenantOf(c)
  const body = (await c.req.json().catch(() => null)) as Record<string, string> | null
  if (!body || typeof body !== 'object') return c.json({ error: 'expected a JSON object of settings' }, 400)

  try {
    await writeSettings(tenantId, body, editorOf(c))
    invalidateSettings(tenantId)
    return c.json({ ok: true, mode: await readMode(tenantId) })
  } catch (error) {
    // A failed write must not look like a success: the page reports exactly why nothing was saved.
    return c.json({ error: (error as Error).message }, 502)
  }
})

/** Weekly values for `kind: 'manual'` rows (Kevin's Evolve MPD card today). */
api.put('/manual-metrics/:metricId', async (c) => {
  const metricId = c.req.param('metricId')
  if (!MANUAL_ROW_IDS.has(metricId)) return c.json({ error: 'unknown manual metric' }, 404)

  const body = (await c.req.json().catch(() => null)) as { values?: { week: string; value: number }[] } | null
  const entries = (body?.values ?? []).filter((v) => v && /^\d{4}-\d{2}-\d{2}$/.test(v.week) && Number.isInteger(v.value) && v.value >= 0)
  if (!entries.length) return c.json({ error: 'no valid weekly values in the request' }, 400)

  try {
    await writeManualValues(tenantOf(c), metricId, entries, editorOf(c))
    return c.json({ ok: true })
  } catch (error) {
    return c.json({ error: (error as Error).message }, 502)
  }
})

/**
 * Runtime target/yellowMin override for a `thresholdEditable` row (Internal Automations' "New
 * releases" row today).
 */
api.put('/metric-thresholds/:metricId', async (c) => {
  const metricId = c.req.param('metricId')
  if (!THRESHOLD_EDITABLE_IDS.has(metricId)) return c.json({ error: "this metric's threshold isn't editable" }, 404)

  const body = (await c.req.json().catch(() => null)) as { target?: number; yellowMin?: number } | null
  const target = body?.target
  const yellowMin = body?.yellowMin
  if (!Number.isInteger(target) || (target as number) < 0) {
    return c.json({ error: 'target must be a non-negative integer' }, 400)
  }
  if (yellowMin != null && (!Number.isInteger(yellowMin) || yellowMin < 0 || yellowMin >= (target as number))) {
    return c.json({ error: 'yellowMin must be a non-negative integer below target' }, 400)
  }

  try {
    await writeThresholdOverride(tenantOf(c), metricId, { target: target as number, yellowMin: yellowMin ?? null }, editorOf(c))
    return c.json({ ok: true })
  } catch (error) {
    return c.json({ error: (error as Error).message }, 502)
  }
})

/**
 * The SOP Agent (Agent Platform) engagement funnel, computed from the engagement store.
 * `?refresh=1` forces a `git pull` instead of waiting out the 5-minute interval.
 *
 * Guarded like every other business route: the store carries client names, so a login is required
 * even though the funnel itself is global rather than per-tenant.
 */
api.get('/sap-funnel', async (c) => {
  const { buildSapFunnel } = await import('./lib/sap-funnel.ts')
  try {
    return c.json(await buildSapFunnel(tenantOf(c), c.req.query('refresh') === '1'))
  } catch (error) {
    // 503, not 500: the computation is fine, the source is not reachable — and the page says which.
    return c.json({ error: (error as Error).message }, 503)
  }
})

// Shape probe, dev only. Reports the response envelope and the row's field NAMES — never values —
// so the resolvers can be checked against the real payload without exporting any data.
if (process.env.NODE_ENV !== 'production') {
  api.get('/debug/facets/:id', async (c) => {
    const { probeFacets } = await import('./lib/scorecard.ts')
    try {
      return c.json(await probeFacets(tenantOf(c), c.req.param('id'), (c.req.query('cols') ?? '').split(',').filter(Boolean)))
    } catch (error) {
      return c.json({ error: (error as Error).message }, 502)
    }
  })

  api.get('/debug/shape/:id', async (c) => {
    const { probeShape } = await import('./lib/scorecard.ts')
    try {
      return c.json(await probeShape(tenantOf(c), c.req.param('id'), Number(c.req.query('size') ?? 1)))
    } catch (error) {
      return c.json({ error: (error as Error).message }, 502)
    }
  })
}

api.get('/timesheet', async (c) => {
  const { readTimesheet } = await import('./lib/timesheet.ts')
  try {
    return c.json(await readTimesheet(tenantOf(c), { refresh: c.req.query('refresh') === '1' }))
  } catch (error) {
    return c.json({ error: (error as Error).message }, 502)
  }
})

// In token mode the datasets are read as the calling user: the caller's own platform token is
// forwarded together with the tenant id from that token (never one named by the request). In
// public mode the tenant's own key (Settings page) is used and neither is needed.
api.get('/scorecard', async (c) => {
  const tenantId = tenantOf(c)
  const token = c.req.header('authorization')?.replace(/^Bearer /i, '') ?? ''
  const mode = await readMode(tenantId)

  if (mode === 'token' && !token) {
    return c.json(
      {
        error:
          'no API key configured and no platform token on the request. Set the API key on the ' +
          'Settings page so the app reads with its own credential.',
        mode,
      },
      401,
    )
  }

  try {
    const result = await buildScorecard(tenantId, { token, tenantCode: tenantId })
    return c.json({ ...result, groups: GROUP_LABELS })
  } catch (error) {
    // Surface the real failure: a scorecard that silently renders zeros is worse than a visible error.
    return c.json({ error: (error as Error).message }, 502)
  }
})

app.route('/api', api)

const cacheControl = (pathname: string): string =>
  pathname.endsWith('.html') || pathname.endsWith('/')
    ? 'no-cache'
    : pathname.includes('/assets/')
      ? 'public, max-age=31536000, immutable'
      : 'public, max-age=3600'

function bootstrap(hono: Hono) {
  const port = Number(process.env.PORT)

  if (process.env.NODE_ENV === 'production') {
    let indexHtml: string | null = null
    const sendIndex = (context: Context) => {
      if (indexHtml === null) {
        try {
          indexHtml = readFileSync(join(serverDir, 'index.html'), 'utf8')
        } catch {
          indexHtml = ''
        }
      }
      if (!indexHtml) return context.json({ error: 'Not Found' }, 404)
      context.header('Cache-Control', 'no-cache')
      return context.html(indexHtml)
    }

    hono.get('/', sendIndex)
    hono.use(
      '/*',
      serveStatic({
        root: serverDir,
        rewriteRequestPath: (path) => path.slice(basePath.length) || '/',
        onFound: (_path, context) => context.header('Cache-Control', cacheControl(context.req.path)),
      }),
    )
    // SPA history fallback: match by request path, not the Accept header (wujie fetches the entry with Accept: */*); rule per connect-history-api-fallback.
    const stripBase = (path: string) => (basePath && path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path)
    hono.get('/*', (context) => {
      const path = stripBase(context.req.path)
      const isSpaRoute = !/^\/(api|ws|sse)(\/|$)/.test(path) && !/\/[^/]+\.[^/]+$/.test(path)
      return isSpaRoute ? sendIndex(context) : context.json({ error: 'Not Found' }, 404)
    })
  }

  const server = serve({ fetch: hono.fetch, port }, (info) => {
    console.log(`Server listening on http://localhost:${info.port}`)
  })

  let closing = false
  const shutdown = async () => {
    if (closing) return
    closing = true
    setTimeout(() => process.exit(0), 8000).unref()
    await new Promise<void>((resolve) => server.close(() => resolve()))
    // Drain every tenant's connection pool before the process goes away.
    await closeAll().catch(() => {})
    process.exit(0)
  }
  process.on('SIGTERM', () => void shutdown())
  process.on('SIGINT', () => void shutdown())
}

bootstrap(app)
