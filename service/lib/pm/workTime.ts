/**
 * The PM's working clock.
 *
 * Every duration on the PM scorecard is working time, not wall-clock time: a request that lands at
 * 17:30 on Friday and is answered at 09:30 on Monday waited one working hour, not sixty-four. The
 * clock is Asia/Shanghai, 09:00–18:00, on the working days `calendar.ts` defines.
 *
 * Asia/Shanghai has had no daylight saving since 1991, so a fixed UTC+8 offset is exact — no tz
 * database, and no chance of a DST edge quietly shifting an hour.
 */
import { CALENDAR } from './calendar.ts'

const OFFSET_MS = 8 * 3600_000
const HOUR_MS = 3600_000
const DAY_MS = 86400_000

export const WORK_START_HOUR = 9
export const WORK_END_HOUR = 18
/** One working day, for turning working hours into working days on the page. */
export const WORKDAY_HOURS = WORK_END_HOUR - WORK_START_HOUR

const holidays = new Set(CALENDAR.holidays)
const makeup = new Set(CALENDAR.makeupWorkdays)

/** The Asia/Shanghai calendar date (YYYY-MM-DD) an instant falls on. */
export function localDate(ms: number): string {
  return new Date(ms + OFFSET_MS).toISOString().slice(0, 10)
}

/** 0 = Sunday … 6 = Saturday, for a local date string. */
function dayOfWeek(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay()
}

/** The UTC instant of local midnight at the start of a local date. */
function localMidnight(date: string): number {
  return Date.parse(`${date}T00:00:00Z`) - OFFSET_MS
}

/** Whether the PM works on this local date: weekday and not a holiday, or a listed make-up day. */
export function isWorkday(date: string): boolean {
  if (makeup.has(date)) return true
  if (holidays.has(date)) return false
  const dow = dayOfWeek(date)
  return dow !== 0 && dow !== 6
}

/**
 * Working milliseconds between two instants.
 *
 * Walks the local calendar one day at a time and adds the overlap of [start, end] with that day's
 * 09:00–18:00 window, on working days only. Zero when `end` is not after `start` — a response can
 * never be credited with negative time.
 */
export function workingMsBetween(startIso: string, endIso: string): number {
  const start = Date.parse(startIso)
  const end = Date.parse(endIso)
  if (!Number.isFinite(start) || !Number.isFinite(end) || !(end > start)) return 0

  let total = 0
  let day = localDate(start)
  const last = localDate(end)
  // A ten-year bound is far past any real ticket; it exists only so a corrupt date cannot spin forever.
  for (let guard = 0; guard < 3700; guard++) {
    if (isWorkday(day)) {
      const midnight = localMidnight(day)
      const open = midnight + WORK_START_HOUR * HOUR_MS
      const close = midnight + WORK_END_HOUR * HOUR_MS
      const from = Math.max(start, open)
      const to = Math.min(end, close)
      if (to > from) total += to - from
    }
    if (day === last) break
    day = localDate(localMidnight(day) + DAY_MS)
  }
  return total
}

export function workingHoursBetween(startIso: string, endIso: string): number {
  return workingMsBetween(startIso, endIso) / HOUR_MS
}

/**
 * The week an instant is reported in: the local Monday that starts its Monday–Sunday span.
 *
 * Only working hours count, so the span holds the same working time as Monday–Friday plus any
 * make-up day — but an instant on a weekend still has to belong somewhere, and it goes to the week
 * that Monday opened, the one just ending.
 */
export function weekOf(iso: string): string {
  const date = localDate(Date.parse(iso))
  const back = (dayOfWeek(date) + 6) % 7
  return new Date(Date.parse(`${date}T00:00:00Z`) - back * DAY_MS).toISOString().slice(0, 10)
}

/**
 * "09-28 – 10-04": the whole Monday–Sunday span the week covers.
 *
 * Labelled to Sunday, not Friday: weekend and make-up-day events are counted in the week, so a
 * Monday–Friday label both hid them (the 09-20 Sunday make-up day, the 10-10 Saturday one) and left
 * a visible two-day hole between every pair of consecutive weeks.
 */
export function weekLabel(monday: string): string {
  const sunday = new Date(Date.parse(`${monday}T00:00:00Z`) + 6 * DAY_MS).toISOString().slice(0, 10)
  return `${monday.slice(5)} – ${sunday.slice(5)}`
}

export interface WeekShape {
  /** Working days in the Monday–Sunday span, after holidays and make-up days. */
  workdays: number
  /** Monday–Friday dates the calendar takes off. */
  holidays: number
  /** Weekend dates the calendar puts on. */
  makeupDays: number
  totalHours: number
  /** Working hours of the week already behind `nowIso` — equal to totalHours once the week is over. */
  elapsedHours: number
}

/**
 * How much working time a week holds, and how much of it has passed.
 *
 * Not every week is five days: the week of 2026-09-28 has three before National Day, and the week of
 * 2026-09-14 has six with its Sunday make-up day. A reader comparing weeks needs to see that.
 */
export function weekShape(monday: string, nowIso: string): WeekShape {
  const startMs = localMidnight(monday)
  const endMs = startMs + 7 * DAY_MS
  const start = new Date(startMs).toISOString()
  const end = new Date(endMs).toISOString()
  let workdays = 0
  let holidayCount = 0
  let makeupDays = 0
  for (let i = 0; i < 7; i++) {
    const date = localDate(startMs + i * DAY_MS + HOUR_MS)
    const weekend = i >= 5
    const works = isWorkday(date)
    if (works) workdays++
    if (!weekend && !works) holidayCount++
    if (weekend && works) makeupDays++
  }
  const cut = Date.parse(nowIso) < endMs ? nowIso : end
  return {
    workdays,
    holidays: holidayCount,
    makeupDays,
    totalHours: workingHoursBetween(start, end),
    elapsedHours: workingHoursBetween(start, cut),
  }
}

/** Mondays from the week containing `fromIso` to the week containing `toIso`, oldest first. */
export function weeksBetween(fromIso: string, toIso: string): string[] {
  const out: string[] = []
  let monday = weekOf(fromIso)
  const last = weekOf(toIso)
  for (let guard = 0; guard < 600 && monday <= last; guard++) {
    out.push(monday)
    monday = new Date(Date.parse(`${monday}T00:00:00Z`) + 7 * DAY_MS).toISOString().slice(0, 10)
  }
  return out
}
