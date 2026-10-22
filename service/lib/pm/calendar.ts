/**
 * The PM's working calendar — which local dates count as working time.
 *
 * Every scorecard duration runs on these working days, 24 h each (workTime.ts, decided by the PM on
 * 2026-10-22): weekends and public holidays do not count, make-up workdays do. The calendar also
 * shapes the weeks: how many working days each holds, and which (fewer than three) stay out of a
 * quarter's benchmark. The PM works to the CN calendar: public holidays are off, and the make-up
 * workdays that pay for them are on, even when they fall on a weekend.
 *
 * Confirmed by the PM on 2026-09-30, and consistent with his own Halo activity where the data
 * reaches: Sunday 2026-09-20 carries 24 PM actions (a make-up workday) and Friday 2026-09-25 none
 * (Mid-Autumn). Extend this list when the next year's arrangement is published — until then a
 * public holiday of that year counts as a working day.
 *
 * The list is the PM's working calendar, not the official one, where the two differ:
 * - Saturday 2026-10-10 was an official make-up workday, but the PM did not work it (no Halo actions
 *   that day), so it is not working time (decided by the PM, 2026-10-13).
 * - Wednesday 2026-10-07 was an official holiday, but the PM worked it (112 Halo actions) and took
 *   10-10 off in its place, so it is working time (decided by the PM, 2026-10-22, when every clock
 *   moved onto his working days; under the earlier 09:30–19:00 clock he had kept it a holiday).
 * A holiday he only partly worked stays a holiday: 2026-10-01 (about an hour of work) and the Labour
 * Day holidays below.
 *
 * April–June 2026 follows the official arrangement. It was added on 2026-10-15 for the Q2 benchmark
 * (baselines.ts), and the PM team's own Halo activity agrees with it:
 * - Saturday 05-09, the make-up day, carries 7 actions. A normal weekday that quarter has a median of 10.
 * - 04-06 and 06-19 carry none.
 * - The Labour Day holidays were partly worked, but stay holidays.
 * Before April the plain weekday rule applies. Only waits that started before then would reach it.
 */
export const CALENDAR = {
  status: 'confirmed' as 'proposed' | 'confirmed',
  /** Local dates (Asia/Shanghai) that are NOT working days even though they fall Monday–Friday. */
  holidays: [
    '2026-04-06', // Qingming (Mon)
    '2026-05-01', // Labour Day
    '2026-05-04',
    '2026-05-05',
    '2026-06-19', // Dragon Boat Festival (Fri)
    '2026-09-25', // Mid-Autumn Festival (Fri)
    '2026-10-01', // National Day
    '2026-10-02',
    '2026-10-05',
    '2026-10-06',
    // Not '2026-10-07' (Wed): an official holiday the PM worked, in place of 10-10 — see above.
  ],
  /** Local dates that ARE working days even though they fall on a weekend — the make-up days. */
  makeupWorkdays: [
    '2026-05-09', // Sat, for Labour Day
    '2026-09-20', // Sun
    // Not '2026-10-10' (Sat): an official make-up day the PM did not work — see above.
  ],
  note: 'CN 2026 holiday arrangement, confirmed by the PM on 2026-09-30; the PM worked 10-07 and took 10-10 off (2026-10-13, 2026-10-22).',
}
