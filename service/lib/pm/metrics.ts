/**
 * The PM scorecard: three numbers, and the fourth kept beside them.
 *
 *   response  PM first response — every arrival into the PM's queue, to the PM's first reply to the
 *             customer, or hand-off out of the queue with a private note. Each arrival is its own
 *             measurement: a ticket that comes back is answered again.
 *   prd       Requirement into development — first arrival into the queue, to the first ClickUp PRD
 *             link the PM posts on the ticket.
 *   mb        Bug into development — the same clock, to the PM's own hand-off into development:
 *             moving the ticket to Lucas (the bug intake) or anyone in Development, or posting a
 *             ClickUp MB link, whichever comes first. The MB link Lucas logs afterwards is his time,
 *             not the PM's, so it does not stop this clock (decided by the PM, 2026-10-09). Kept apart
 *             from prd because bugs and requirements move at different speeds.
 *   canny     Requirement to Canny — first arrival, to the first Canny post link the PM posts
 *             (a new post or an existing one).
 *
 * All durations are PM working time (workTime.ts). Each measurement is reported in the week its END
 * lands in, so a finished week's numbers never move again. Nothing is averaged that is not also
 * listed: every counted row is shown behind its number, and every row that is not counted is shown
 * with the reason — a waiting ticket left out of an average is how an average lies.
 */
import { PM_NAME, inQueue, type Party, type PmEvent } from './actions.ts'
import { type EventStore, coverage } from './store.ts'
import { type WeekShape, isWorkday, localDate, weekLabel, weekOf, weekShape, weeksBetween, workingHoursBetween } from './workTime.ts'

/** How far apart a hand-off and its private note may be and still be one act. Observed gaps are seconds. */
const PAIR_WINDOW_MS = 30 * 60_000

export type CycleOutcome =
  /** Counted: the PM emailed the customer. */
  | 'replied'
  /** Counted: the PM moved the ticket out of the queue and left a private note. */
  | 'handed-off'
  /** Not yet answered — shown with its working-time age so far. */
  | 'open'
  /** The PM moved it out with no private note: the definition asks for both. */
  | 'no-note'
  /** Someone other than the PM moved it out before the PM responded. */
  | 'taken-out'
  /** Resolved or closed before any response. */
  | 'closed'

export interface ResponseRow {
  ticket: string
  summary: string
  client: string
  arrivedAt: string
  /** Who moved it in, "Support · Kinn Maagad"; null when the move note did not name both ends. */
  arrivedFrom: string | null
  outcome: CycleOutcome
  endedAt: string | null
  /** Working hours arrival → response when counted; arrival → now when open; null otherwise. */
  hours: number | null
  /** The week it is reported in; null only for open cycles, which have not landed anywhere yet. */
  week: string | null
  /**
   * What ended the cycle, as facts rather than a sentence, so the page can word them in either
   * language: the Halo action ("Email User", "Re-Assign", "Resolved"…), where a move sent the
   * ticket, and who made the move when it was not the PM. All null while the cycle is open.
   */
  action: string | null
  to: string | null
  by: string | null
  /** Set when a counted response scored exactly zero because the working clock had not started. */
  offClock: OffClock
}

/**
 * Why a counted duration is exactly zero: the reply, hand-off or link came before the working clock
 * started — on a rest day, or outside 09:00–18:00 — for a ticket that arrived in the same off-hours
 * stretch. Such a row stays in the average as 0.0 h (decided by the PM, 2026-10-09: "even on a
 * holiday, if I replied, it counts"); the label exists so a 0.0 h row is not read as a data error.
 */
export type OffClock = 'rest-day' | 'after-hours' | null

function offClock(hours: number | null, endIso: string): OffClock {
  if (hours !== 0) return null
  return isWorkday(localDate(Date.parse(endIso))) ? 'after-hours' : 'rest-day'
}

export type EntryKind = 'prd' | 'mb' | 'canny'
export type EntryStatus =
  | 'counted'
  /** The ticket was created before the log starts, so its first arrival cannot be known. */
  | 'history-before-data'
  /** The history is complete but shows no arrival before the link — created straight into the queue. */
  | 'no-arrival-on-record'

export interface EntryRow {
  ticket: string
  summary: string
  client: string
  kind: EntryKind
  /** How the clock stopped: a link the PM posted, or (bugs only) the PM's hand-off into development. */
  via: 'link' | 'handoff'
  /** "PRD-19414", "MB-12057", a Canny post path, or for a hand-off the receiving party. */
  ref: string
  arrivedAt: string | null
  at: string
  hours: number | null
  week: string
  status: EntryStatus
  /** Set when a counted entry scored exactly zero because the working clock had not started. */
  offClock: OffClock
}

export interface Stat {
  n: number
  meanHours: number | null
  medianHours: number | null
}

export interface WeekRow {
  monday: string
  label: string
  /** 'coverage' = the log starts mid-week; 'in-progress' = the week is not over yet. */
  partial: 'coverage' | 'in-progress' | null
  /** How much working time the week holds — holidays and make-up days make it differ from five. */
  shape: WeekShape
  response: Stat
  prd: Stat
  mb: Stat
  canny: Stat
}

const party = (p?: Party): string | null => (p ? `${p.dept} · ${p.person}` : null)
const byTime = (a: PmEvent, b: PmEvent) => Date.parse(a.at) - Date.parse(b.at) || a.seq - b.seq
const isArrival = (e: PmEvent) => e.outcome === 'Re-Assign' && inQueue(e.to) && !inQueue(e.from)
const isDeparture = (e: PmEvent) => e.outcome === 'Re-Assign' && inQueue(e.from) && !inQueue(e.to)
const isReply = (e: PmEvent) => e.who === PM_NAME && (e.outcome === 'Email User' || e.outcome === 'Email Update')
const isClose = (e: PmEvent) => e.who === PM_NAME && (e.outcome === 'Resolved' || e.outcome === 'Close')
const later = (a: string, b: string) => (Date.parse(a) >= Date.parse(b) ? a : b)

/** Lucas takes bugs in for development; a move to him, or to anyone in Development, puts a bug into dev. */
const BUG_INTAKE = 'Lucas Chen'
const toDevelopment = (p?: Party) => !!p && (p.person === BUG_INTAKE || p.dept === 'Development')
const isBugHandoff = (e: PmEvent) => e.who === PM_NAME && isDeparture(e) && toDevelopment(e.to)

/**
 * Walk one ticket's timeline and cut it into arrival → first-response cycles.
 *
 * The ticket is "out" until something moves it into the queue. A reply closes the cycle and leaves
 * the ticket "answered" in the queue; a further message from the customer is not a new arrival —
 * only a move into the queue from outside is. A ticket already in the queue when the log begins
 * starts "out" by assumption, so its responses have no start and are simply not measured.
 */
function cycles(ticket: string, evs: PmEvent[], meta: { summary: string; client: string }, now: string): ResponseRow[] {
  const notes = evs.filter((e) => e.who === PM_NAME && e.outcome === 'Private Note')
  const noteNear = (atMs: number, notBefore: number) => {
    let best: PmEvent | null = null
    let bestGap = Number.POSITIVE_INFINITY
    for (const n of notes) {
      const t = Date.parse(n.at)
      if (t < notBefore) continue
      const gap = Math.abs(t - atMs)
      if (gap <= PAIR_WINDOW_MS && gap < bestGap) {
        best = n
        bestGap = gap
      }
    }
    return best
  }

  const rows: ResponseRow[] = []
  let state: 'out' | 'open' | 'answered' = 'out'
  let cur: { arrivedAt: string; arrivedFrom: string | null } | null = null
  const close = (
    outcome: CycleOutcome,
    endedAt: string,
    end: { action: string; to?: string | null; by?: string },
    hours: number | null,
  ) => {
    if (!cur) return
    const isCounted = outcome === 'replied' || outcome === 'handed-off'
    rows.push({
      ticket,
      ...meta,
      ...cur,
      outcome,
      endedAt,
      hours,
      week: weekOf(endedAt),
      action: end.action,
      to: end.to ?? null,
      by: end.by ?? null,
      offClock: isCounted ? offClock(hours, endedAt) : null,
    })
    cur = null
  }

  for (const e of evs) {
    if (isArrival(e)) {
      // An arrival while already open is a duplicate move; keep the first. An arrival while answered
      // means the ticket left by a route the log did not see, so it starts a fresh cycle.
      if (state !== 'open') {
        cur = { arrivedAt: e.at, arrivedFrom: party(e.from) }
        state = 'open'
      }
      continue
    }
    if (state === 'open' && cur) {
      const arrivedAt: string = cur.arrivedAt
      if (isReply(e)) {
        close('replied', e.at, { action: e.outcome }, workingHoursBetween(arrivedAt, e.at))
        state = 'answered'
      } else if (isDeparture(e)) {
        const move = { action: e.outcome, to: party(e.to) }
        if (e.who === PM_NAME) {
          const n = noteNear(Date.parse(e.at), Date.parse(arrivedAt))
          if (n) {
            const end = later(e.at, n.at)
            close('handed-off', end, move, workingHoursBetween(arrivedAt, end))
          } else close('no-note', e.at, move, null)
        } else close('taken-out', e.at, { ...move, by: e.who }, null)
        state = 'out'
      } else if (isClose(e)) {
        close('closed', e.at, { action: e.outcome }, null)
        state = 'out'
      }
      continue
    }
    if (state === 'answered' && (isDeparture(e) || isClose(e))) state = 'out'
  }

  if (state === 'open' && cur) {
    const open: { arrivedAt: string; arrivedFrom: string | null } = cur
    rows.push({
      ticket,
      ...meta,
      ...open,
      outcome: 'open',
      endedAt: null,
      hours: workingHoursBetween(open.arrivedAt, now),
      week: null,
      action: null,
      to: null,
      by: null,
      offClock: null,
    })
  }
  return rows
}

/**
 * When each kind of request entered development or Canny, measured from the ticket's first arrival:
 * the first link of that kind the PM posted, and for bugs also the PM's hand-off into development —
 * whichever came first.
 */
function entries(ticket: string, evs: PmEvent[], meta: { summary: string; client: string }, complete: boolean): EntryRow[] {
  const firstArrival = evs.find(isArrival)?.at ?? null
  const out: EntryRow[] = []
  for (const kind of ['prd', 'mb', 'canny'] as const) {
    const link = evs.find((x) => x.who === PM_NAME && x[kind].length > 0)
    const handoff = kind === 'mb' ? evs.find(isBugHandoff) : undefined
    const e = [link, handoff].filter((x): x is PmEvent => !!x).sort(byTime)[0]
    if (!e) continue
    const via: EntryRow['via'] = e === link ? 'link' : 'handoff'
    const status: EntryStatus = !complete
      ? 'history-before-data'
      : !firstArrival || Date.parse(firstArrival) > Date.parse(e.at)
        ? 'no-arrival-on-record'
        : 'counted'
    const hours = status === 'counted' && firstArrival ? workingHoursBetween(firstArrival, e.at) : null
    out.push({
      ticket,
      ...meta,
      kind,
      via,
      // A hand-off always names its receiver: isBugHandoff only matches a move whose "to" is known.
      ref: via === 'link' ? e[kind][0] : (party(e.to) ?? ''),
      arrivedAt: status === 'counted' ? firstArrival : null,
      at: e.at,
      hours,
      week: weekOf(e.at),
      status,
      offClock: status === 'counted' ? offClock(hours, e.at) : null,
    })
  }
  return out
}

function median(xs: number[]): number | null {
  if (xs.length === 0) return null
  const s = [...xs].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

/** A stat is computed from exactly the rows its drill-down shows, so the two can never disagree. */
function stat(hours: number[]): Stat {
  return {
    n: hours.length,
    meanHours: hours.length ? hours.reduce((a, b) => a + b, 0) / hours.length : null,
    medianHours: median(hours),
  }
}

export interface PmScorecard {
  asOf: string
  coverageFrom: string | null
  gaps: { from: string; to: string }[]
  weeks: WeekRow[]
  response: ResponseRow[]
  entries: EntryRow[]
}

export function buildScorecard(store: EventStore, now: string): PmScorecard {
  const byTicket = new Map<string, PmEvent[]>()
  for (const e of Object.values(store.events)) {
    const list = byTicket.get(e.ticket) ?? []
    list.push(e)
    byTicket.set(e.ticket, list)
  }

  const response: ResponseRow[] = []
  const entryRows: EntryRow[] = []
  for (const [ticket, list] of byTicket) {
    const evs = list.sort(byTime)
    const meta = store.tickets[ticket] ?? { summary: '', client: '' }
    response.push(...cycles(ticket, evs, meta, now))
    // History is complete only if the log holds the ticket's first action.
    entryRows.push(...entries(ticket, evs, meta, !!store.created[ticket]))
  }
  response.sort((a, b) => Date.parse(b.endedAt ?? b.arrivedAt) - Date.parse(a.endedAt ?? a.arrivedAt))
  entryRows.sort((a, b) => Date.parse(b.at) - Date.parse(a.at))

  const { from, gaps } = coverage(store)
  const coverageWeek = from ? weekOf(from) : null
  const thisWeek = weekOf(now)
  const counted = (r: ResponseRow) => r.outcome === 'replied' || r.outcome === 'handed-off'

  const weeks: WeekRow[] = (from ? weeksBetween(from, now) : [])
    .map((monday) => {
      const hours = (kind: EntryKind) =>
        entryRows.filter((r) => r.kind === kind && r.status === 'counted' && r.week === monday).map((r) => r.hours as number)
      return {
        monday,
        label: weekLabel(monday),
        partial: monday === thisWeek ? ('in-progress' as const) : monday === coverageWeek ? ('coverage' as const) : null,
        shape: weekShape(monday, now),
        response: stat(response.filter((r) => counted(r) && r.week === monday).map((r) => r.hours as number)),
        prd: stat(hours('prd')),
        mb: stat(hours('mb')),
        canny: stat(hours('canny')),
      }
    })
    .reverse()

  return { asOf: now, coverageFrom: from, gaps, weeks, response, entries: entryRows }
}
