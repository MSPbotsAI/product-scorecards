/**
 * Benchmarks for quarters this log cannot average. The log starts in 2026-09, so it holds neither Q2
 * nor Q3.
 *
 * How these were computed (2026-10-15, scripts/pm-history-baselines.ts):
 * - The source is the ODS Halo Actions table (dataset 1563065169343234049), which keeps every action
 *   since 2019.
 * - It was run through this same engine (buildScorecard, then quarterAverages), on the calendar in
 *   calendar.ts. So the same rules apply: holiday weeks are left out, and so are waits over
 *   LONG_WAIT_DAYS.
 * - "The PM" there is the PM team of the time (decided by the PM, 2026-10-14): Frank Tian, Grace Guo,
 *   Micus Zhang and the shared product_zd@mspbots.ai account. Grace and Micus also worked the queue
 *   in Q2; Frank's own Halo actions start in June 2026.
 *
 * From 2027-Q1 on, the log covers the whole previous quarter, and the benchmark is averaged from it
 * automatically. Add an entry here only to override that.
 */
import type { Average, Metric } from './metrics.ts'

export const HISTORY_BASELINES: Record<string, { from: string; lines: Record<Metric, Average> }> = {
  '2026-Q3': {
    from: '2026-Q2',
    lines: {
      response: { hours: 20.533, n: 67 },
      prd: { hours: 79.238, n: 11 },
      mb: { hours: 7.758, n: 20 },
      canny: { hours: 22.807, n: 18 },
    },
  },
  '2026-Q4': {
    from: '2026-Q3',
    lines: {
      response: { hours: 7.69, n: 126 },
      prd: { hours: 45.549, n: 30 },
      mb: { hours: 20.0, n: 30 },
      canny: { hours: 26.971, n: 19 },
    },
  },
}
