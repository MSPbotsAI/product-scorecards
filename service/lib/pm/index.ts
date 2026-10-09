/**
 * The Support Ticket Updates engine: keep each tenant's event log fresh, then compute from it.
 *
 * A capture reads Halo Actions (minutes, at ~60 s a page) while computing from the log takes
 * milliseconds, so the two are decoupled: a request always answers from the log immediately and, if
 * the log is stale, starts a capture in the background. The page shows when the log was last
 * captured and polls while one is running. The first ever request answers with an empty log and a
 * capture in flight — never with a zero.
 *
 * Halo forgets after ~14 days, so the log must be topped up at least that often. Page views do it,
 * and once a tenant has captured with its own API key this process also re-captures on a timer, so a
 * quiet fortnight cannot age actions out unseen. Any hole that does open is detected and shown.
 */
import { readSettings } from '../settings.ts'
import { type PmEvent, PM_NAME, type ReadAuth, readActions, relevant, sanitize } from './actions.ts'
import { CALENDAR } from './calendar.ts'
import { buildScorecard } from './metrics.ts'
import { type Batch, type Capture, batchOf, loadStore, mergeBatch, storeKind } from './store.ts'
import { WORK_END_HOUR, WORK_START_HOUR, WORKDAY_HOURS } from './workTime.ts'

/** The numbers move at ticket speed; a capture every half hour is plenty for a weekly scorecard. */
const STALE_MS = 30 * 60_000
/** After a failed capture, wait before trying again, so a broken upstream is not hammered per page view. */
const RETRY_AFTER_MS = 5 * 60_000
/** Background re-capture interval — far inside Halo's ~14-day retention. */
const PERIODIC_MS = 6 * 3600_000

interface TenantCapture {
  inflight: Promise<void> | null
  lastError: string | null
  lastAttemptAt: number | null
}

const captures = new Map<string, TenantCapture>()
const timers = new Map<string, ReturnType<typeof setInterval>>()

function captureState(tenantId: string): TenantCapture {
  let state = captures.get(tenantId)
  if (!state) {
    state = { inflight: null, lastError: null, lastAttemptAt: null }
    captures.set(tenantId, state)
  }
  return state
}

/** Same rule as the scorecard: the tenant's own key when one is configured, else the caller's token. */
async function readSetup(tenantId: string, token: string): Promise<{ datasetId: string; auth: ReadAuth }> {
  const { values } = await readSettings(tenantId)
  const apiKey = values.public_api_key ?? ''
  return {
    datasetId: values['dataset.halo_actions'],
    auth: { mode: apiKey ? 'public' : 'token', apiKey, token, tenantCode: tenantId },
  }
}

function startCapture(tenantId: string, datasetId: string, auth: ReadAuth): void {
  const state = captureState(tenantId)
  if (state.inflight) return
  state.lastAttemptAt = Date.now()
  if (auth.mode === 'token' && !auth.token) {
    state.lastError = 'no API key configured and no platform token on the request — set the API key on the Settings page'
    return
  }
  state.inflight = readActions(datasetId, auth)
    .then((read) => mergeBatch(tenantId, batchOf(read, new Date().toISOString())))
    .then(() => {
      state.lastError = null
      if (auth.mode === 'public') keepCapturing(tenantId)
    })
    .catch((error: unknown) => {
      state.lastError = describe(error)
      // A background capture has no caller to report to; without this line a failure is invisible to ops.
      console.error(`[support-ticket-updates] capture failed for tenant ${tenantId}: ${state.lastError}`)
    })
    .finally(() => {
      state.inflight = null
    })
}

/** "fetch failed" alone says nothing; the network cause underneath (ECONNRESET, a timeout…) says what broke. */
function describe(error: unknown): string {
  const e = error as { message?: string; cause?: { code?: string; message?: string } } | null
  const cause = e?.cause ? ` (${e.cause.code ?? e.cause.message ?? 'no detail'})` : ''
  return sanitize(`${e?.message ?? String(error)}${cause}`)
}

/**
 * Re-capture on a timer for a tenant that has captured with its own key. Token mode is left to page
 * views: a background read has no caller whose token it could borrow.
 */
function keepCapturing(tenantId: string): void {
  if (timers.has(tenantId)) return
  const timer = setInterval(() => {
    readSetup(tenantId, '')
      .then(({ datasetId, auth }) => {
        if (auth.mode === 'public') startCapture(tenantId, datasetId, auth)
      })
      .catch(() => {
        // Settings unreadable this round: the next tick or page view tries again, and says why.
      })
  }, PERIODIC_MS)
  timer.unref()
  timers.set(tenantId, timer)
}

export async function supportTicketUpdates(tenantId: string, token: string, force: boolean) {
  const { datasetId, auth } = await readSetup(tenantId, token)
  const store = await loadStore(tenantId)
  const last = store.captures.at(-1)
  const state = captureState(tenantId)
  const stale = !last || Date.now() - Date.parse(last.at) > STALE_MS
  const backingOff = !!state.lastError && state.lastAttemptAt !== null && Date.now() - state.lastAttemptAt < RETRY_AFTER_MS
  if (force || (stale && !backingOff)) startCapture(tenantId, datasetId, auth)

  return {
    ...buildScorecard(store, new Date().toISOString()),
    pm: PM_NAME,
    dataset: datasetId,
    capture: {
      lastAt: last?.at ?? null,
      source: last?.source ?? null,
      inFlight: state.inflight !== null,
      lastError: state.lastError,
      events: Object.keys(store.events).length,
      store: storeKind(),
    },
    calendar: {
      status: CALENDAR.status,
      hours: `${String(WORK_START_HOUR).padStart(2, '0')}:00–${WORK_END_HOUR}:00 Asia/Shanghai`,
      workdayHours: WORKDAY_HOURS,
      holidays: CALENDAR.holidays,
      makeupWorkdays: CALENDAR.makeupWorkdays,
    },
  }
}

export type SupportUpdatesPayload = Awaited<ReturnType<typeof supportTicketUpdates>>

/* ── importing an earlier log ── */

/** A malformed import, as opposed to a storage failure: the caller answers 400, not 502. */
export class LogFormatError extends Error {}

const ISO = (v: unknown, what: string): string => {
  const ms = typeof v === 'string' ? Date.parse(v) : Number.NaN
  if (!Number.isFinite(ms)) throw new LogFormatError(`${what} is not a timestamp`)
  return new Date(ms).toISOString()
}
const text = (v: unknown, what: string, max: number): string => {
  if (typeof v !== 'string' || v.length > max) throw new LogFormatError(`${what} is not text of at most ${max} characters`)
  return v
}
const ids = (v: unknown, re: RegExp, what: string): string[] => {
  if (!Array.isArray(v) || v.length > 50 || !v.every((x) => typeof x === 'string' && re.test(x))) {
    throw new LogFormatError(`${what} holds something other than ${re}`)
  }
  return v as string[]
}
const TICKET = /^\d{1,16}$/
const MAX_ITEMS = 200_000

function parseEvent(raw: unknown, key: string): PmEvent {
  const r = (raw ?? {}) as Record<string, unknown>
  const where = `event ${key.slice(0, 40)}`
  const id = text(r.id, `${where}: id`, 64)
  if (!/^[\w-]+$/.test(id) || id !== key) throw new LogFormatError(`${where}: id does not match its key`)
  const ticket = text(r.ticket, `${where}: ticket`, 16)
  if (!TICKET.test(ticket)) throw new LogFormatError(`${where}: ticket is not a ticket number`)
  if (!Number.isInteger(r.seq) || (r.seq as number) < 0) throw new LogFormatError(`${where}: seq is not a sequence number`)
  const party = (p: unknown, side: string) => {
    if (p == null) return undefined
    const o = p as Record<string, unknown>
    return { dept: text(o.dept, `${where}: ${side}.dept`, 200), person: text(o.person, `${where}: ${side}.person`, 200) }
  }
  const from = party(r.from, 'from')
  const to = party(r.to, 'to')
  return {
    id,
    ticket,
    seq: r.seq as number,
    at: ISO(r.at, `${where}: at`),
    who: text(r.who, `${where}: who`, 200),
    outcome: text(r.outcome, `${where}: outcome`, 100),
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
    prd: ids(r.prd, /^PRD-\d{1,12}$/, `${where}: prd`),
    mb: ids(r.mb, /^MB-\d{1,12}$/, `${where}: mb`),
    canny: ids(r.canny, /^\/[^\s"'<>]{1,500}$/, `${where}: canny`),
  }
}

/**
 * Validate an exported log (the local PM Weekly file, or another tenant copy) field by field and turn
 * it into a batch. Nothing in it is trusted: every id, timestamp and link is re-checked, events the
 * capture itself would not keep are dropped, and the merge only fills what the log does not have.
 */
function parseLog(raw: unknown): Batch {
  const body = (raw ?? {}) as Record<string, unknown>
  if (body.version !== 1) throw new LogFormatError('not a version-1 event log')
  const obj = (v: unknown, what: string) => {
    if (!v || typeof v !== 'object' || Array.isArray(v)) throw new LogFormatError(`${what} is missing`)
    const entries = Object.entries(v as Record<string, unknown>)
    if (entries.length > MAX_ITEMS) throw new LogFormatError(`${what} has more than ${MAX_ITEMS} entries`)
    return entries
  }
  const events = obj(body.events, 'events')
    .map(([key, e]) => parseEvent(e, key))
    .filter(relevant)
  const created: Record<string, string> = {}
  for (const [t, v] of obj(body.created, 'created')) {
    if (!TICKET.test(t)) throw new LogFormatError(`created: ${t.slice(0, 20)} is not a ticket number`)
    created[t] = ISO(v, `created ${t}`)
  }
  const tickets: Batch['tickets'] = {}
  for (const [t, v] of obj(body.tickets, 'tickets')) {
    if (!TICKET.test(t)) throw new LogFormatError(`tickets: ${t.slice(0, 20)} is not a ticket number`)
    const m = (v ?? {}) as Record<string, unknown>
    tickets[t] = { summary: text(m.summary, `ticket ${t}: summary`, 2000), client: text(m.client, `ticket ${t}: client`, 500) }
  }
  if (!Array.isArray(body.captures) || body.captures.length > 10_000) throw new LogFormatError('captures is missing')
  const caps: Capture[] = body.captures.map((c: unknown, i: number) => {
    const o = (c ?? {}) as Record<string, unknown>
    if (!Number.isInteger(o.rows) || (o.rows as number) < 0) throw new LogFormatError(`capture ${i}: rows is not a count`)
    return {
      at: ISO(o.at, `capture ${i}: at`),
      source: text(o.source, `capture ${i}: source`, 16),
      rows: o.rows as number,
      oldest: o.oldest == null ? null : ISO(o.oldest, `capture ${i}: oldest`),
      newest: o.newest == null ? null : ISO(o.newest, `capture ${i}: newest`),
    }
  })
  return { events, created, tickets, captures: caps, metaWins: 'existing' }
}

export async function importLog(tenantId: string, raw: unknown): Promise<{ read: number; added: number; events: number }> {
  const batch = parseLog(raw)
  const before = Object.keys((await loadStore(tenantId)).events).length
  await mergeBatch(tenantId, batch)
  const after = Object.keys((await loadStore(tenantId)).events).length
  return { read: batch.events.length, added: after - before, events: after }
}
