/**
 * The PM scorecard: three numbers, and the fourth kept beside them.
 *
 *   response  PM first response — every arrival into the PM's queue, to the PM's first reply to the
 *             customer, or hand-off out of the queue with a private note. Each arrival is its own
 *             measurement: a ticket that comes back is answered again. The week's number is an
 *             average over TICKETS: a ticket answered more than once in a week counts once, at the
 *             mean of that week's entries, so a ticket that bounces back and forth weighs no more
 *             than one that does not (decided by the PM, 2026-10-14). A ticket whose entries fall in
 *             different weeks counts in each week with that week's entries, so a finished week
 *             still never moves.
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
 *
 * A request that spent more than AWAY_DAYS out of the queue on the way is listed but in no average.
 * Each week is coloured against its quarter's benchmark, the previous quarter's average (benchmarkFor).
 */
import { PM_NAME, inQueue, type Party, type PmEvent } from './actions.ts'
import { HISTORY_BASELINES } from './baselines.ts'
import { type EventStore, coverage } from './store.ts'
import {
  type WeekShape,
  WORKDAY_HOURS,
  clockStart,
  isWorkday,
  localDate,
  weekLabel,
  weekOf,
  weekShape,
  weeksBetween,
  workingHoursBetween,
} from './workTime.ts'

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
 * between its first arrival and the clock stopping, for example a ticket moved out and back later.
 *
 * The requirement and bug clocks run from the first arrival, and a month spent elsewhere is not the
 * PM's time. Time INSIDE the queue always counts, however long it is: months waiting in the queue are
 * the PM's wait (decided by the PM, 2026-10-15).
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
  /**
   * When the working clock started for this entry, if later than the arrival (it came in outside
   * working hours); null when it arrived during working time. Display only: the hours already count
   * from here.
   */
  clockFrom: string | null
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
  /** A counted response that waited more than LONG_WAIT_DAYS: in its week's average, not in a benchmark. */
  longWait: boolean
}

/**
 * Why a counted duration is exactly zero: the reply, hand-off or link came before the working clock
 * started — on a rest day, or outside 09:30–19:00 — for a ticket that arrived in the same off-hours
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
  /** Timed, but the ticket was out of the queue for more than AWAY_DAYS in one stretch on the way: listed, in no average. */
  | 'away'

export interface EntryRow {
  ticket: string
  summary: string
  client: string
  kind: EntryKind
  /** How the clock stopped: a link the PM posted, or (bugs only) the PM's hand-off into development. */
  via: 'link' | 'handoff'
  /** "PRD-19414", "MB-12057", a Canny post path, or for a hand-off the receiving party. */
  ref: string
  /** The first arrival and the working hours from it, for counted and away rows; null otherwise. */
  arrivedAt: string | null
  at: string
  hours: number | null
  /** The longest stretch out of the queue between the first arrival and the stop, in calendar days; null when not timed. */
  awayDays: number | null
  week: string
  status: EntryStatus
  /** Set when a counted entry scored exactly zero because the working clock had not started. */
  offClock: OffClock
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
  /** Every counted first response of this ticket in the log, all weeks. Shown beside it, never averaged into a week. */
  allEntries: number
  allMeanHours: number
}

const party = (p?: Party): string | null => (p ? `${p.dept} · ${p.person}` : null)
const byTime = (a: PmEvent, b: PmEvent) => Date.parse(a.at) - Date.parse(b.at) || a.seq - b.seq
const isArrival = (e: PmEvent) => e.outcome === 'Re-Assign' && inQueue(e.to) && !inQueue(e.from)
const isDeparture = (e: PmEvent) => e.outcome === 'Re-Assign' && inQueue(e.from) && !inQueue(e.to)
const isReply = (e: PmEvent) => e.who === PM_NAME && (e.outcome === 'Email User' || e.outcome === 'Email Update')
const isClose = (e: PmEvent) => e.who === PM_NAME && (e.outcome === 'Resolved' || e.outcome === 'Close')
/** A response that counts: the PM replied, or handed the ticket off with a private note. */
const counts = (r: ResponseRow) => r.outcome === 'replied' || r.outcome === 'handed-off'
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

  const replyTimes = evs.filter(isReply).map((e) => Date.parse(e.at))
  /** The PM moving a ticket he has just answered into his own queue: see FILING_WINDOW_MS. */
  const isFiling = (e: PmEvent) => {
    if (e.who !== PM_NAME) return false
    const at = Date.parse(e.at)
    return replyTimes.some((t) => t <= at && at - t <= FILING_WINDOW_MS)
  }

  const rows: ResponseRow[] = []
  let state: 'out' | 'open' | 'answered' = 'out'
  let cur: { arrivedAt: string; arrivedFrom: string | null; clockFrom: string | null } | null = null
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
      longWait: isCounted && isLongWait(cur.arrivedAt, endedAt),
    })
    cur = null
  }

  for (const e of evs) {
    if (isArrival(e) && state !== 'open' && isFiling(e)) {
      // Filed by the PM right after his own reply: in the queue, already answered — no clock.
      state = 'answered'
      continue
    }
    if (isArrival(e)) {
      // An arrival while already open is a duplicate move; keep the first. An arrival while answered
      // means the ticket left by a route the log did not see, so it starts a fresh cycle.
      if (state !== 'open') {
        const starts = clockStart(e.at)
        cur = { arrivedAt: e.at, arrivedFrom: party(e.from), clockFrom: starts === e.at ? null : starts }
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
    const open: { arrivedAt: string; arrivedFrom: string | null; clockFrom: string | null } = cur
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
    const timed = complete && !!firstArrival && Date.parse(firstArrival) <= Date.parse(e.at)
    const away = timed && firstArrival ? longestAway(evs, firstArrival, e.at) : null
    const status: EntryStatus = !complete
      ? 'history-before-data'
      : !timed
        ? 'no-arrival-on-record'
        : (away ?? 0) > AWAY_DAYS * DAY_MS
          ? 'away'
          : 'counted'
    const hours = timed && firstArrival ? workingHoursBetween(firstArrival, e.at) : null
    out.push({
      ticket,
      ...meta,
      kind,
      via,
      // A hand-off always names its receiver: isBugHandoff only matches a move whose "to" is known.
      ref: via === 'link' ? e[kind][0] : (party(e.to) ?? ''),
      arrivedAt: timed ? firstArrival : null,
      at: e.at,
      hours,
      awayDays: away === null ? null : Math.round((away / DAY_MS) * 10) / 10,
      week: weekOf(e.at),
      status,
      offClock: status === 'counted' ? offClock(hours, e.at) : null,
      longWait: status === 'counted' && !!firstArrival && isLongWait(firstArrival, e.at),
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
const inShownUnit = (hours: number, metric: Metric) => (SHOWN_IN[metric] === 'h' ? hours : hours / WORKDAY_HOURS)
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
    out.push({ metric: 'response', ticket: t.ticket, week: t.week, hours: t.meanHours, entries: t.entries })
  }
  for (const r of responses) {
    const week = r.week as string
    const hours = r.hours as number
    if (short(week)) out.push({ metric: 'response', ticket: r.ticket, week, hours, out: 'short-week' })
    else if (r.longWait) {
      out.push({
        metric: 'response',
        ticket: r.ticket,
        week,
        hours,
        out: 'long-wait',
        waitedDays: daysBetween(r.arrivedAt, r.endedAt as string),
      })
    }
  }
  for (const r of card.entries.filter((x) => x.status === 'counted' && inQuarter.has(x.week))) {
    const base = { metric: r.kind, ticket: r.ticket, week: r.week, hours: r.hours as number }
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
  const byWeek = new Map<string, { ticket: string; week: string; hours: number[] }>()
  for (const r of rows) {
    const hours = r.hours as number
    all.set(r.ticket, [...(all.get(r.ticket) ?? []), hours])
    const key = `${r.ticket}|${r.week}`
    const unit = byWeek.get(key) ?? { ticket: r.ticket, week: r.week as string, hours: [] }
    unit.hours.push(hours)
    byWeek.set(key, unit)
  }
  return [...byWeek.values()].map((u) => {
    const everything = all.get(u.ticket) ?? u.hours
    return {
      ticket: u.ticket,
      week: u.week,
      entries: u.hours.length,
      meanHours: mean(u.hours),
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
  // A log that opens exactly at a Monday's midnight (a history import) holds that whole week.
  const coverageWeek = from && Date.parse(from) > Date.parse(`${weekOf(from)}T00:00:00+08:00`) ? weekOf(from) : null
  const thisWeek = weekOf(now)
  const countedResponses = response.filter(counts)
  const responseTickets = ticketWeeks(countedResponses)

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
