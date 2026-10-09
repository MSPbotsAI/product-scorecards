/**
 * The PM's working calendar — which local dates count as working time.
 *
 * Every duration on the PM scorecard is measured in working time, and the PM works to the CN
 * calendar: public holidays are off, and the make-up workdays that pay for them are on, even
 * when they fall on a weekend. Getting this wrong is not a rounding error — a request that lands on
 * 30 September and is answered on 8 October waited zero working days across National Day, not six.
 *
 * Confirmed by the PM on 2026-09-30, and consistent with his own Halo activity where the data
 * reaches: Sunday 2026-09-20 carries 24 PM actions (a make-up workday) and Friday 2026-09-25 none
 * (Mid-Autumn). Extend this list when the next year's arrangement is published.
 */
export const CALENDAR = {
  status: 'confirmed' as 'proposed' | 'confirmed',
  /** Local dates (Asia/Shanghai) that are NOT working days even though they fall Monday–Friday. */
  holidays: [
    '2026-09-25', // Mid-Autumn Festival (Fri)
    '2026-10-01', // National Day
    '2026-10-02',
    '2026-10-05',
    '2026-10-06',
    '2026-10-07',
  ],
  /** Local dates that ARE working days even though they fall on a weekend — the make-up days. */
  makeupWorkdays: [
    '2026-09-20', // Sun
    '2026-10-10', // Sat
  ],
  note: 'CN 2026 holiday arrangement, confirmed by the PM on 2026-09-30.',
}
