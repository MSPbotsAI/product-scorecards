/**
 * Benchmarks for quarters this log cannot average. The log starts in 2026-09, so it holds neither Q2
 * nor Q3.
 *
 * How the samples in baselines.data.ts were made (scripts/pm-history-baselines.ts --write):
 * - The source is the ODS Halo Actions table (dataset 1563065169343234049), which keeps every action
 *   since 2019.
 * - It was run through this same engine (buildScorecard, then quarterSamples), on the calendar in
 *   calendar.ts. So the same rules apply: holiday weeks are left out, and so are waits over
 *   LONG_WAIT_DAYS.
 * - "The PM" in each quarter is the team that worked the queue then (decided by the PM): see the
 *   script's QUARTERS.
 *
 * The benchmark is the mean of the counted samples, worked out in metrics.ts. So the list the page
 * drills into is exactly what the number averages.
 *
 * From 2027-Q1 on, the log covers the whole previous quarter, and the benchmark is averaged from it
 * automatically. Add an entry here only to override that.
 */
import { HISTORY_SAMPLES } from './baselines.data.ts'
import type { Sample } from './metrics.ts'

export const HISTORY_BASELINES: Record<string, { from: string; samples: Sample[] }> = HISTORY_SAMPLES
