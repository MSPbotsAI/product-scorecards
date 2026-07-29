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
import { ROWS, type Compare, type RowDef } from './rows.ts'

export const AI_CREDIT_DATASET = '1985255723050872834'
/**
 * Product Scorecard Weekly Metrics — created for this app on 2026-07-29 (by Micus, in the dataset
 * editor). A tenant×week projection of `dws_paying_client_engagement_score` over a rolling 35-day
 * window (~2.5k rows). The full Product Metric Dataset (1793541682307964929) is tenant×user×week
 * with ~929k rows of history — unreadable through the paged API by design, so it is NOT read here.
 */
export const WEEKLY_METRICS_DATASET = process.env.WEEKLY_METRICS_DATASET ?? '2082466110929776641'

const PAGE_SIZE = 500
const MAX_PAGES = 20

export type RowStatus = 'green' | 'yellow' | 'red' | 'display' | 'nodata'

export interface ScorecardRow extends RowDef {
  value: number | null
  previous: number | null
  status: RowStatus
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

const report = createMspbotsReportClient({
  mspbots_client_host: process.env.MSPBOTS_REPORT_HOST ?? 'https://app.mspbots.ai/web/reports',
  public_api_key: process.env.PUBLIC_API_KEY,
})

/**
 * Two ways in, and the environment decides which:
 *
 * - **token** — read as the calling user. Works when the app is served from the platform origin,
 *   because only then does the browser hold a platform session to forward.
 * - **public** — read with the app's own `PUBLIC_API_KEY`. Required off-platform (local dev), where
 *   no user session is obtainable: production's login app has no route that will hand a token to a
 *   localhost origin, and a token from the int environment cannot read production datasets.
 */
export const READ_MODE: 'public' | 'token' = process.env.PUBLIC_API_KEY ? 'public' : 'token'

type Record_ = Record<string, unknown>

const num = (v: unknown): number => {
  const n = typeof v === 'number' ? v : Number(String(v ?? '').replace(/,/g, ''))
  return Number.isFinite(n) ? n : 0
}
const str = (v: unknown): string => (v == null ? '' : String(v))
/** Dataset booleans arrive as true/'true'/'t'/1/'1' depending on the column — never as a guaranteed number. */
const flagOn = (v: unknown): boolean => v === true || num(v) > 0 || /^(t|true|yes|y)$/i.test(str(v))

/**
 * The platform answers auth and query errors with HTTP 200 and a non-zero `code` in the envelope
 * (e.g. `{"code":"401","msg":"token not userID."}`). Treating that as an empty result is how a
 * broken read turns into a confident zero, so the envelope is checked before the rows are read.
 */
function unwrap(res: Record_, datasetId: string): Record_ {
  const code = res?.code
  if (code != null && !['0', '200', 'success'].includes(String(code).toLowerCase())) {
    throw new Error(`dataset ${datasetId} refused the read (code ${code}): ${str(res?.msg) || 'no message'}`)
  }
  return (res?.data ?? res) as Record_
}

/** Dev-only: the envelope's keys, the row-array key, one row's field names, and the total. No values. */
export async function probeShape(datasetId: string, size = 1) {
  const res = (await (READ_MODE === 'public'
    ? report.getPublicDatasetData(datasetId, { current: 1, size })
    : Promise.reject(new Error('shape probe is public-mode only')))) as Record_
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

/** Read every page of a dataset, or fail loudly rather than return a partial or empty set. */
async function readAll(datasetId: string, auth: AuthHeaders): Promise<Record_[]> {
  const out: Record_[] = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const query = { current: page, size: PAGE_SIZE }
    const res = (READ_MODE === 'public'
      ? await report.getPublicDatasetData(datasetId, query)
      : await report.getDatasetData(datasetId, query, auth)) as Record_
    const payload = unwrap(res, datasetId)
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
function resolveAi(rows: Record_[]): Map<string, { value: number; previous: number | null; names: string[] }> {
  const out = new Map<string, { value: number; previous: number | null; names: string[] }>()
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

type Resolved = Map<string, { value: number | null; previous: number | null; names: string[]; degraded?: boolean }>

/** Subscription products: paying tenants, active/paying ratio, engagement — off the product dataset. */
function resolveSubscription(rows: Record_[]): { out: Resolved; current: string } {
  const out: Resolved = new Map()
  if (rows.length === 0) return { out, current: '' }

  const weeks = [...new Set(rows.map((r) => str(r.weeks_date)))].filter(Boolean).sort()
  const current = weeks[weeks.length - 1]
  const prior = weeks.length > 1 ? weeks[weeks.length - 2] : null

  const byWeek = (week: string | null) => (week ? rows.filter((r) => str(r.weeks_date) === week) : [])

  const products = [
    { key: 'bi', retention: 'BI1', ratio: 'BI2', eng: 'BI-ENG' },
    { key: 'bot', retention: 'BO1', ratio: 'BO2', eng: 'BOT-ENG' },
    { key: 'nt', retention: 'N1', ratio: 'N2', eng: 'NEXT_TICKET-ENG' },
    { key: 'at', retention: 'A1', ratio: 'A2', eng: 'ATTENDANCE-ENG' },
  ] as const

  // The ≥80% targets assume a PRODUCT-level paying base (tenants entitled to that product). The
  // dataset carries that base only if its SQL selects the access_<p>_client columns — detect it,
  // and degrade honestly when absent rather than judging against the wrong denominator.
  const first = rows[0] ?? {}
  const hasAccess = 'access_bi_client' in first

  // One row per tenant per week: collapse the user grain first.
  const tenants = (week: string | null) => {
    const map = new Map<string, Record_[]>()
    for (const r of byWeek(week)) {
      const code = str(r.tenant_code)
      if (!code) continue
      const list = map.get(code)
      if (list) list.push(r)
      else map.set(code, [r])
    }
    return map
  }
  const currentTenants = tenants(current)
  const priorTenants = tenants(prior)

  for (const p of products) {
    const flag = `active_${p.key}_client_flag`
    const access = `access_${p.key}_client`
    const score = `client_${p.key}_score`

    // The source is dws_PAYING_client_engagement_score: presence in a week = paying that week.
    // (mrr can be legitimately empty, e.g. Pax8-billed tenants, so it must not gate "paying".)
    // With access flags the base narrows to tenants entitled to THIS product.
    const paying = [...currentTenants.entries()].filter(
      ([, rs]) => !hasAccess || rs.some((r) => flagOn(r[access])),
    )
    const payingPrior = [...priorTenants.entries()].filter(
      ([, rs]) => !hasAccess || rs.some((r) => flagOn(r[access])),
    )
    const activePaying = paying.filter(([, rs]) => rs.some((r) => flagOn(r[flag])))

    out.set(p.retention, {
      value: paying.length || null,
      previous: payingPrior.length || null,
      names: [],
      degraded: !hasAccess,
    })

    out.set(p.ratio, {
      value: paying.length ? Math.round((activePaying.length / paying.length) * 1000) / 10 : null,
      previous: null,
      names: paying
        .filter(([, rs]) => !rs.some((r) => flagOn(r[flag])))
        .map(([, rs]) => str(rs[0]?.tenant_name))
        .filter(Boolean)
        .slice(0, 12),
      degraded: !hasAccess,
    })

    // Engagement score is already weighted on the dataset — average the tenant-level value.
    const scores = [...currentTenants.values()]
      .map((rs) => num(rs.find((r) => num(r[score]) > 0)?.[score]))
      .filter((n) => n > 0)
    out.set(p.eng, {
      value: scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100 : null,
      previous: null,
      names: [],
    })
  }

  // N4 — license utilization. users_limit is the seat count (data-map.md).
  const util = [...currentTenants.values()]
    .map((rs) => {
      const seats = Math.max(...rs.map((r) => num(r.users_limit)))
      const active = Math.max(...rs.map((r) => num(r.active_users)))
      return seats > 0 ? (active / seats) * 100 : null
    })
    .filter((n): n is number => n != null)
    .sort((a, b) => a - b)
  out.set('N4', {
    value: util.length ? Math.round(util[Math.floor(util.length / 2)] * 10) / 10 : null,
    previous: null,
    names: [],
  })

  return { out, current: current ?? '' }
}

interface Hit {
  value: number | null
  previous: number | null
  names: string[]
  /** True when the value was computed against a coarser base than its target assumes. */
  degraded?: boolean
}

/** Narrows to a resolved hit, so the caller cannot read a value that was never computed. */
function hasValue(hit: Hit | null | undefined): hit is Hit & { value: number } {
  return hit != null && hit.value != null
}

export async function buildScorecard(auth: AuthHeaders): Promise<ScorecardResult> {
  const sources: ScorecardResult['sources'] = []

  const load = async (id: string) => {
    try {
      const rows = await readAll(id, auth)
      sources.push({ dataset: id, rows: rows.length, ok: true })
      return rows
    } catch (error) {
      sources.push({ dataset: id, rows: 0, ok: false, error: (error as Error).message })
      // Deliberately null, never []: an empty array would flow into the resolvers and produce
      // zeros, which judge() would then score as green (0 silent tenants "meets" a target of 0).
      return null
    }
  }

  const [aiRows, productRows] = await Promise.all([load(AI_CREDIT_DATASET), load(WEEKLY_METRICS_DATASET)])

  const ai = aiRows ? resolveAi(aiRows) : null
  const sub = productRows ? resolveSubscription(productRows) : null
  const subMap = sub?.out ?? null
  const week = sub?.current ?? ''

  const rows: ScorecardRow[] = ROWS.map((def) => {
    const hit = ai?.get(def.id) ?? subMap?.get(def.id) ?? null

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
