// The scorecard row registry.
//
// `scorecard/metrics.yaml` is the contract; this file is its executable mirror.
// When a row's definition changes there, change it here. Field sources are recorded in
// `scorecard/data-map.md` — do not invent a source, and never let a missing source
// render as a zero (see `kind: 'unsourced'`).

export type RowKind =
  /** Computed from a dataset by a resolver in scorecard.ts. */
  | 'computed'
  /** A verified source exists but the resolver isn't written yet. */
  | 'pending'
  /** No verified source yet — an open TBD. Renders as "no source", never as a number. */
  | 'unsourced'
  /** Filled in by a person before the L10. */
  | 'manual'

/** How a value is judged against its target. `display` rows are never red or green. */
export type Compare = 'gte' | 'lte' | 'eq' | 'no-decrease' | 'display'

export interface RowDef {
  id: string
  name: string
  /** Owner per the workshop. `null` = deliberately unowned (Asset monitoring → L10 IDS). */
  owner: string | null
  /** Product card, or a non-product bucket. */
  group: string
  kind: RowKind
  compare: Compare
  /** Numeric target where one was agreed; null when the row is observation-only. */
  target: number | null
  unit?: 'percent' | 'count' | 'score' | 'ratio' | 'days'
  /** Target as written in the workshop, shown verbatim in the UI. */
  targetText: string
  /** Why a row has no data, when that is the case. Shown in the UI instead of a number. */
  note?: string
  /** SOP / KPI anchor, per the workshop's rule that every metric carries one. */
  anchor?: string
}

const AI_PRODUCTS = [
  { key: 'ticketqa', group: 'tqa', label: 'TicketQA', owner: 'Frank', ids: ['T1', 'T4', 'T5'] },
  { key: 'sentiment_max', group: 'sentiment_max', label: 'Sentiment Max', owner: 'Frank', ids: ['SM1', 'SM2', 'SM3'] },
  { key: 'ai_triage', group: 'triage', label: 'AI Triage', owner: 'Frank', ids: ['TR1', 'TR2', 'TR3'] },
  { key: 'intake', group: 'ticket_intake', label: 'Ticket Intake', owner: 'Grace', ids: ['I2', 'I3', 'I4'] },
] as const

/** AI product rows: active tenants, undispositioned silent paid tenants, ROI. */
const aiRows: RowDef[] = AI_PRODUCTS.flatMap(({ key, group, label, owner, ids }) => [
  {
    id: ids[0],
    name: `${label} — active tenants (credit > 0, 7d)`,
    owner,
    group,
    kind: 'computed',
    compare: 'no-decrease',
    target: null,
    unit: 'count',
    targetText: 'no WoW net decrease',
  },
  {
    id: ids[1],
    name: `${label} — silent paid tenants, undispositioned`,
    owner,
    group,
    kind: 'computed',
    compare: 'lte',
    target: 0,
    unit: 'count',
    targetText: '0',
    note:
      'Computed as paid with zero 7d consumption. The agreed rule is 14 days zero plus >1 week ' +
      'without disposition — the 14-day window needs the daily fact table, and disposition is ' +
      'manual state this app does not yet store.',
  },
  {
    id: ids[2],
    name: `${label} — ROI (rolling 4w revenue ÷ labor)`,
    owner,
    group,
    kind: 'pending',
    compare: 'display',
    target: null,
    unit: 'ratio',
    targetText: 'observation; threshold at quarterly EOS',
    note: `Labor comes from ClickUp time entries on Timesheet Project. Revenue side needs the credit price.`,
  },
])

const SUBSCRIPTION_PRODUCTS = [
  { key: 'bi', group: 'bi', label: 'BI', retention: 'BI1', ratio: 'BI2', roi: 'BI3' },
  { key: 'bot', group: 'bot', label: 'Bot', retention: 'BO1', ratio: 'BO2', roi: 'BO3' },
  { key: 'nt', group: 'next_ticket', label: 'NextTicket', retention: 'N1', ratio: 'N2', roi: 'N3' },
  { key: 'at', group: 'attendance', label: 'Attendance', retention: 'A1', ratio: 'A2', roi: 'A3' },
] as const

/** Subscription product rows: paying retention, active/paying ratio, ROI. */
const subscriptionRows: RowDef[] = SUBSCRIPTION_PRODUCTS.flatMap(({ group, label, retention, ratio, roi }) => [
  {
    id: retention,
    name: `${label} — paying tenants`,
    owner: 'Frank',
    group,
    kind: 'computed',
    compare: 'no-decrease',
    target: null,
    unit: 'count',
    targetText: 'no WoW decrease; red at >=2 churned in a week',
    note: 'Churn confirmation lives in canceled_customers / sys_paying_user_log — not yet wired.',
  },
  {
    id: ratio,
    name: `${label} — active / paying tenants (7d)`,
    owner: 'Frank',
    group,
    kind: 'computed',
    compare: 'gte',
    target: 80,
    unit: 'percent',
    targetText: '>=80%',
    note:
      'Denominator ambiguity, unresolved in the spec: the existing Platform scorecard tracks this ' +
      'against BOTH a product-level paying base and the full paying base, with different targets. ' +
      'This row uses the product-level base.',
  },
  {
    id: roi,
    name: `${label} — ROI (rolling 4w MRR ÷ labor)`,
    owner: 'Frank',
    group,
    kind: 'pending',
    compare: 'display',
    target: null,
    unit: 'ratio',
    targetText: 'observation; threshold at quarterly EOS',
  },
])

/** Engagement score per subscription product — read straight off the dataset, not re-weighted. */
const engagementRows: RowDef[] = SUBSCRIPTION_PRODUCTS.map(({ group, label }) => ({
  id: `${group.toUpperCase()}-ENG`,
  name: `${label} — tenant engagement score`,
  owner: 'Frank',
  group,
  kind: 'computed',
  compare: 'display',
  target: null,
  unit: 'score',
  targetText: 'trend; existing scorecard targets: BI —, Bot 90, NT 15, AT 5',
  anchor: 'Product Usage Dashboards (25kcy-288397)',
}))

/** Rows carried by the spec that this app cannot source yet. Listed so they stay visible. */
const unsourcedRows: RowDef[] = [
  {
    id: 'N4',
    name: 'NextTicket — license utilization (active users ÷ seats)',
    owner: 'Frank',
    group: 'next_ticket',
    kind: 'computed',
    compare: 'gte',
    target: 60,
    unit: 'percent',
    targetText: 'median >=60% (to calibrate)',
  },
  {
    id: 'N5',
    name: 'NextTicket — per-user daily usage frequency',
    owner: 'Frank',
    group: 'next_ticket',
    kind: 'pending',
    compare: 'display',
    target: null,
    targetText: 'median flat or rising',
  },
  {
    id: 'B1',
    name: 'Asset — dependency coverage (template lineage)',
    owner: null,
    group: 'asset_library',
    kind: 'unsourced',
    compare: 'display',
    target: null,
    unit: 'percent',
    targetText: 'red at -5pp trend',
    note:
      'The template catalog and two-hop clone lineage are known (business_type=\'Template\'; ' +
      'original_id + parent original_id). The per-tenant asset USAGE events are not: the dataset ' +
      'that would carry them is Requested and empty.',
  },
  {
    id: 'B2',
    name: 'Asset — tenants that dropped a dependency band',
    owner: null,
    group: 'asset_library',
    kind: 'unsourced',
    compare: 'lte',
    target: 0,
    unit: 'count',
    targetText: 'red at >=1 (named, to IDS)',
    note: 'Needs weekly per-tenant asset counts; no usage-event source yet.',
  },
  {
    id: 'B3',
    name: 'Asset — dead template inventory',
    owner: null,
    group: 'asset_library',
    kind: 'pending',
    compare: 'display',
    target: null,
    unit: 'percent',
    targetText: 'trend display only',
    note: 'Sourceable from "Asset usage by MSP size" (1879106462136016897): items with used_tenant = 0.',
  },
  {
    id: 'SM4',
    name: 'Sentiment — negative alerts viewed within 7d',
    owner: 'Frank',
    group: 'sentiment_max',
    kind: 'unsourced',
    compare: 'gte',
    target: null,
    unit: 'percent',
    targetText: 'to be set',
    note: 'Telemetry debt: alert view/act events do not exist (SOP Action 14).',
  },
  {
    id: 'TR4',
    name: 'AI Triage — classifications not manually overridden (4w)',
    owner: 'Frank',
    group: 'triage',
    kind: 'unsourced',
    compare: 'gte',
    target: null,
    unit: 'percent',
    targetText: 'yellow at -5pp, red at -10pp',
    note: 'Pending Grace review: does human-override telemetry exist?',
  },
  {
    id: 'H1',
    name: 'Scorecard data completeness at L10',
    owner: 'Micus',
    group: 'micus_hop',
    kind: 'computed',
    compare: 'gte',
    target: 100,
    unit: 'percent',
    targetText: '100%',
    note: 'Week boundary is Monday — see data-map.md; the existing scorecard is not Sunday-based.',
  },
  {
    id: 'H2',
    name: 'Red-light disposition closure (last week)',
    owner: 'Micus',
    group: 'micus_hop',
    kind: 'manual',
    compare: 'gte',
    target: 100,
    unit: 'percent',
    targetText: '100%',
    note: 'Needs stored disposition state; not yet persisted by this app.',
  },
  {
    id: 'H3',
    name: 'Team on-track share',
    owner: 'Micus',
    group: 'micus_hop',
    kind: 'computed',
    compare: 'display',
    target: null,
    unit: 'percent',
    targetText: 'display-only trend (never an accountability row)',
    anchor: 'workshop design rule 5',
  },
]

export const ROWS: RowDef[] = [...aiRows, ...subscriptionRows, ...engagementRows, ...unsourcedRows]

export const GROUP_LABELS: Record<string, string> = {
  tqa: 'TicketQA',
  sentiment_max: 'Sentiment Max',
  triage: 'AI Triage',
  ticket_intake: 'Ticket Intake',
  bi: 'BI',
  bot: 'Bot',
  next_ticket: 'NextTicket',
  attendance: 'Attendance',
  asset_library: 'Asset Library',
  micus_hop: 'Head of Product',
}

/** Timesheet Project options, pulled live from the ClickUp workspace field on 2026-07-29. */
export const TIMESHEET_PROJECT: Record<string, string[]> = {
  tqa: ['AI Ticket QA - Alpha', 'AI Ticket QA - Beta'],
  sentiment_max: ['AI Sentiment'],
  triage: ['AI Ticket Triage'],
  ticket_intake: ['AI intake'],
  bi: ['BI'],
  bot: ['Bot'],
  next_ticket: ['NT'],
  attendance: ['Attendance'],
}

/** Timesheet Category values that are not direct product labor (workshop design rule 8). */
export const LABOR_EXCLUDED_CATEGORIES = ['Meeting', 'Management', 'Recruitment']
