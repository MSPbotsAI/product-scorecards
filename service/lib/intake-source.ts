// Shape of the upstream ATI report file, mirrored as types.
//
// This is the *raw* contract — what `scripts/build-intake-snapshot.mjs` copies in verbatim. The
// derived, browser-facing shape lives in `intake.ts`. Keeping them apart means the upstream file can
// gain fields without the API changing, and the API can change without touching the snapshot.
//
// Every human-readable field is bilingual by an `_en` suffix convention: `note` is Chinese, `note_en`
// is English, and a missing `_en` means "fall back to the Chinese". `pick()` in intake.ts is the one
// place that resolves it.

/** A bilingual pair as the upstream file stores it: `k` is zh, `k_en` is en. */
export type Bilingual<K extends string> = { [P in K]: string } & { [P in `${K}_en`]?: string }

export type StageKey = 'lost' | 'interest' | 'onboarded' | 'selftest' | 'livecalls' | 'pricing' | 'won'
export type EventState = 'held' | 'cancelled' | 'norecord' | 'upcoming' | 'noinvite'
export type TrackId = 'alpha' | 'prospect'

export interface RawStage {
  label: string
  label_en?: string
  desc: string
  desc_en?: string
  /** Progress along the ladder, 0–100. Also the sort order. */
  pct: number
}

export interface RawState {
  label: string
  label_en?: string
  desc: string
  desc_en?: string
}

export interface RawTrack {
  id: string
  label: string
  label_en?: string
  desc: string
  desc_en?: string
}

export interface RawEvent {
  /** YYYY-MM-DD. */
  date: string
  /** HH:MM, UTC. May be absent. */
  time?: string
  state: string
  title?: string
  /** Why a session was cancelled / has no record. */
  reason?: string
  reason_en?: string
  note?: string
  note_en?: string
  /** Fathom recording URL, when one exists. */
  fathom?: string
  /** Repo-relative path to the meeting notes. */
  transcript?: string
  /** Repo-relative path to the email that scheduled or cancelled it. */
  email?: string
  /** Vanished from the calendar with no cancellation on record — the worst kind of no-show. */
  silent?: boolean
  churn?: boolean
  requested_by?: string
}

export interface RawClient {
  name: string
  track: string
  stage: string
  contact?: string
  status?: string
  cadence?: string
  cadence_en?: string
  /** Why this client sits on this rung — cites recordings, emails, timestamps. */
  stage_evidence?: string
  stage_evidence_en?: string
  next_action?: string
  next_action_en?: string
  lost_reason?: string
  lost_reason_en?: string
  /** How and when a lost deal said no, with the customer's own words. */
  rejection?: {
    channel?: string
    date?: string
    who?: string
    who_en?: string
    /**
     * Verbatim. Usually already English (`quote_en` absent means "this is what they wrote"); the two
     * that carry a translation were said in another language.
     */
    quote?: string
    quote_en?: string
    ref?: string
    ref_en?: string
  }
  note?: string
  note_en?: string
  events?: RawEvent[]
  pipeline_key?: string
  ticket_keys?: string[]
  ticket_match?: string[]
  email_domain?: string
}

export interface RawRoleAction {
  role: string
  role_en?: string
  subtitle?: string
  subtitle_en?: string
  owners?: { name: string; email?: string; initials?: string; slug?: string }[]
  items?: {
    pri?: string
    pri_en?: string
    title: string
    title_en?: string
    why?: string
    why_en?: string
    /** What closing this item looks like. Named `do` upstream, not `action`. */
    do?: string
    do_en?: string
  }[]
}

export interface RawMeta {
  title?: string
  title_en?: string
  window: { from: string; to: string }
  generated_for?: string
  stages: Record<string, RawStage>
  states: Record<string, RawState>
  tracks: RawTrack[]
  sources?: { layer: string; layer_en?: string; source: string; source_en?: string; detail?: string; detail_en?: string }[]
  /** Long-form口径 notes. Rendered verbatim — they are the report's own caveats. */
  [key: string]: unknown
}

export interface RawSnapshot {
  /** Evaluation date this snapshot was built against. Everything time-relative derives from it. */
  asOf: string
  sourceGeneratedFor: string | null
  source: string
  meta: RawMeta
  clients: RawClient[]
  roleActions: RawRoleAction[]
  openQuestions: string[]
  openQuestionsEn: string[]
}
