/**
 * The PM's working calendar — which local dates count as working time.
 *
 * Every scorecard duration is clock time since 2026-10-19, so this calendar no longer changes how long
 * anything took. It shapes the weeks: how many working days each holds, and which (fewer than three)
 * stay out of a quarter's benchmark. The PM works to the CN calendar: public holidays are off, and the
 * make-up workdays that pay for them are on, even when they fall on a weekend.
 *
 * Confirmed by the PM on 2026-09-30, and consistent with his own Halo activity where the data
 * reaches: Sunday 2026-09-20 carries 24 PM actions (a make-up workday) and Friday 2026-09-25 none
 * (Mid-Autumn). Extend this list when the next year's arrangement is published.
 *
 * The list is the PM's working calendar, not the official one, where the two differ. Saturday
 * 2026-10-10 was an official make-up workday, but the PM did not work it (no Halo actions that day),
 * so it is not working time: counting it charged every ticket waiting over that weekend 9 hours he
 * was not at work (decided by the PM, 2026-10-13). 2026-10-07 stays a holiday even though he worked
 * it — replies on a rest day score 0.0 h and are labelled (his 2026-10-09 decision).
 *
 * April–June 2026 follows the official arrangement. It was added on 2026-10-15 for the Q2 benchmark
 * (baselines.ts), and the PM team's own Halo activity agrees with it:
 * - Saturday 05-09, the make-up day, carries 7 actions. A normal weekday that quarter has a median of 10.
 * - 04-06 and 06-19 carry none.
 * - The Labour Day holidays were partly worked, but stay holidays by the 10-07 rule.
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
    '2026-10-07',
  ],
  /** Local dates that ARE working days even though they fall on a weekend — the make-up days. */
  makeupWorkdays: [
    '2026-05-09', // Sat, for Labour Day
    '2026-09-20', // Sun
    // Not '2026-10-10' (Sat): an official make-up day the PM did not work — see above.
  ],
  note: 'CN 2026 holiday arrangement, confirmed by the PM on 2026-09-30; 2026-10-10 is not worked (2026-10-13).',
}
