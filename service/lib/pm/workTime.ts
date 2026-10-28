/**
 * The PM's clocks.
 *
 * Every scorecard duration runs on the PM's working days, whole days of 24 h (`workdayMsBetween`,
 * decided by the PM on 2026-10-22): nights on a working day count, weekends and public holidays do
 * not, make-up workdays do. `calendar.ts` defines the days. The 09:30–19:00 working hours only shape
 * the weeks: how many working hours each holds (the card's progress bar).
 *
 * Asia/Shanghai has had no daylight saving since 1991, so a fixed UTC+8 offset is exact — no tz
 * database, and no chance of a DST edge quietly shifting an hour.
 */
import { CALENDAR } from './calendar.ts'

const OFFSET_MS = 8 * 3600_000
const HOUR_MS = 3600_000
const DAY_MS = 86400_000

/**
 * The PM's working hours, local time. Set by the PM on 2026-10-13 (09:30–19:00); the clock ran
 * 09:00–18:00 before that, which counted half an hour he is not yet at work and missed the hour
 * after 18:00 that he is.
 */
export const WORK_START = '09:30'
export const WORK_END = '19:00'
const minutesOf = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5))
const OPEN_MS = minutesOf(WORK_START) * 60_000
const CLOSE_MS = minutesOf(WORK_END) * 60_000
/** One working day (9.5 h), for turning working hours into working days on the page. */
export const WORKDAY_HOURS = (CLOSE_MS - OPEN_MS) / HOUR_MS

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

/**
 * The part of from → to (epoch ms) that falls on the PM's working days (`isWorkday`), Asia/Shanghai,
 * in ms. A working day counts whole, 00:00–24:00; a weekend or public holiday not at all.
 */
export function workdayMsBetween(from: number, to: number): number {
  let ms = 0
  for (let t = from; t < to; ) {
    const day = localDate(t)
    const next = Math.min(localMidnight(day) + DAY_MS, to)
    if (isWorkday(day)) ms += next - t
    t = next
  }
  return ms
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
 * WORK_START–WORK_END window, on working days only. Zero when `end` is not after `start` — a response can
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
      const open = midnight + OPEN_MS
      const close = midnight + CLOSE_MS
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
 * When the clock starts for something that arrives at `iso`: `iso` itself on a working day, otherwise
 * 00:00 of the next working day. Lets the page say "clock from 10-08 00:00" for a ticket that arrived
 * during a holiday, instead of leaving a week-long wait to look like a few hours.
 */
export function clockStart(iso: string): string {
  const t = Date.parse(iso)
  if (!Number.isFinite(t)) return iso
  let day = localDate(t)
  if (isWorkday(day)) return iso
  for (let guard = 0; guard < 400; guard++) {
    day = localDate(localMidnight(day) + DAY_MS)
    if (isWorkday(day)) return new Date(localMidnight(day)).toISOString()
  }
  return iso
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
