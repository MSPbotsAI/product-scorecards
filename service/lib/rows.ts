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
export type Compare = 'gte' | 'lte' | 'eq' | 'no-decrease' | 'display' | 'band' | 'band-hi'

export interface RowDef {
  id: string
  name: string
  /**
   * Owner per the workshop. The 2026-07-30 L10 applied the EOS rule that every row carries exactly
   * one name: Asset rows moved from unowned to Micus as INTERIM custodian — he answers for red
   * disposition at L10, not for doing the asset work (Kevin may take it back; see metrics.yaml).
   */
  owner: string | null
  /** Product card, or a non-product bucket. */
  group: string
  kind: RowKind
  compare: Compare
  /** Numeric target where one was agreed; null when the row is observation-only. */
  target: number | null
  /** Upper bound of the yellow band; only used with `compare: 'band'` (value <= target -> green, <= yellowMax -> yellow, else red). */
  yellowMax?: number
  /** Lower bound of the yellow band; only used with `compare: 'band-hi'` (value >= target -> green, >= yellowMin -> yellow, else red). */
  yellowMin?: number
  /**
   * When true, `target`/`yellowMin` can be overridden at runtime from the row's own dialog
   * (persisted in `metric_thresholds`, applied on top of these code defaults in buildScorecard()).
   * Only meaningful with `compare: 'band'` / `'band-hi'`.
   */
  thresholdEditable?: boolean
  /**
   * True for a row that is deliberately deferred (e.g. a "coming soon" placeholder with a known
   * future ship date) rather than an open gap to close. Still shown in Gaps, but excluded from
   * H1/H3 and the coverage tile's denominator — it isn't yet an accountability number.
   */
  excludeFromCoverage?: boolean
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
    name: `${label} — active tenants (credit > 0, this week)`,
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
    owner: 'Micus',
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
    owner: 'Micus',
    group: 'asset_library',
    kind: 'unsourced',
    compare: 'lte',
    target: 0,
    unit: 'count',
    targetText: 'red at >=1 (named; custodian dispositions at L10)',
    note: 'Needs weekly per-tenant asset counts; no usage-event source yet.',
  },
  {
    id: 'B3',
    name: 'Asset — dead template inventory',
    owner: 'Micus',
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

/**
 * Evolve MPD — Kevin's own card, defined 2026-09-04. Both rows are manually logged (no dataset
 * backs custom delivery work), entered weekly every Thursday from the row's edit dialog.
 */
const mpdRows: RowDef[] = [
  {
    id: 'M1',
    name: 'Committed deliverables (quarter to date)',
    owner: 'Kevin',
    group: 'mpd',
    kind: 'manual',
    compare: 'band',
    target: 3,
    yellowMax: 5,
    unit: 'count',
    targetText: '<=3 green · <=5 yellow · >5 red',
    note:
      'At the stage of the project where it is generally released with a fixed payment from ' +
      'ConnectWise, the less effort we keep them happy the better.',
    anchor: 'Unit: features per quarter or major meeting milestone — 1 feature scoped to 1-5 business days max',
  },
  {
    id: 'M2',
    name: 'CEO/Daniel escalations (last week)',
    owner: 'Kevin',
    group: 'mpd',
    kind: 'manual',
    compare: 'band',
    target: 0,
    yellowMax: 1,
    unit: 'count',
    targetText: '0 green · 1 yellow · >1 red',
    note:
      'Balancing metric for M1: limiting deliverables only works if expectations are managed ' +
      'accordingly. Red means no action was taken after the initial escalation.',
  },
]

/**
 * Internal Automations — Kevin's second card, defined 2026-09-04. IA1/IA2 are manually logged
 * every Thursday, higher-is-better; IA3/IA4 are locked placeholders until CSM task dispatch ships
 * (target: Oct 2026).
 */
const internalAutomationsRows: RowDef[] = [
  {
    id: 'IA1',
    name: 'Weekly active users (Client Success Hub)',
    owner: 'Kevin',
    group: 'internal_automations',
    kind: 'manual',
    compare: 'band-hi',
    target: 100,
    yellowMin: 21,
    unit: 'percent',
    targetText: '100% green · 21-80% yellow · <=20% red',
  },
  {
    id: 'IA2',
    name: 'New releases (Automations, Custom Reports, Skills & App Features)',
    owner: 'Kevin',
    group: 'internal_automations',
    kind: 'manual',
    compare: 'band-hi',
    target: 2,
    yellowMin: 1,
    unit: 'count',
    thresholdEditable: true,
    targetText: '>1 green · 1 yellow · 0 red',
    note: 'Counts new Automations, Custom Reports, Skills, or App Features shipped in the week.',
  },
  {
    id: 'IA3',
    name: 'CSM task dispatch — accepted count',
    owner: 'Kevin',
    group: 'internal_automations',
    kind: 'pending',
    compare: 'display',
    target: null,
    unit: 'count',
    targetText: 'coming soon — Oct 2026',
    note: 'Higher is better. Threshold and manual entry land with CSM task dispatch (target: Oct 2026).',
    excludeFromCoverage: true,
  },
  {
    id: 'IA4',
    name: 'CSM task dispatch — dismissal rate by inaccuracy',
    owner: 'Kevin',
    group: 'internal_automations',
    kind: 'pending',
    compare: 'display',
    target: null,
    unit: 'percent',
    targetText: 'coming soon — Oct 2026',
    note: 'Lower is better. Threshold and manual entry land with CSM task dispatch (target: Oct 2026).',
    excludeFromCoverage: true,
  },
]

/**
 * SOP Agent Platform (SAP) — metrics.yaml `sap`, rows P1-P8. The card was settled in R2/R3 but was
 * never mirrored here, so the app carried no Agent Platform rows at all.
 *
 * Every source the spec names for this card — HubSpot, Fathom, ClickUp gate records, AI-reviewer
 * logs — is a system this app does not read; its data plane is the MSPbots warehouse. So the rows
 * a named owner can produce by hand are `manual`, entered weekly from the row dialog exactly like
 * Kevin's cards, and the one row the spec has not activated yet stays `pending`. Nothing here is
 * wired to a dataset, and no row may render a zero it did not measure.
 */
const sapRows: RowDef[] = [
  {
    id: 'P1',
    name: 'Qualified alpha candidates (named, in active conversation)',
    owner: 'Micus',
    group: 'sap',
    kind: 'manual',
    compare: 'no-decrease',
    target: null,
    unit: 'count',
    targetText: 'climb to 10 (Client Engagement SOP §1 standard)',
    note:
      'ICP-matched candidates in active conversation, counted in HubSpot. The spec judges movement, ' +
      'not level — 10 is the destination, so a week-over-week drop is the red. Its "flat two weeks ' +
      '-> yellow" rule needs a two-week look-back this app does not judge on.',
    anchor: 'Client Engagement PM SOP §1',
  },
  {
    id: 'P2',
    name: 'Customer discovery / demo calls (this week)',
    owner: 'Micus',
    group: 'sap',
    kind: 'manual',
    compare: 'display',
    target: null,
    unit: 'count',
    targetText: '>=3 (leading indicator — excluded from evaluation)',
    note:
      'SAP-related customer calls held this week; the recordings are in Fathom. Design rule 2: ' +
      'leading activity counts are never red or green.',
  },
  {
    id: 'P3',
    name: 'Pipeline freshness — active candidates updated <=7d',
    owner: 'Micus',
    group: 'sap',
    kind: 'manual',
    compare: 'gte',
    target: 100,
    unit: 'percent',
    targetText: '100%',
    note: 'Share of active candidates whose stage / next step was touched within 7 days (HubSpot).',
  },
  {
    id: 'P4',
    name: 'Gate-1 evidence items closed (this week)',
    owner: 'Micus',
    group: 'sap',
    kind: 'manual',
    compare: 'gte',
    target: 1,
    unit: 'count',
    targetText: '>=1 item/week; two weeks zero progress -> yellow',
    note:
      'Closed items on the Prototype->Alpha checklist, tracked in the ClickUp gate records. This ' +
      'app judges one week at a time, so the spec\'s two-weeks-of-zero escalation is not encoded — ' +
      'a zero week reads red here.',
  },
  {
    id: 'P5',
    name: 'Dev-blocking questions answered <=24h',
    owner: 'Grace',
    group: 'sap',
    kind: 'manual',
    compare: 'gte',
    target: 100,
    unit: 'percent',
    targetText: '100%',
    note: 'Measured from ClickUp comment timestamps on the SAP stories.',
  },
  {
    id: 'P6',
    name: 'Deliverable first-pass rate (U1)',
    owner: 'Grace',
    group: 'sap',
    kind: 'manual',
    compare: 'display',
    target: 80,
    unit: 'percent',
    targetText: '>=80% (Q1 observe only)',
    note:
      'From the AI-reviewer logs. Observation only through Q1 — the universal layer names P6 as its ' +
      'action-testable exception, so switch compare to gte once that period ends.',
    anchor: 'metrics.yaml universal_layer (U1)',
  },
  {
    id: 'P7',
    name: 'Post-freeze AC changes per story (M-SPEC)',
    owner: 'Grace',
    group: 'sap',
    kind: 'pending',
    compare: 'lte',
    target: 1,
    unit: 'count',
    targetText: '<=1',
    excludeFromCoverage: true,
    note:
      'Freeze point = status change to "5c - ready for dev"; source is ClickUp status history plus ' +
      'AC edit history. The spec activates this row when SAP enters story flow — until then it is ' +
      'not yet an accountability number.',
  },
  {
    id: 'P8',
    name: 'Dev-ready runway (weeks)',
    owner: 'Grace',
    group: 'sap',
    kind: 'manual',
    compare: 'band-hi',
    target: 2,
    yellowMin: 1,
    targetText: '>=2 weeks',
    note:
      'Stories sitting in "5b - ready for groom" / "5c - ready for dev" and not started, divided by ' +
      'rolling-4w dev consumption. Below one week the L10 IDS question is Grace\'s Intake/SAP split.',
  },
]

export const ROWS: RowDef[] = [
  ...aiRows,
  ...subscriptionRows,
  ...engagementRows,
  ...unsourcedRows,
  ...sapRows,
  ...mpdRows,
  ...internalAutomationsRows,
]

export const GROUP_LABELS: Record<string, string> = {
  sap: 'SOP Agent Platform',
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
  mpd: 'Evolve MPD',
  internal_automations: 'Internal Automations',
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
