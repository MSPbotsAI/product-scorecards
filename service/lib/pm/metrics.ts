/**
 * The PM scorecard: three numbers, and the fourth kept beside them.
 *
 *   response  PM first response — every arrival into the PM's queue, to the PM's first reply to the
 *             customer, hand-off out of the queue with a private note, or scheduling of the ticket
 *             (Schedule Ticket: the request is decided and dated, so it no longer waits on him;
 *             decided by the PM, 2026-10-28, on #41410). Time the ticket spends on
 *             hold (SLA Hold: scheduled, waiting on the requester) does not count, as in Halo's own
 *             SLA (decided by the PM, 2026-10-15). Each arrival is its own
 *             measurement: a ticket that comes back is answered again. The week's number is an
 *             average over TICKETS: a ticket answered more than once in a week counts once, at the
 *             mean of that week's entries, so a ticket that bounces back and forth weighs no more
 *             than one that does not (decided by the PM, 2026-10-14). A ticket whose entries fall in
 *             different weeks counts in each week with that week's entries, so a finished week
 *             still never moves.
 *   prd       Requirement into development — the ticket's last entry into the queue before the link,
 *             to the first ClickUp PRD link the PM posts on the ticket. Earlier rounds in the queue
 *             are timed by first response; this clock times the round the request moved in
 *             (decided by the PM, 2026-10-19). If the PM schedules the ticket (Schedule Ticket) in
 *             that round before posting the link, the clock stops at the scheduling, and the link
 *             that follows is paperwork (decided by the PM, 2026-10-22, on #49914).
 *   mb        Bug into development — the same clock, to the PM's own hand-off into development:
 *             moving the ticket to Lucas (the bug intake) or anyone in Development, or posting a
 *             ClickUp MB link, whichever comes first. The MB link Lucas logs afterwards is his time,
 *             not the PM's, so it does not stop this clock (decided by the PM, 2026-10-09). Kept apart
 *             from prd because bugs and requirements move at different speeds.
 *   canny     Requirement to Canny — the same start, to the first Canny post link the PM posts
 *             (a new post or an existing one).
 *
 * An entry into the queue is a move into it from anywhere else, or a reopen by anyone but the PM
 * while the queue holds the ticket: Halo keeps the assignee when it closes a ticket, so a reopen hands
 * it straight back (decided by the PM, 2026-10-22, on #49470). Both start a first-response clock, and
 * the last one before a link or hand-off starts the requirement, Canny and bug clocks.
 *
 * Every duration runs on the PM's working days (calendar.ts — the CN calendar as he works it), each
 * counted whole, 24 h, Asia/Shanghai: nights on a working day count, weekends and public holidays do
 * not (decided by the PM, 2026-10-22; pure clock time from 2026-10-19, then weekdays from 2026-10-21).
 * A ticket that arrives on a day off is timed from 00:00 of the next working day; one answered before
 * then scores 0, stays in the average and is marked (`beforeClock`). First response is in hours and
 * leaves out time on hold; the other three are in days of 24 h. The 30-day rules (LONG_WAIT_DAYS,
 * AWAY_DAYS) count calendar days.
 * Each measurement is reported in the week its END
 * lands in, so a finished week's numbers never move again. Nothing is averaged that is not also
 * listed: every counted row is shown behind its number, and every row that is not counted is shown
 * with the reason — a waiting ticket left out of an average is how an average lies.
 *
 * A request that spent more than AWAY_DAYS out of the queue on the way is listed but in no average.
 * Each week is coloured against its quarter's benchmark, the previous quarter's average (benchmarkFor).
 */
import { HOLD, RELEASE, TICKET_CLOSED, TICKET_REOPENED, inQueue, isPm, type Party, type PmEvent } from './actions.ts'
import { HISTORY_BASELINES } from './baselines.ts'
import { type EventStore, coverage } from './store.ts'
import { type WeekShape, clockStart, weekLabel, weekOf, weekShape, weeksBetween, workdayMsBetween } from './workTime.ts'

/** How far apart a hand-off and its private note may be and still be one act. Observed gaps are seconds. */
const PAIR_WINDOW_MS = 30 * 60_000

/**
 * A move into the queue that the PM makes himself within this long after replying to the customer
 * is filing, not an arrival: the reply already happened, so there is no first response left to wait
 * for (decided by the PM, 2026-10-14). Without it, #22314 — replied 16:18 while with a CSM, pulled
 * into the queue by the PM at 16:46 — showed as "waiting", then "closed before any response".
 */
const FILING_WINDOW_MS = 30 * 60_000

/**
 * A request that was out of the PM's queue for more than this many calendar days in one stretch is
 * listed, but kept out of every average: the week's number and the quarter benchmark. This applies
 * between the ticket's last entry and the clock stopping: a ticket moved out of the queue and linked
 * a month later, while it was elsewhere.
 *
 * A month spent elsewhere is not the PM's time. Time INSIDE the queue always counts, however long it
 * is: months waiting in the queue are the PM's wait (decided by the PM, 2026-10-15).
 *
 * First response is never affected. Its clock stops as soon as a ticket leaves the queue.
 */
export const AWAY_DAYS = 30

/**
 * A wait longer than this many calendar days counts in its week like any other wait, but stays out of
 * the quarter benchmark (decided by the PM, 2026-10-15).
 *
 * Months spent in the queue are the PM's wait, so the week they end in shows them. In the benchmark,
 * though, three such tickets would set the bar. Q3's first-response average was 28.8 h with them and
 * 6.2 h without, and a bar at 29 h judges nothing.
 *
 * Since April 2026 no wait has fallen between 27 and 39 days, so the cut sits in a natural gap.
 */
export const LONG_WAIT_DAYS = 30
const DAY_MS = 86_400_000
const isLongWait = (fromIso: string, toIso: string) => Date.parse(toIso) - Date.parse(fromIso) > LONG_WAIT_DAYS * DAY_MS

export type CycleOutcome =
  /** Counted: the PM emailed the customer. */
  | 'replied'
  /** Counted: the PM moved the ticket out of the queue and left a private note. */
  | 'handed-off'
  /** Counted: the PM scheduled the ticket (Schedule Ticket). It stays in his queue, but no longer waits on him. */
  | 'scheduled'
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
  /** Who moved it in, "Support · Kinn Maagad"; null when the move note did not name both ends, or for a reopen. */
  arrivedFrom: string | null
  /** It entered by being reopened while the queue held it, not by a move. */
  reopened: boolean
  outcome: CycleOutcome
  endedAt: string | null
  /**
   * Working-day hours arrival → response when counted, or arrival → now when open, less the time on
   * hold. Null otherwise.
   */
  hours: number | null
  /** Working-day hours of that span the ticket was on hold (SLA Hold), left out of `hours`. 0 when never on hold. */
  heldHours: number
  /** When the clock started, if later than `arrivedAt`: 00:00 of the next working day for an arrival on a day off. */
  clockFrom: string | null
  /**
   * Answered before the clock started — it arrived and was answered on days off — so it scores 0 h.
   * It stays in the average and is marked in the list (decided by the PM, 2026-10-22).
   */
  beforeClock: boolean
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
  /** A counted response that waited more than LONG_WAIT_DAYS: in its week's average, not in a benchmark. */
  longWait: boolean
}

export type EntryKind = 'prd' | 'mb' | 'canny'
export type EntryStatus =
  | 'counted'
  /** No entry into the queue before the stop is in the log, and the ticket is older than the log. */
  | 'history-before-data'
  /** The history is complete but shows no entry before the link — created straight into the queue. */
  | 'no-arrival-on-record'
  /** Timed, but the ticket was out of the queue for more than AWAY_DAYS in one stretch on the way: listed, in no average. */
  | 'away'

export interface EntryRow {
  ticket: string
  summary: string
  client: string
  kind: EntryKind
  /**
   * How the clock stopped: a link the PM posted, (bugs only) the PM's hand-off into development, or
   * (requirements only) the PM scheduling the ticket before he posted its link.
   */
  via: 'link' | 'handoff' | 'schedule'
  /** "PRD-19414", "MB-12057", a Canny post path, or for a hand-off the receiving party. */
  ref: string
  /** For a requirement stopped at its scheduling: when its PRD link was posted. Null otherwise. */
  linkedAt: string | null
  /** The entry the clock runs from — the last one into the queue before the stop — for counted and away rows; null otherwise. */
  arrivedAt: string | null
  /** That entry was a reopen while the queue held the ticket, not a move. */
  reopened: boolean
  at: string
  hours: number | null
  /** When the clock started, if later than `arrivedAt` (an entry on a day off). */
  clockFrom: string | null
  /** Done before the clock started — entered and linked or handed off on days off — so it scores 0. */
  beforeClock: boolean
  /** The longest stretch out of the queue between that entry and the stop, in calendar days; null when not timed. */
  awayDays: number | null
  week: string
  status: EntryStatus
  /** A counted entry that waited more than LONG_WAIT_DAYS: in its week's average, not in a benchmark. */
  longWait: boolean
}

export interface Stat {
  n: number
  meanHours: number | null
  medianHours: number | null
}

interface WeekCore {
  monday: string
  label: string
  /** 'coverage' = the log starts mid-week; 'in-progress' = the week is not over yet. */
  partial: 'coverage' | 'in-progress' | null
  /** How much working time the week holds — holidays and make-up days make it differ from five. */
  shape: WeekShape
  /** PM first response, over tickets (`n` counts tickets): see TicketWeek. */
  response: Stat
  /** The counted first responses (queue entries) behind `response` — at least `response.n`. */
  responseEntries: number
  prd: Stat
  mb: Stat
  canny: Stat
  /**
   * The tickets with no first response yet when the week ended, or now for the week in progress. Each
   * one's hours run to that moment, less time on hold. Only state 'waiting' counts as waiting on the
   * PM (decided by the PM, 2026-10-15): the others are listed, not counted.
   */
  waiting: WaitingAt[]
}

/** One ticket with no first response yet at a week's end. arrivedAt identifies its cycle in `response`. */
export interface WaitingAt {
  ticket: string
  arrivedAt: string
  hours: number
  heldHours: number
  /** When its clock starts or started, if later than `arrivedAt`: an arrival on a day off. */
  clockFrom: string | null
  /**
   * 'waiting': the customer is waiting on the PM. 'on-hold': it is parked (scheduled, or waiting on
   * the requester), so its clock is stopped.
   */
  state: 'waiting' | 'on-hold'
}

export interface WeekRow extends WeekCore {
  /** The quarter it is judged in — the one its Monday falls in, "2026-Q4". */
  quarter: string
  /** Each number against that quarter's benchmark. */
  light: Record<Metric, Light>
}

/**
 * One ticket's first responses within one week: the unit the week's PM1 average is taken over. A
 * ticket that entered the queue more than once that week adds one value, the mean of those entries.
 */
export interface TicketWeek {
  ticket: string
  week: string
  /** Counted first responses of this ticket that ended in this week. */
  entries: number
  /** Their mean: the one value this ticket adds to the week's average. */
  meanHours: number
  /** Every one of those entries was answered before the clock started, so the value is 0 for that reason. */
  beforeClock: boolean
  /** Every counted first response of this ticket in the log, all weeks. Shown beside it, never averaged into a week. */
  allEntries: number
  allMeanHours: number
}

const party = (p?: Party): string | null => (p ? `${p.dept} · ${p.person}` : null)
const byTime = (a: PmEvent, b: PmEvent) => Date.parse(a.at) - Date.parse(b.at) || a.seq - b.seq
const isArrival = (e: PmEvent) => e.outcome === 'Re-Assign' && inQueue(e.to) && !inQueue(e.from)

/**
 * A reopen this soon after an entry is part of the same hand-over, not a second entry. Support often
 * reassigns a closed ticket to the PM and reopens it in one go (#51292 on 10-08: seconds apart).
 */
const REOPEN_WITH_ENTRY_MS = 30 * 60_000

/**
 * A ticket's entries into the queue, in order: every move in (isArrival), and every reopen by anyone
 * but the PM while the queue holds it. Whether it holds the ticket is read from the moves around it;
 * before the first move in the log, that move's "from" says where the ticket was.
 */
function queueEntries(evs: PmEvent[]): Set<PmEvent> {
  const out = new Set<PmEvent>()
  let held = inQueue(evs.find((e) => e.outcome === 'Re-Assign' && e.from)?.from)
  let last = Number.NEGATIVE_INFINITY
  for (const e of evs) {
    const at = Date.parse(e.at)
    if (e.outcome === 'Re-Assign' && e.to) {
      if (isArrival(e)) {
        out.add(e)
        last = at
      }
      held = inQueue(e.to)
    } else if (e.outcome === TICKET_REOPENED && held && !isPm(e.who) && at - last > REOPEN_WITH_ENTRY_MS) {
      out.add(e)
      last = at
    }
  }
  return out
}
const isDeparture = (e: PmEvent) => e.outcome === 'Re-Assign' && inQueue(e.from) && !inQueue(e.to)
const isReply = (e: PmEvent) => isPm(e.who) && (e.outcome === 'Email User' || e.outcome === 'Email Update')
/** The PM closing the ticket, or Halo's ticket list showing it closed (see TICKET_CLOSED). */
const isClose = (e: PmEvent) => (isPm(e.who) && (e.outcome === 'Resolved' || e.outcome === 'Close')) || e.outcome === TICKET_CLOSED
/** A response that counts: the PM replied, or handed the ticket off with a private note. */
const counts = (r: ResponseRow) => r.outcome === 'replied' || r.outcome === 'handed-off' || r.outcome === 'scheduled'
const later = (a: string, b: string) => (Date.parse(a) >= Date.parse(b) ? a : b)

/** Lucas takes bugs in for development; a move to him, or to anyone in Development, puts a bug into dev. */
const BUG_INTAKE = 'Lucas Chen'
const toDevelopment = (p?: Party) => !!p && (p.person === BUG_INTAKE || p.dept === 'Development')
/** The Halo action that sets a ticket's scheduled date (status Scheduled). */
const SCHEDULE_TICKET = 'Schedule Ticket'
const isBugHandoff = (e: PmEvent) => isPm(e.who) && isDeparture(e) && toDevelopment(e.to)

/** When a ticket was on hold: each SLA Hold until the next SLA Release, or open-ended. */
type Hold = { from: number; to: number | null }

function holdsOf(evs: PmEvent[]): Hold[] {
  const holds: Hold[] = []
  for (const e of evs) {
    const last = holds[holds.length - 1]
    if (e.outcome === HOLD && (!last || last.to !== null)) holds.push({ from: Date.parse(e.at), to: null })
    else if (e.outcome === RELEASE && last && last.to === null) last.to = Date.parse(e.at)
  }
  return holds
}

const HOUR_MS = 3_600_000

/** Hours from → to on the scorecard's clock: every hour of the PM's working days, Asia/Shanghai. */
const clockHours = (fromIso: string, toIso: string) => workdayMsBetween(Date.parse(fromIso), Date.parse(toIso)) / HOUR_MS

/**
 * First response's time from → to, less the part on hold: every working-day hour from the moment the
 * ticket is escalated into the PM queue, working hours or not.
 */
function waitBetween(holds: Hold[], fromIso: string, toIso: string): { hours: number; held: number; all: number } {
  const start = Date.parse(fromIso)
  const end = Date.parse(toIso)
  const all = workdayMsBetween(start, end) / HOUR_MS
  let held = 0
  for (const h of holds) {
    const from = Math.max(h.from, start)
    const to = Math.min(h.to ?? Number.POSITIVE_INFINITY, end)
    if (to > from) held += workdayMsBetween(from, to) / HOUR_MS
  }
  return { hours: Math.max(0, all - held), held, all }
}

/**
 * Where the clock starts for a start at `fromIso`, and whether the end came before it did. A start on
 * a day off is timed from 00:00 of the next working day; an end before then scores 0, and the row
 * says so rather than showing a bare 0.0.
 */
function clockOf(fromIso: string, endIso: string | null): { clockFrom: string | null; beforeClock: boolean } {
  const start = clockStart(fromIso)
  if (start === fromIso) return { clockFrom: null, beforeClock: false }
  const before = endIso !== null && Date.parse(endIso) <= Date.parse(start)
  return { clockFrom: before ? null : start, beforeClock: before }
}

const onHoldAt = (holds: Hold[], ms: number) => holds.some((h) => h.from <= ms && (h.to === null || h.to > ms))

/**
 * Walk one ticket's timeline and cut it into arrival → first-response cycles.
 *
 * The ticket is "out" until something moves it into the queue. A reply closes the cycle and leaves
 * the ticket "answered" in the queue; a further message from the customer is not a new arrival —
 * only a move into the queue from outside is. A ticket already in the queue when the log begins
 * starts "out" by assumption, so its responses have no start and are simply not measured.
 */
function cycles(ticket: string, evs: PmEvent[], meta: { summary: string; client: string }, now: string): ResponseRow[] {
  const notes = evs.filter((e) => isPm(e.who) && e.outcome === 'Private Note')
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

  const replyTimes = evs.filter(isReply).map((e) => Date.parse(e.at))
  /** The PM moving a ticket he has just answered into his own queue: see FILING_WINDOW_MS. */
  const isFiling = (e: PmEvent) => {
    if (!isPm(e.who)) return false
    const at = Date.parse(e.at)
    return replyTimes.some((t) => t <= at && at - t <= FILING_WINDOW_MS)
  }

  const holds = holdsOf(evs)
  const wait = (fromIso: string, toIso: string) => waitBetween(holds, fromIso, toIso)
  const entered = queueEntries(evs)

  const rows: ResponseRow[] = []
  let state: 'out' | 'open' | 'answered' = 'out'
  let cur: { arrivedAt: string; arrivedFrom: string | null; reopened: boolean } | null = null
  const close = (outcome: CycleOutcome, endedAt: string, end: { action: string; to?: string | null; by?: string }, timed: boolean) => {
    if (!cur) return
    const w = timed ? wait(cur.arrivedAt, endedAt) : null
    rows.push({
      ticket,
      ...meta,
      ...cur,
      outcome,
      endedAt,
      hours: w ? w.hours : null,
      heldHours: w ? w.held : 0,
      ...(timed ? clockOf(cur.arrivedAt, endedAt) : { clockFrom: null, beforeClock: false }),
      week: weekOf(endedAt),
      action: end.action,
      to: end.to ?? null,
      by: end.by ?? null,
      longWait: !!w && isLongWait(cur.arrivedAt, endedAt),
    })
    cur = null
  }

  for (const e of evs) {
    if (entered.has(e) && state !== 'open' && isFiling(e)) {
      // Filed by the PM right after his own reply: in the queue, already answered — no clock.
      state = 'answered'
      continue
    }
    if (entered.has(e)) {
      const reopened = e.outcome === TICKET_REOPENED
      // A reopen while a cycle is open means the ticket was closed unanswered in between, by a route
      // the log did not see: that wait ended unanswered, and the reopen starts a new one.
      if (state === 'open' && reopened) {
        close('closed', e.at, { action: TICKET_CLOSED }, false)
        state = 'out'
      }
      // An arrival while already open is a duplicate move; keep the first. An arrival while answered
      // means the ticket left by a route the log did not see, so it starts a fresh cycle.
      if (state !== 'open') {
        cur = { arrivedAt: e.at, arrivedFrom: reopened ? null : party(e.from), reopened }
        state = 'open'
      }
      continue
    }
    if (state === 'open' && cur) {
      const arrivedAt: string = cur.arrivedAt
      if (isReply(e)) {
        close('replied', e.at, { action: e.outcome }, true)
        state = 'answered'
      } else if (isPm(e.who) && e.outcome === SCHEDULE_TICKET) {
        close('scheduled', e.at, { action: e.outcome }, true)
        state = 'answered'
      } else if (isDeparture(e)) {
        const move = { action: e.outcome, to: party(e.to) }
        if (isPm(e.who)) {
          const n = noteNear(Date.parse(e.at), Date.parse(arrivedAt))
          if (n) {
            const end = later(e.at, n.at)
            close('handed-off', end, move, true)
          } else close('no-note', e.at, move, false)
        } else close('taken-out', e.at, { ...move, by: e.who }, false)
        state = 'out'
      } else if (isClose(e)) {
        close('closed', e.at, { action: e.outcome }, false)
        state = 'out'
      }
      continue
    }
    if (state === 'answered' && (isDeparture(e) || isClose(e))) state = 'out'
  }

  if (state === 'open' && cur) {
    const open: { arrivedAt: string; arrivedFrom: string | null; reopened: boolean } = cur
    const w = wait(open.arrivedAt, now)
    rows.push({
      ticket,
      ...meta,
      ...open,
      outcome: 'open',
      endedAt: null,
      hours: w.hours,
      heldHours: w.held,
      ...clockOf(open.arrivedAt, null),
      week: null,
      action: null,
      to: null,
      by: null,
      longWait: false,
    })
  }
  return rows
}

/**
 * The longest single stretch a ticket spent out of the queue between two instants, in milliseconds:
 * from a move out to the next move back in, or to `toIso` if it never came back.
 */
function longestAway(evs: PmEvent[], fromIso: string, toIso: string): number {
  const from = Date.parse(fromIso)
  const to = Date.parse(toIso)
  let outSince: number | null = null
  let longest = 0
  for (const e of evs) {
    const t = Date.parse(e.at)
    if (t <= from) continue
    if (t >= to) break
    if (outSince === null && isDeparture(e)) outSince = t
    else if (outSince !== null && isArrival(e)) {
      longest = Math.max(longest, t - outSince)
      outSince = null
    }
  }
  return outSince === null ? longest : Math.max(longest, to - outSince)
}

/**
 * When each kind of request entered development or Canny: the first link of that kind the PM posted,
 * for bugs also the PM's hand-off into development — whichever came first — and for requirements the
 * PM's scheduling of the ticket, if it came before the link. Measured from the ticket's last entry
 * into the queue before it.
 */
function entries(ticket: string, evs: PmEvent[], meta: { summary: string; client: string }, complete: boolean): EntryRow[] {
  const out: EntryRow[] = []
  const into = queueEntries(evs)
  for (const kind of ['prd', 'mb', 'canny'] as const) {
    const link = evs.find((x) => isPm(x.who) && x[kind].length > 0)
    const handoff = kind === 'mb' ? evs.find(isBugHandoff) : undefined
    const first = [link, handoff].filter((x): x is PmEvent => !!x).sort(byTime)[0]
    if (!first) continue
    // The round the request moved in: its last entry into the queue before the link or hand-off — a
    // reopen counts. An entry the log holds is the last one whether or not older history is on record.
    const entry = evs.filter((x) => into.has(x) && Date.parse(x.at) <= Date.parse(first.at)).pop()
    // A requirement the PM scheduled in that round before posting its link went to development when he
    // scheduled it; the link followed as paperwork. The link still has to come: scheduling alone is not
    // a requirement into development.
    const scheduled =
      kind === 'prd' && entry
        ? evs.find((x) => isPm(x.who) && x.outcome === SCHEDULE_TICKET && byTime(x, entry) > 0 && byTime(x, first) < 0)
        : undefined
    const e = scheduled ?? first
    const via: EntryRow['via'] = scheduled ? 'schedule' : first === link ? 'link' : 'handoff'
    const entered = entry?.at ?? null
    const timed = entered !== null
    const away = entered ? longestAway(evs, entered, e.at) : null
    const status: EntryStatus = !timed
      ? complete
        ? 'no-arrival-on-record'
        : 'history-before-data'
      : (away ?? 0) > AWAY_DAYS * DAY_MS
        ? 'away'
        : 'counted'
    // The same clock as first response: the PM's working days, 24 h each.
    const hours = entered ? clockHours(entered, e.at) : null
    out.push({
      ticket,
      ...meta,
      kind,
      via,
      // A hand-off always names its receiver: isBugHandoff only matches a move whose "to" is known.
      ref: via === 'handoff' ? (party(e.to) ?? '') : (link as PmEvent)[kind][0],
      linkedAt: scheduled && link ? link.at : null,
      arrivedAt: entered,
      reopened: entry?.outcome === TICKET_REOPENED,
      at: e.at,
      hours,
      ...(entered ? clockOf(entered, e.at) : { clockFrom: null, beforeClock: false }),
      awayDays: away === null ? null : Math.round((away / DAY_MS) * 10) / 10,
      week: weekOf(e.at),
      status,
      longWait: status === 'counted' && !!entered && isLongWait(entered, e.at),
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

/* ── benchmarks ── */

export type Metric = 'response' | EntryKind
/** A number's colour. 'display' = nothing to judge it by: no benchmark, or nothing measured that week. */
export type Light = 'green' | 'yellow' | 'red' | 'display'

/** A benchmark needs this many measurements behind it; with fewer, one fast or slow ticket would set the bar. */
export const MIN_SAMPLES = 10
/** Yellow runs from the benchmark up to this multiple of it; red is past that. */
export const YELLOW_FACTOR = 1.25
/** A week with fewer working days than this is a holiday week, not a normal one, and stays out of a benchmark. */
export const MIN_WORKDAYS = 3

const METRIC_IDS: Metric[] = ['response', 'prd', 'mb', 'canny']
/** How the page shows each number. Colours compare the value as shown, so a shown "7.3 h" is judged as 7.3. */
const SHOWN_IN: Record<Metric, 'h' | 'd'> = { response: 'h', prd: 'd', mb: 'd', canny: 'd' }
/** A shown day is one working day counted whole: 24 hours, not the 9.5 working hours in it. */
export const DAY_HOURS = 24
const inShownUnit = (hours: number, metric: Metric) => (SHOWN_IN[metric] === 'h' ? hours : hours / DAY_HOURS)
const round1 = (v: number) => Math.round(v * 10) / 10

/**
 * One measurement in a benchmark's quarter, written out so the benchmark can be drilled into. For
 * first response it is a ticket's week (the mean of its entries that week); for the rest one entry.
 * `out` says why a measurement is listed but not averaged.
 */
export interface Sample {
  metric: Metric
  ticket: string
  /** The Monday of the week it landed in. */
  week: string
  hours: number
  /** First response only: how many queue entries this week's value averages. */
  entries?: number
  /** 'long-wait': waited over LONG_WAIT_DAYS. 'short-week': its week had under MIN_WORKDAYS working days. */
  out?: 'long-wait' | 'short-week'
  /** Calendar days waited, for a long wait. */
  waitedDays?: number
  /** Answered or done on a day off, before the clock started: it counts, as 0. */
  beforeClock?: true
}

export interface Line {
  /** The mean of the counted samples in working hours, and how many there are; hours is null when there are none. */
  hours: number | null
  n: number
  /**
   * The bounds, in the number's shown unit at the shown one decimal: green up to `green`, yellow up to
   * `yellow`, red above. Null when n is under MIN_SAMPLES — that number is then shown as a trend only.
   */
  green: number | null
  yellow: number | null
}

export interface Benchmark {
  /** The quarter judged, "2026-Q4", and the quarter whose average judges it, "2026-Q3". */
  quarter: string
  from: string
  /** 'history': averaged from Halo's full action history (baselines.ts). 'log': averaged from this log. */
  source: 'history' | 'log'
  lines: Record<Metric, Line>
  /** Every measurement behind the lines, counted or not — exactly what each line averages, and nothing else. */
  samples: Sample[]
}

/** The quarter a week is judged in: the one its Monday falls in, "2026-Q4". */
export function quarterOf(monday: string): string {
  return `${monday.slice(0, 4)}-Q${Math.floor((Number(monday.slice(5, 7)) - 1) / 3) + 1}`
}

function previousQuarter(quarter: string): string {
  const year = Number(quarter.slice(0, 4))
  const q = Number(quarter.slice(6))
  return q === 1 ? `${year - 1}-Q4` : `${year}-Q${q - 1}`
}

/** The Mondays that fall in a quarter, oldest first. */
function mondaysIn(quarter: string): string[] {
  const year = Number(quarter.slice(0, 4))
  const q = Number(quarter.slice(6))
  const start = Date.UTC(year, (q - 1) * 3, 1)
  const end = Date.UTC(year, q * 3, 1)
  const out: string[] = []
  for (let t = start + ((8 - new Date(start).getUTCDay()) % 7) * DAY_MS; t < end; t += 7 * DAY_MS) {
    out.push(new Date(t).toISOString().slice(0, 10))
  }
  return out
}

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length

const daysBetween = (fromIso: string, toIso: string) => Math.round((Date.parse(toIso) - Date.parse(fromIso)) / DAY_MS)
const METRIC_ORDER: Record<Metric, number> = { response: 0, prd: 1, canny: 2, mb: 3 }

/**
 * Every measurement of a quarter, with the ones a benchmark leaves out marked: weeks with fewer than
 * MIN_WORKDAYS working days, and waits longer than LONG_WAIT_DAYS. The counted ones are the same
 * units the weeks average: per-ticket weeks for first response, entries for the rest. Null unless
 * every week of the quarter is in the log, complete and free of gaps, so a benchmark is never
 * averaged from part of a quarter.
 */
export function quarterSamples(
  card: { weeks: WeekCore[]; gaps: { from: string; to: string }[]; response: ResponseRow[]; entries: EntryRow[] },
  quarter: string,
): Sample[] | null {
  const mondays = mondaysIn(quarter)
  const byMonday = new Map(card.weeks.map((w) => [w.monday, w]))
  const startMs = Date.parse(`${mondays[0]}T00:00:00+08:00`)
  const endMs = Date.parse(`${mondays[mondays.length - 1]}T00:00:00+08:00`) + 7 * DAY_MS
  const covered =
    mondays.every((m) => byMonday.has(m) && byMonday.get(m)?.partial === null) &&
    !card.gaps.some((g) => Date.parse(g.from) < endMs && Date.parse(g.to) > startMs)
  if (!covered) return null
  const inQuarter = new Set(mondays)
  const short = (week: string) => (byMonday.get(week)?.shape.workdays ?? 0) < MIN_WORKDAYS
  const out: Sample[] = []

  const responses = card.response.filter((r) => counts(r) && inQuarter.has(r.week as string))
  for (const t of ticketWeeks(responses.filter((r) => !r.longWait && !short(r.week as string)))) {
    out.push({
      metric: 'response',
      ticket: t.ticket,
      week: t.week,
      hours: t.meanHours,
      entries: t.entries,
      ...(t.beforeClock ? { beforeClock: true as const } : {}),
    })
  }
  for (const r of responses) {
    const week = r.week as string
    const hours = r.hours as number
    const marked = r.beforeClock ? { beforeClock: true as const } : {}
    if (short(week)) out.push({ metric: 'response', ticket: r.ticket, week, hours, out: 'short-week', ...marked })
    else if (r.longWait) {
      out.push({
        metric: 'response',
        ticket: r.ticket,
        week,
        hours,
        out: 'long-wait',
        waitedDays: daysBetween(r.arrivedAt, r.endedAt as string),
        ...marked,
      })
    }
  }
  for (const r of card.entries.filter((x) => x.status === 'counted' && inQuarter.has(x.week))) {
    const base = {
      metric: r.kind,
      ticket: r.ticket,
      week: r.week,
      hours: r.hours as number,
      ...(r.beforeClock ? { beforeClock: true as const } : {}),
    }
    if (short(r.week)) out.push({ ...base, out: 'short-week' })
    else if (r.longWait) out.push({ ...base, out: 'long-wait', waitedDays: daysBetween(r.arrivedAt as string, r.at) })
    else out.push(base)
  }
  return out.sort(
    (a, b) => METRIC_ORDER[a.metric] - METRIC_ORDER[b.metric] || a.week.localeCompare(b.week) || a.ticket.localeCompare(b.ticket),
  )
}

/** A line from the samples it averages: only those not marked `out`. */
function lineOf(metric: Metric, samples: Sample[]): Line {
  const hours = samples.filter((x) => x.metric === metric && !x.out).map((x) => x.hours)
  const n = hours.length
  if (n === 0) return { hours: null, n, green: null, yellow: null }
  const average = mean(hours)
  if (n < MIN_SAMPLES) return { hours: average, n, green: null, yellow: null }
  const shown = inShownUnit(average, metric)
  return { hours: average, n, green: round1(shown), yellow: round1(shown * YELLOW_FACTOR) }
}

/**
 * The benchmark a quarter is judged by: the previous quarter's average, fixed for the whole quarter
 * (decided by the PM, 2026-10-14). It comes from baselines.ts for quarters the log does not reach,
 * and is averaged from the log itself once the log covers the whole previous quarter. Null when
 * neither has it; every number in that quarter is then shown as a trend.
 */
function benchmarkFor(quarter: string, card: Parameters<typeof quarterSamples>[0]): Benchmark | null {
  const known = HISTORY_BASELINES[quarter]
  const from = known?.from ?? previousQuarter(quarter)
  const samples = known?.samples ?? quarterSamples(card, from)
  if (!samples) return null
  const lines = Object.fromEntries(METRIC_IDS.map((m) => [m, lineOf(m, samples)])) as Record<Metric, Line>
  return { quarter, from, source: known ? 'history' : 'log', lines, samples }
}

/** A week's colour: its number, as shown, against the benchmark's bounds. */
function lightOf(metric: Metric, s: Stat, line: Line | undefined): Light {
  if (!line || line.green === null || line.yellow === null || s.n === 0 || s.meanHours === null) return 'display'
  const v = round1(inShownUnit(s.meanHours, metric))
  return v <= line.green ? 'green' : v <= line.yellow ? 'yellow' : 'red'
}

export interface PmScorecard {
  asOf: string
  coverageFrom: string | null
  gaps: { from: string; to: string }[]
  weeks: WeekRow[]
  /** The benchmark of each quarter the weeks fall in, newest first; a quarter without one is absent. */
  benchmarks: Benchmark[]
  response: ResponseRow[]
  /** The per-ticket units each week's PM1 average is taken over. */
  responseTickets: TicketWeek[]
  entries: EntryRow[]
}

/** Group the counted first responses by ticket and week, keeping each ticket's all-weeks mean beside it. */
function ticketWeeks(rows: ResponseRow[]): TicketWeek[] {
  const all = new Map<string, number[]>()
  const byWeek = new Map<string, { ticket: string; week: string; hours: number[]; beforeClock: boolean }>()
  for (const r of rows) {
    const hours = r.hours as number
    all.set(r.ticket, [...(all.get(r.ticket) ?? []), hours])
    const key = `${r.ticket}|${r.week}`
    const unit = byWeek.get(key) ?? { ticket: r.ticket, week: r.week as string, hours: [], beforeClock: true }
    unit.hours.push(hours)
    unit.beforeClock = unit.beforeClock && r.beforeClock
    byWeek.set(key, unit)
  }
  return [...byWeek.values()].map((u) => {
    const everything = all.get(u.ticket) ?? u.hours
    return {
      ticket: u.ticket,
      week: u.week,
      entries: u.hours.length,
      meanHours: mean(u.hours),
      beforeClock: u.beforeClock,
      allEntries: everything.length,
      allMeanHours: mean(everything),
    }
  })
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
  const holdsByTicket = new Map<string, Hold[]>()
  for (const [ticket, list] of byTicket) {
    const evs = list.sort(byTime)
    holdsByTicket.set(ticket, holdsOf(evs))
    const meta = store.tickets[ticket] ?? { summary: '', client: '' }
    response.push(...cycles(ticket, evs, meta, now))
    // History is complete only if the log holds the ticket's first action.
    entryRows.push(...entries(ticket, evs, meta, !!store.created[ticket]))
  }
  response.sort((a, b) => Date.parse(b.endedAt ?? b.arrivedAt) - Date.parse(a.endedAt ?? a.arrivedAt))
  entryRows.sort((a, b) => Date.parse(b.at) - Date.parse(a.at))

  const { from, gaps } = coverage(store)
  // A log that opens exactly at a Monday's midnight (a history import) holds that whole week.
  const coverageWeek = from && Date.parse(from) > Date.parse(`${weekOf(from)}T00:00:00+08:00`) ? weekOf(from) : null
  const thisWeek = weekOf(now)
  const countedResponses = response.filter(counts)
  const responseTickets = ticketWeeks(countedResponses)

  /** Every cycle that had arrived and had no response yet at `atIso`, aged to that moment. */
  const waitingAt = (atIso: string): WaitingAt[] => {
    const at = Date.parse(atIso)
    return response
      .filter((r) => Date.parse(r.arrivedAt) < at && (r.endedAt === null || Date.parse(r.endedAt) > at))
      .map((r) => {
        const holds = holdsByTicket.get(r.ticket) ?? []
        const w = waitBetween(holds, r.arrivedAt, atIso)
        const state: WaitingAt['state'] = onHoldAt(holds, at) ? 'on-hold' : 'waiting'
        const start = clockStart(r.arrivedAt)
        const clockFrom = start === r.arrivedAt ? null : start
        return { ticket: r.ticket, arrivedAt: r.arrivedAt, hours: w.hours, heldHours: w.held, clockFrom, state }
      })
      .sort((a, b) => b.hours - a.hours)
  }

  const cores: WeekCore[] = (from ? weeksBetween(from, now) : [])
    .map((monday) => {
      const hours = (kind: EntryKind) =>
        entryRows.filter((r) => r.kind === kind && r.status === 'counted' && r.week === monday).map((r) => r.hours as number)
      return {
        monday,
        label: weekLabel(monday),
        partial: monday === thisWeek ? ('in-progress' as const) : monday === coverageWeek ? ('coverage' as const) : null,
        shape: weekShape(monday, now),
        response: stat(responseTickets.filter((t) => t.week === monday).map((t) => t.meanHours)),
        responseEntries: countedResponses.filter((r) => r.week === monday).length,
        prd: stat(hours('prd')),
        mb: stat(hours('mb')),
        canny: stat(hours('canny')),
        waiting: waitingAt(monday === thisWeek ? now : new Date(Date.parse(`${monday}T00:00:00+08:00`) + 7 * DAY_MS).toISOString()),
      }
    })
    .reverse()

  const card = { weeks: cores, gaps, response, entries: entryRows }
  const benchmarks = [...new Set(cores.map((w) => quarterOf(w.monday)))]
    .map((q) => benchmarkFor(q, card))
    .filter((b): b is Benchmark => b !== null)
  const weeks: WeekRow[] = cores.map((w) => {
    const quarter = quarterOf(w.monday)
    const lines = benchmarks.find((b) => b.quarter === quarter)?.lines
    const light = Object.fromEntries(METRIC_IDS.map((m) => [m, lightOf(m, w[m], lines?.[m])])) as Record<Metric, Light>
    return { ...w, quarter, light }
  })

  return { asOf: now, coverageFrom: from, gaps, weeks, benchmarks, response, responseTickets, entries: entryRows }
}
