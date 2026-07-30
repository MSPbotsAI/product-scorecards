// Computes scorecard row values from the two platform datasets.
//
// Sources (verified 2026-07-29, see scorecard/data-map.md):
//   AI_CREDIT_DATASET     one row per paying tenant, l7d/p7d consumption split per product
//   WEEKLY_METRICS_DATASET tenant x week; per-product active flags and engagement scores
//
// Rules this file follows deliberately:
//   - An empty read is NOT zero. If a fetch fails or returns nothing, the row reports 'nodata'.
//   - Pagination is never silently truncated: hitting the cap is reported as an error on the row.

import { createMspbotsReportClient, type AuthHeaders } from './mspbots-report.ts'
import { readSettings } from './settings.ts'
import { ROWS, type Compare, type RowDef } from './rows.ts'

/** Built-in defaults. The live values come from the Settings page — see readSettings(). */
export const AI_CREDIT_DATASET = '1985255723050872834'
/**
 * Product Scorecard Weekly Metrics — created for this app on 2026-07-29 (by Micus, in the dataset
 * editor). A tenant×week projection of `dws_paying_client_engagement_score` over a rolling 35-day
 * window (~2.5k rows). The full Product Metric Dataset (1793541682307964929) is tenant×user×week
 * with ~929k rows of history — unreadable through the paged API by design, so it is NOT read here.
 */
export const WEEKLY_METRICS_DATASET = process.env.WEEKLY_METRICS_DATASET ?? '2082466110929776641'
/**
 * Product Scorecard AI Weekly (Micus, 2026-07-29): week×tenant credits per AI product over 91 days,
 * aggregated from dw.dws_ai_trace_stat_day_di_view. Gives the AI active-tenant rows their true
 * calendar-week definition ("this week" per metrics.yaml) and a 13-week history; the credit
 * snapshot dataset stays authoritative for the silent-paid rows and billing status.
 */
export const AI_WEEKLY_DATASET = process.env.AI_WEEKLY_DATASET ?? '2082481324433739777'

const PAGE_SIZE = 500
const MAX_PAGES = 20

export type RowStatus = 'green' | 'yellow' | 'red' | 'display' | 'nodata'

export interface ScorecardRow extends RowDef {
  value: number | null
  previous: number | null
  status: RowStatus
  /** Weekly series, oldest → newest (subscription rows: every week the dataset holds). */
  history?: WeekPoint[]
  /** Named tenants behind a red, so the L10 can act rather than discuss. */
  names?: string[]
  /** Why there is no value. Present whenever status is 'nodata'. */
  reason?: string
}

export interface ScorecardResult {
  week: string
  rows: ScorecardRow[]
  sources: { dataset: string; rows: number; ok: boolean; error?: string }[]
}

/**
 * Built per request from the resolved settings: the API key is editable at runtime from the
 * Settings page, so it cannot be captured in a module-level singleton.
 */
function reportClient(apiKey: string) {
  return createMspbotsReportClient({
    mspbots_client_host: process.env.MSPBOTS_REPORT_HOST ?? 'https://app.mspbots.ai/web/reports',
    public_api_key: apiKey,
  })
}

/**
 * Two ways in, and the configured key decides which:
 *
 * - **public** — read with the app's own API key (Settings page, or PUBLIC_API_KEY). This is the
 *   mode that works everywhere: local dev has no user session to borrow, and the agent platform's
 *   token is a different auth system from the app.mspbots.ai reports API (it answers 401).
 * - **token** — read as the calling user. Only viable when served from an origin whose session the
 *   reports API accepts; kept as the fallback when no key is configured.
 */
export type ReadMode = 'public' | 'token'

/** The mode implied by the currently configured settings. */
export async function readMode(): Promise<ReadMode> {
  const { values } = await readSettings()
  return values.public_api_key ? 'public' : 'token'
}

type Record_ = Record<string, unknown>

const num = (v: unknown): number => {
  const n = typeof v === 'number' ? v : Number(String(v ?? '').replace(/,/g, ''))
  return Number.isFinite(n) ? n : 0
}
const str = (v: unknown): string => (v == null ? '' : String(v))
/** Dataset booleans arrive as true/'true'/'t'/1/'1' depending on the column — never as a guaranteed number. */
const flagOn = (v: unknown): boolean => v === true || num(v) > 0 || /^(t|true|yes|y)$/i.test(str(v))

/**
 * Upstream error messages are user-visible (they surface on nodata rows), and the reports API is
 * known to ECHO THE FULL BEARER TOKEN inside "Invalid token: eyJ…" errors — scrub anything
 * JWT-shaped and keep the message short before it can reach a browser or a log line.
 */
function sanitizeUpstream(msg: string): string {
  return msg.replace(/eyJ[\w-]+\.[\w-]*\.?[\w-]*/g, '[token redacted]').slice(0, 220)
}

/**
 * The platform answers auth and query errors with HTTP 200 and a non-zero `code` in the envelope
 * (e.g. `{"code":"401","msg":"token not userID."}`). Treating that as an empty result is how a
 * broken read turns into a confident zero, so the envelope is checked before the rows are read.
 */
function unwrap(res: Record_, datasetId: string, mode: ReadMode): Record_ {
  const code = res?.code
  if (code != null && !['0', '200', 'success'].includes(String(code).toLowerCase())) {
    const msg = sanitizeUpstream(str(res?.msg) || 'no message')
    const hint =
      mode === 'token' && String(code) === '401'
        ? ' — the forwarded platform token was rejected by the reports API. Agent-platform tokens ' +
          'cannot read app.mspbots.ai datasets; set the API key on the Settings page so the app ' +
          'reads with its own credential.'
        : ''
    throw new Error(`dataset ${datasetId} refused the read (code ${code}): ${msg}${hint}`)
  }
  return (res?.data ?? res) as Record_
}

/** Dev-only: the envelope's keys, the row-array key, one row's field names, and the total. No values. */
export async function probeShape(datasetId: string, size = 1) {
  const { values } = await readSettings()
  if (!values.public_api_key) throw new Error('shape probe is public-mode only')
  const res = (await reportClient(values.public_api_key).getPublicDatasetData(datasetId, {
    current: 1,
    size,
  })) as Record_
  const payload = (res?.data ?? res) as Record_
  const rowsKey = ['records', 'list', 'rows', 'data'].find((k) => Array.isArray(payload?.[k]))
  const batch = rowsKey ? (payload[rowsKey] as Record_[]) : []
  return {
    envelopeKeys: Object.keys(res ?? {}),
    payloadKeys: Object.keys(payload ?? {}).slice(0, 15),
    rowsKey: rowsKey ?? '(none matched)',
    total: payload?.total ?? payload?.totalCount ?? payload?.count ?? null,
    firstRowFields: batch[0] ? Object.keys(batch[0]) : [],
  }
}

interface ReadContext {
  mode: ReadMode
  apiKey: string
  auth: AuthHeaders
}

/** Read every page of a dataset, or fail loudly rather than return a partial or empty set. */
async function readAll(datasetId: string, ctx: ReadContext): Promise<Record_[]> {
  const client = reportClient(ctx.apiKey)
  const out: Record_[] = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const query = { current: page, size: PAGE_SIZE }
    const res = (ctx.mode === 'public'
      ? await client.getPublicDatasetData(datasetId, query)
      : await client.getDatasetData(datasetId, query, ctx.auth)) as Record_
    const payload = unwrap(res, datasetId, ctx.mode)
    const batch = (payload?.records ?? payload?.list ?? payload?.rows ?? payload?.data ?? []) as Record_[]
    if (!Array.isArray(batch)) {
      throw new Error(`dataset ${datasetId} returned an unrecognised envelope — refusing to guess at the shape`)
    }
    if (batch.length === 0) break
    out.push(...batch)
    if (batch.length < PAGE_SIZE) break
    if (page === MAX_PAGES) {
      throw new Error(
        `dataset ${datasetId} exceeded ${MAX_PAGES * PAGE_SIZE} rows — refusing to report a truncated number`,
      )
    }
  }
  // Zero rows is not a zero measurement: these datasets always carry paying tenants.
  if (out.length === 0) throw new Error(`dataset ${datasetId} returned no rows — treating this as unavailable, not as zero`)
  return out
}

function judge(value: number | null, previous: number | null, def: RowDef): RowStatus {
  if (def.compare === 'display') return 'display'
  if (value == null) return 'nodata'
  const { target, compare } = def
  switch (compare) {
    case 'gte':
      if (target == null) return 'display'
      return value >= target ? 'green' : value >= target * 0.9 ? 'yellow' : 'red'
    case 'lte':
      if (target == null) return 'display'
      return value <= target ? 'green' : 'red'
    case 'eq':
      return target != null && value === target ? 'green' : 'red'
    case 'no-decrease':
      if (previous == null) return 'display'
      return value >= previous ? 'green' : 'red'
    default:
      return 'display'
  }
}

/** AI products: active tenants and silent paid tenants, off the credit dataset. */
function resolveAi(rows: Record_[]): Resolved {
  const out: Resolved = new Map()
  const products = [
    // `evidence` columns prove the tenant ever bought/used THIS product — without that scoping,
    // every paying tenant counts as "silent" on every product they never had.
    { ids: ['T1', 'T4'], l7d: 'l7d_consumed_ticketqa', p7d: null, evidence: ['current_cycle_used_ticketqa'] },
    {
      ids: ['SM1', 'SM2'],
      l7d: 'l7d_consumed_sentiment_max',
      p7d: 'p7d_consumed_sentiment_max',
      evidence: ['total_consumed_sentiment_max', 'current_cycle_used_sentiment'],
    },
    {
      ids: ['TR1', 'TR2'],
      l7d: 'l7d_consumed_ai_triage',
      p7d: 'p7d_consumed_ai_triage',
      evidence: ['total_consumed_ai_triage', 'current_cycle_used_triage'],
    },
    { ids: ['I2', 'I3'], l7d: 'l7d_consumed_intake', p7d: null, evidence: ['current_cycle_used_intake'] },
  ] as const

  for (const p of products) {
    const active = rows.filter((r) => num(r[p.l7d]) > 0)
    const previous = p.p7d ? rows.filter((r) => num(r[p.p7d as string]) > 0).length : null
    out.set(p.ids[0], {
      value: active.length,
      previous,
      names: active.map((r) => str(r.tenant_name)).filter(Boolean).slice(0, 12),
      // The credit dataset is a snapshot: prior-7d vs last-7d is the only history it carries.
      // A real weekly series needs a small dataset over dw.dws_ai_trace_stat_day_di_view.
      history:
        previous == null
          ? undefined
          : [
              { week: 'p7d', value: previous },
              { week: 'l7d', value: active.length },
            ],
    })

    // Silent = paid, has history on THIS product, zero in the last 7 days. Named for routing.
    const silent = rows.filter(
      (r) =>
        /active paid/i.test(str(r.ai_billing_status)) &&
        p.evidence.some((col) => num(r[col]) > 0) &&
        num(r[p.l7d]) === 0,
    )
    out.set(p.ids[1], {
      value: silent.length,
      previous: null,
      names: silent
        .map((r) => {
          const owner = str(r.csm) || str(r.account_executive)
          return owner ? `${str(r.tenant_name)} (${owner})` : str(r.tenant_name)
        })
        .filter(Boolean)
        .slice(0, 15),
    })
  }
  return out
}

export interface WeekPoint {
  week: string
  value: number
}

type ResolvedHit = {
  value: number | null
  previous: number | null
  names: string[]
  degraded?: boolean
  /** Weekly series, oldest → newest. A scorecard row is a history, not a single number. */
  history?: WeekPoint[]
}
type Resolved = Map<string, ResolvedHit>

/**
 * Subscription products: paying tenants, active/paying ratio, engagement, license utilization —
 * computed PER WEEK across every week the dataset carries (rolling 35 days today), so each row
 * ships its history. Value = latest week, previous = the week before.
 */
function resolveSubscription(rows: Record_[]): { out: Resolved; current: string } {
  const out: Resolved = new Map()
  if (rows.length === 0) return { out, current: '' }

  const weeks = [...new Set(rows.map((r) => str(r.weeks_date)))].filter(Boolean).sort()
  const current = weeks[weeks.length - 1]

  const products = [
    { key: 'bi', retention: 'BI1', ratio: 'BI2', eng: 'BI-ENG' },
    { key: 'bot', retention: 'BO1', ratio: 'BO2', eng: 'BOT-ENG' },
    { key: 'nt', retention: 'N1', ratio: 'N2', eng: 'NEXT_TICKET-ENG' },
    { key: 'at', retention: 'A1', ratio: 'A2', eng: 'ATTENDANCE-ENG' },
  ] as const

  // The ≥80% targets assume a PRODUCT-level paying base (tenants entitled to that product). The
  // dataset carries that base only if its SQL selects the access_<p>_client columns — detect it,
  // and degrade honestly when absent rather than judging against the wrong denominator.
  const hasAccess = 'access_bi_client' in (rows[0] ?? {})

  // tenant → rows, per week (collapses whatever grain the dataset has to tenant grain).
  const tenantsByWeek = new Map<string, Map<string, Record_[]>>()
  for (const r of rows) {
    const week = str(r.weeks_date)
    const code = str(r.tenant_code)
    if (!week || !code) continue
    let map = tenantsByWeek.get(week)
    if (!map) tenantsByWeek.set(week, (map = new Map()))
    const list = map.get(code)
    if (list) list.push(r)
    else map.set(code, [r])
  }

  const series = (calc: (tenants: Map<string, Record_[]>) => number | null): WeekPoint[] =>
    weeks
      .map((week) => {
        const v = calc(tenantsByWeek.get(week) ?? new Map())
        return v == null ? null : { week, value: v }
      })
      .filter((p): p is WeekPoint => p != null)

  const fromSeries = (h: WeekPoint[], extra?: Partial<ResolvedHit>): ResolvedHit => ({
    value: h.length ? h[h.length - 1].value : null,
    previous: h.length > 1 ? h[h.length - 2].value : null,
    names: [],
    history: h,
    ...extra,
  })

  for (const p of products) {
    const flag = `active_${p.key}_client_flag`
    const access = `access_${p.key}_client`
    const score = `client_${p.key}_score`

    // The source is dws_PAYING_client_engagement_score: presence in a week = paying that week.
    // (mrr can be legitimately empty, e.g. Pax8-billed tenants, so it must not gate "paying".)
    // With access flags the base narrows to tenants entitled to THIS product.
    const payingOf = (tenants: Map<string, Record_[]>) =>
      [...tenants.entries()].filter(([, rs]) => !hasAccess || rs.some((r) => flagOn(r[access])))

    out.set(p.retention, fromSeries(series((t) => payingOf(t).length || null), { degraded: !hasAccess }))

    const ratioSeries = series((t) => {
      const paying = payingOf(t)
      if (!paying.length) return null
      const active = paying.filter(([, rs]) => rs.some((r) => flagOn(r[flag])))
      return Math.round((active.length / paying.length) * 1000) / 10
    })
    const currentSilent = payingOf(tenantsByWeek.get(current) ?? new Map())
      .filter(([, rs]) => !rs.some((r) => flagOn(r[flag])))
      .map(([, rs]) => str(rs[0]?.tenant_name))
      .filter(Boolean)
      .slice(0, 12)
    out.set(p.ratio, { ...fromSeries(ratioSeries, { degraded: !hasAccess }), names: currentSilent })

    // Engagement score is already weighted on the dataset — average the tenant-level value.
    out.set(
      p.eng,
      fromSeries(
        series((t) => {
          const scores = [...t.values()]
            .map((rs) => num(rs.find((r) => num(r[score]) > 0)?.[score]))
            .filter((n) => n > 0)
          return scores.length
            ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100
            : null
        }),
      ),
    )
  }

  // N4 — license utilization median. users_limit is the seat count (data-map.md).
  out.set(
    'N4',
    fromSeries(
      series((t) => {
        const util = [...t.values()]
          .map((rs) => {
            const seats = Math.max(...rs.map((r) => num(r.users_limit)))
            const active = Math.max(...rs.map((r) => num(r.active_users)))
            return seats > 0 ? (active / seats) * 100 : null
          })
          .filter((n): n is number => n != null)
          .sort((a, b) => a - b)
        return util.length ? Math.round(util[Math.floor(util.length / 2)] * 10) / 10 : null
      }),
    ),
  )

  return { out, current: current ?? '' }
}

interface Hit {
  value: number | null
  previous: number | null
  names: string[]
  /** True when the value was computed against a coarser base than its target assumes. */
  degraded?: boolean
  history?: WeekPoint[]
}

/** Monday of the current week, YYYY-MM-DD — points at or after it belong to the in-progress week. */
function currentWeekMonday(): string {
  const now = new Date()
  const monday = new Date(now.getTime() - (((now.getUTCDay() + 6) % 7) * 24 + now.getUTCHours()) * 3600 * 1000)
  return monday.toISOString().slice(0, 10)
}

/**
 * AI active tenants per calendar week, per product — the spec's own definition of the T1-family
 * rows. The in-progress week is dropped: a 3-day-old week always reads as a dip and would put a
 * fake red on every sparkline tail.
 */
function resolveAiWeekly(rows: Record_[]): Resolved {
  const out: Resolved = new Map()
  const products = [
    { id: 'T1', col: 'credits_ticketqa' },
    { id: 'SM1', col: 'credits_sentiment_max' },
    { id: 'TR1', col: 'credits_ai_triage' },
    { id: 'I2', col: 'credits_intake' },
  ] as const

  const cutoff = currentWeekMonday()
  const weeks = [...new Set(rows.map((r) => str(r.weeks_date).slice(0, 10)))]
    .filter((w) => w && w < cutoff)
    .sort()
  if (!weeks.length) return out

  for (const p of products) {
    const history: WeekPoint[] = weeks.map((week) => ({
      week,
      value: new Set(
        rows
          .filter((r) => str(r.weeks_date).slice(0, 10) === week && num(r[p.col]) > 0)
          .map((r) => str(r.tenant_code)),
      ).size,
    }))
    const latest = weeks[weeks.length - 1]
    const names = [
      ...new Set(
        rows
          .filter((r) => str(r.weeks_date).slice(0, 10) === latest && num(r[p.col]) > 0)
          .map((r) => str(r.tenant_name) || str(r.tenant_code)),
      ),
    ]
      .filter(Boolean)
      .slice(0, 12)
    out.set(p.id, {
      value: history[history.length - 1].value,
      previous: history.length > 1 ? history[history.length - 2].value : null,
      names,
      history,
    })
  }
  return out
}

/** Narrows to a resolved hit, so the caller cannot read a value that was never computed. */
function hasValue(hit: Hit | null | undefined): hit is Hit & { value: number } {
  return hit != null && hit.value != null
}

export async function buildScorecard(auth: AuthHeaders): Promise<ScorecardResult> {
  const sources: ScorecardResult['sources'] = []

  const { values } = await readSettings()
  const ctx: ReadContext = {
    mode: values.public_api_key ? 'public' : 'token',
    apiKey: values.public_api_key,
    auth,
  }

  const load = async (id: string) => {
    try {
      const rows = await readAll(id, ctx)
      sources.push({ dataset: id, rows: rows.length, ok: true })
      return rows
    } catch (error) {
      sources.push({ dataset: id, rows: 0, ok: false, error: (error as Error).message })
      // Deliberately null, never []: an empty array would flow into the resolvers and produce
      // zeros, which judge() would then score as green (0 silent tenants "meets" a target of 0).
      return null
    }
  }

  const [aiRows, productRows, aiWeeklyRows] = await Promise.all([
    load(values['dataset.ai_credit']),
    load(values['dataset.weekly_metrics']),
    load(values['dataset.ai_weekly']),
  ])

  const ai = aiRows ? resolveAi(aiRows) : null
  const aiWeekly = aiWeeklyRows ? resolveAiWeekly(aiWeeklyRows) : null
  const sub = productRows ? resolveSubscription(productRows) : null
  const subMap = sub?.out ?? null
  const week = sub?.current ?? ''

  const rows: ScorecardRow[] = ROWS.map((def) => {
    // The weekly series is the spec's own definition for the AI active rows, so it wins there;
    // the credit snapshot keeps the silent-paid rows and serves as fallback when weekly fails.
    const hit = aiWeekly?.get(def.id) ?? ai?.get(def.id) ?? subMap?.get(def.id) ?? null

    if (def.kind === 'unsourced' || def.kind === 'manual' || def.kind === 'pending') {
      return { ...def, value: null, previous: null, status: 'nodata', reason: def.note ?? 'no source yet' }
    }
    if (!hasValue(hit)) {
      const failed = sources.find((s) => !s.ok)
      return {
        ...def,
        value: null,
        previous: null,
        status: 'nodata',
        reason: failed ? `source unavailable: ${failed.error}` : 'the source returned no rows for this row',
      }
    }
    if (hit.degraded) {
      // Denominator mismatch: the ≥80% targets assume the product-level paying base, but the
      // dataset lacks the access_<p>_client columns, so the base here is ALL paying tenants.
      // A red against the wrong base is a fake red — show the number, skip the verdict.
      return {
        ...def,
        value: hit.value,
        previous: hit.previous ?? null,
        status: 'display',
        names: hit.names?.length ? hit.names : undefined,
        history: hit.history,
        reason:
          'measured against the FULL paying base — add access_bi/bot/nt/at_client to the weekly ' +
          "dataset SQL to restore the product-level base this row's target assumes",
      }
    }
    return {
      ...def,
      value: hit.value,
      previous: hit.previous ?? null,
      status: judge(hit.value, hit.previous ?? null, def),
      names: hit.names?.length ? hit.names : undefined,
      history: hit.history,
    }
  })

  // H1 / H3 describe the board itself, so they are computed from it.
  const judged = rows.filter((r) => r.status !== 'display')
  const withData = judged.filter((r) => r.status !== 'nodata')
  const completeness = judged.length ? Math.round((withData.length / judged.length) * 1000) / 10 : null
  const onTrack = withData.length
    ? Math.round((withData.filter((r) => r.status === 'green').length / withData.length) * 1000) / 10
    : null

  for (const row of rows) {
    if (row.id === 'H1' && completeness != null) {
      row.value = completeness
      row.previous = null
      row.status = judge(completeness, null, row)
      row.reason = undefined
    }
    if (row.id === 'H3' && onTrack != null) {
      row.value = onTrack
      row.status = 'display'
      row.reason = undefined
    }
  }

  return { week, rows, sources }
}

export const STATUS_ORDER: Record<RowStatus, number> = { red: 0, yellow: 1, nodata: 2, green: 3, display: 4 }

export function compareForBoard(a: ScorecardRow, b: ScorecardRow): number {
  return STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.id.localeCompare(b.id)
}

export type { Compare }
