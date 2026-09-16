// The SOP Agent (Agent Platform) engagement funnel, computed from the engagement store.
//
// Shape of the truth this file reads, and why each number comes from where it does:
//
//   clients/<domain>/profile.md        `stage:` — the client-engagement ladder. The ClickUp board
//                                      (list 901716155627) is a MIRROR of this field, so a number
//                                      computed here and a column count on the board are the same
//                                      measurement, not two that have to be reconciled.
//   clients/<domain>/handoff-note.md   `required_filled` (of 7) / `fields_filled` (of 13). The 7
//                                      required fields are the documented exit test for
//                                      `qualifying` -> `acquisition`.
//   meetings/**/<date>-<slug>.md       held external calls and their `relevance` judgement.
//   _outreach/ledger.json              the email batches — who was mailed and when.
//
// Two rules this file does not bend:
//   - A missing or unreadable source is reported as unavailable, never as zero. An empty funnel
//     and a broken clone look identical in a bar chart; they must not look identical in the data.
//   - A layer the store cannot measure is listed in `gaps` with the field that would fix it,
//     rather than approximated from something nearby.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { ensureStore, type StoreLocation } from './engagement-store.ts'

/* ── frontmatter ──────────────────────────────────────────────────────────────────────────── */

type Front = Record<string, string>

/**
 * The store's frontmatter is deliberately flat `key: value`, with `[a, b]` for the few lists.
 * A YAML dependency would buy nothing here and would start accepting shapes the store never writes.
 */
function frontmatter(path: string): Front | null {
  let text: string
  try {
    text = readFileSync(path, 'utf8')
  } catch {
    return null
  }
  if (!text.startsWith('---')) return null
  const end = text.indexOf('\n---', 3)
  if (end < 0) return null
  const out: Front = {}
  // Split on \r?\n: a CRLF checkout (Windows local dev) leaves \r on every line otherwise,
  // and `.`/`$` in the key regex both refuse to cross it — every key silently fails to parse.
  for (const line of text.slice(4, end).split(/\r?\n/)) {
    const m = /^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/.exec(line)
    if (!m) continue // continuation line of a multi-line value; the keys we read are single-line
    out[m[1]] = m[2].trim().replace(/^"(.*)"$/, '$1')
  }
  return out
}

function num(v: string | undefined): number | null {
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function isDate(v: string | undefined): v is string {
  return !!v && /^\d{4}-\d{2}-\d{2}$/.test(v)
}

function daysSince(iso: string, now: Date): number {
  return Math.floor((now.getTime() - Date.parse(`${iso}T00:00:00Z`)) / 86_400_000)
}

/** ISO-8601 week key (`2026-W37`), the same week boundary the scorecard uses elsewhere. */
function isoWeek(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`)
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1)
  const week = Math.ceil(((d.getTime() - yearStart) / 86_400_000 + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

/* ── model ────────────────────────────────────────────────────────────────────────────────── */

export interface LadderRung {
  key: string
  label: string
  meaning: string
  count: number
  /** Rungs a client passes through; `disqualified` is an exit, not a step, and is excluded. */
  inFlow: boolean
}

export interface ClientRef {
  domain: string
  company: string
  stage: string
  /** Days since the field that best evidences movement — stage_at, last_response or last_updated. */
  ageDays: number | null
  clickupTask: string | null
}

export interface WeekPoint {
  week: string
  held: number
  relevant: number
}

export interface FunnelGap {
  layer: string
  /** What the 2026-09-09 hand analysis measured that the store cannot yet. */
  why: string
  /** The concrete field that would close it. */
  needs: string
}

export interface SapFunnel {
  generatedAt: string
  store: { mode: StoreLocation['mode']; syncedAt: string | null; syncError: string | null }
  ladder: LadderRung[]
  totalClients: number
  committed: { count: number; clients: ClientRef[] }
  meetings: {
    held: number
    relevant: number
    distinctClients: number
    thisWeek: number
    thisWeekRelevant: number
    byWeek: WeekPoint[]
  }
  mail: { accounts: number; batches: { id: string; sentOn: string; sender: string; countSent: number }[] }
  handoff: {
    started: number
    atAcquisitionGate: number
    atCommentGate: number
    closest: { domain: string; company: string; stage: string; required: number; fields: number }[]
  }
  /** `met` clients whose last evidence of movement is older than STALL_DAYS — the real work queue. */
  stalled: { thresholdDays: number; clients: ClientRef[] }
  gaps: FunnelGap[]
  /** Values the scorecard rows read. Kept separate so a row never re-derives a number. */
  metrics: {
    qualifiedCandidates: number
    demoCallsThisWeek: number
    pipelineFreshnessPct: number | null
    activeClients: number
    freshClients: number
  }
}

const LADDER: { key: string; label: string; meaning: string; inFlow: boolean }[] = [
  { key: 'outreach', label: 'Outreach', meaning: 'never engaged back', inFlow: true },
  { key: 'met', label: 'Met', meaning: 'we have talked; not registered', inFlow: true },
  { key: 'qualifying', label: 'Qualifying', meaning: 'wants to continue; handoff note being assembled', inFlow: true },
  { key: 'acquisition', label: 'Acquisition', meaning: 'registered, signed in, handed to David', inFlow: true },
  { key: 'activation', label: 'Activation', meaning: 'an agent actually running — no data source yet', inFlow: true },
  { key: 'retention', label: 'Retention', meaning: 'came back and used it unprompted', inFlow: true },
  { key: 'revenue', label: 'Revenue', meaning: 'invoiced or charged', inFlow: true },
  { key: 'disqualified', label: 'Disqualified', meaning: 'written off', inFlow: false },
]

/** Clients being worked: past outreach, not written off. */
const ACTIVE_STAGES = new Set(['met', 'qualifying', 'acquisition', 'activation', 'retention', 'revenue'])

const FRESH_DAYS = 7
const STALL_DAYS = 14

/**
 * The layers the 2026-09-09 dual-funnel analysis produced by hand. Each is a judgement about a
 * conversation, not a fact in the store — listing them here is how the page says "this is not
 * measured" instead of quietly showing a smaller funnel.
 */
const GAPS: FunnelGap[] = [
  {
    layer: 'C2 · Product-backed',
    why: 'needs "a product-team member actually SPOKE", and the analysis found calendar invitees who never spoke.',
    needs: 'a `product_team_spoke:` boolean on the meeting frontmatter, judged at ingest from the transcript.',
  },
  {
    layer: 'C3 · Commitment',
    why: 'needs "the customer gave an actionable next step on the call".',
    needs: 'a `next_step_given: YYYY-MM-DD` field on the profile — the analysis proposes exactly this.',
  },
  {
    layer: 'Path A/B · DM present',
    why: 'needs the authority of who was in the room at the first substantive pitch.',
    needs: 'a `dm_present:` boolean on the meeting frontmatter, judged from the attendee roles.',
  },
  {
    layer: 'M0a/M1/M2 · Mail replied → booked → held',
    why: 'replies frequently land in Outlook only, so the store sees a subset.',
    needs: 'reply/booking outcomes recorded on the outreach ledger entry, not only the send.',
  },
]

/* ── computation ──────────────────────────────────────────────────────────────────────────── */

function readClients(root: string, now: Date) {
  const dir = join(root, 'clients')
  const counts = new Map<string, number>()
  const committed: ClientRef[] = []
  const stalled: ClientRef[] = []
  const handoff: SapFunnel['handoff']['closest'] = []
  let started = 0
  let atAcquisitionGate = 0
  let atCommentGate = 0
  let total = 0
  let active = 0
  let fresh = 0

  let domains: string[]
  try {
    domains = readdirSync(dir).filter((d) => statSync(join(dir, d)).isDirectory())
  } catch {
    throw new Error(`the store has no clients/ directory at ${dir}`)
  }

  for (const domain of domains.sort()) {
    const profile = frontmatter(join(dir, domain, 'profile.md'))
    if (!profile) continue
    total += 1
    const stage = profile.stage || 'unknown'
    counts.set(stage, (counts.get(stage) ?? 0) + 1)

    // "Moved recently" = the newest date that evidences the ENGAGEMENT moving: the rung changed,
    // they replied, or we contacted them. `last_updated` is deliberately excluded — it is when the
    // sync routine last wrote the file, so including it marks every client fresh forever and the
    // stalled queue comes back empty. (It did, on the first run of this file.)
    const dates = [profile.stage_at, profile.last_response, profile.last_contacted].filter(isDate)
    const ageDays = dates.length ? Math.min(...dates.map((d) => daysSince(d, now))) : null
    const ref: ClientRef = {
      domain,
      company: profile.company || domain,
      stage,
      ageDays,
      clickupTask: profile.clickup_task || null,
    }

    if (ACTIVE_STAGES.has(stage)) {
      active += 1
      if (ageDays != null && ageDays <= FRESH_DAYS) fresh += 1
      if (stage === 'met' && (ageDays == null || ageDays > STALL_DAYS)) stalled.push(ref)
    }
    if (profile.committed_on) committed.push(ref)

    const note = frontmatter(join(dir, domain, 'handoff-note.md'))
    if (note) {
      const required = num(note.required_filled) ?? 0
      const fields = num(note.fields_filled) ?? 0
      if (fields > 0) {
        started += 1
        handoff.push({ domain, company: ref.company, stage, required, fields })
      }
      if (note.acquisition_gate === 'true') atAcquisitionGate += 1
      if (note.card_comment_gate === 'true') atCommentGate += 1
    }
  }

  stalled.sort((a, b) => (b.ageDays ?? 1e9) - (a.ageDays ?? 1e9))
  handoff.sort((a, b) => b.required - a.required || b.fields - a.fields)

  return {
    counts,
    total,
    committed,
    stalled,
    active,
    fresh,
    handoff: { started, atAcquisitionGate, atCommentGate, closest: handoff },
  }
}

function readMeetings(root: string, now: Date) {
  const base = join(root, 'meetings')
  const byWeek = new Map<string, WeekPoint>()
  const clients = new Set<string>()
  let held = 0
  let relevant = 0

  const walk = (dir: string, depth: number): void => {
    let entries: string[]
    try {
      entries = readdirSync(dir)
    } catch {
      return
    }
    for (const entry of entries) {
      const p = join(dir, entry)
      let st
      try {
        st = statSync(p)
      } catch {
        continue
      }
      if (st.isDirectory()) {
        // `internal` is our own huddles and `_series` is a timeline index, not occurrences.
        if (depth === 0 && (entry === 'internal' || entry.startsWith('_'))) continue
        walk(p, depth + 1)
        continue
      }
      if (!entry.endsWith('.md') || entry.includes('.transcript.') || entry.includes('.eval.')) continue
      const f = frontmatter(p)
      if (!f) continue

      // A call is held when it says so, OR when a Fathom recording exists for it: the 88 files
      // written before `status:` was introduced carry no status but do carry a callId, and
      // counting only `status: held` silently loses three quarters of the history.
      const isHeld = f.status === 'held' || (f.source === 'fathom' && !!f.callId)
      if (!isHeld) continue
      held += 1
      if (f.domain) clients.add(f.domain)

      // `relevance` is the routine's own judgement of whether the call was about the SOP Agent.
      // high|medium is the store's nearest equivalent of the analysis's "substantively pitched" —
      // near, not identical, which is why C1 is labelled a proxy on the page.
      const isRelevant = f.relevance === 'high' || f.relevance === 'medium'
      if (isRelevant) relevant += 1

      if (isDate(f.date)) {
        const week = isoWeek(f.date)
        const point = byWeek.get(week) ?? { week, held: 0, relevant: 0 }
        point.held += 1
        if (isRelevant) point.relevant += 1
        byWeek.set(week, point)
      }
    }
  }
  walk(base, 0)

  const nowWeek = isoWeek(now.toISOString().slice(0, 10))
  const current = byWeek.get(nowWeek)
  return {
    held,
    relevant,
    distinctClients: clients.size,
    thisWeek: current?.held ?? 0,
    thisWeekRelevant: current?.relevant ?? 0,
    byWeek: [...byWeek.values()].sort((a, b) => a.week.localeCompare(b.week)).slice(-13),
  }
}

function readMail(root: string): SapFunnel['mail'] {
  const path = join(root, '_outreach', 'ledger.json')
  if (!existsSync(path)) return { accounts: 0, batches: [] }
  try {
    const raw = JSON.parse(readFileSync(path, 'utf8')) as {
      batches?: {
        id?: string
        sent_on?: string | null
        sender?: string
        count_sent?: number
        emails?: { to?: string[] }[]
      }[]
    }
    // A batch with no send date is planned, not sent (batch-3 as of 2026-09-09). Counting it would
    // report outreach that has not happened.
    const sent = (raw.batches ?? []).filter((b) => !!b.sent_on)
    const batches = sent.map((b) => ({
      id: String(b.id ?? ''),
      sentOn: String(b.sent_on ?? ''),
      sender: String(b.sender ?? ''),
      countSent: Number(b.count_sent ?? 0),
    }))
    // Distinct recipients, not the sum of sends: batch 2 re-touched accounts batch 1 already had.
    const accounts = new Set<string>()
    for (const b of sent) {
      for (const email of b.emails ?? []) {
        for (const to of email.to ?? []) if (to) accounts.add(to)
      }
    }
    return { accounts: accounts.size, batches }
  } catch {
    return { accounts: 0, batches: [] }
  }
}

/**
 * Build the whole funnel. Throws when the store is unreachable — the caller turns that into an
 * error the page shows, because a funnel of zeros would be read as "the pipeline died".
 */
export async function buildSapFunnel(tenantId: string, refresh = false): Promise<SapFunnel> {
  const store = await ensureStore(tenantId, refresh)
  if (!store) {
    throw new Error('the engagement store is not configured — set store.git_url (and a token for the private repo) on the Settings page')
  }

  const now = new Date()
  const clients = readClients(store.path, now)
  const meetings = readMeetings(store.path, now)
  const mail = readMail(store.path)

  const ladder: LadderRung[] = LADDER.map((rung) => ({ ...rung, count: clients.counts.get(rung.key) ?? 0 }))
  // A stage the store starts writing that this build doesn't know about must still be visible.
  for (const [key, count] of clients.counts) {
    if (!LADDER.some((r) => r.key === key)) {
      ladder.push({ key, label: key, meaning: 'not a known rung — the store writes it, this app does not model it', count, inFlow: false })
    }
  }

  const qualifiedCandidates =
    (clients.counts.get('qualifying') ?? 0) +
    (clients.counts.get('acquisition') ?? 0) +
    (clients.counts.get('activation') ?? 0) +
    (clients.counts.get('retention') ?? 0) +
    (clients.counts.get('revenue') ?? 0)

  return {
    generatedAt: now.toISOString(),
    store: { mode: store.mode, syncedAt: store.syncedAt, syncError: store.syncError },
    ladder,
    totalClients: clients.total,
    committed: { count: clients.committed.length, clients: clients.committed },
    meetings,
    mail,
    handoff: clients.handoff,
    stalled: { thresholdDays: STALL_DAYS, clients: clients.stalled },
    gaps: GAPS,
    metrics: {
      qualifiedCandidates,
      demoCallsThisWeek: meetings.thisWeekRelevant,
      pipelineFreshnessPct: clients.active ? Math.round((clients.fresh / clients.active) * 1000) / 10 : null,
      activeClients: clients.active,
      freshClients: clients.fresh,
    },
  }
}
