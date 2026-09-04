// Weekly values for `kind: 'manual'` rows — hand-entered, no dataset behind them. Mirrors the
// read/write shape of settings.ts: the database is the source of truth, and any DB error degrades
// the affected rows to `nodata` rather than failing the whole scorecard.

import { asc } from 'drizzle-orm'
import { getDb } from './db.ts'
import { metricValues } from '../schema.ts'

export interface ManualPoint {
  week: string
  value: number
}

/** Every manually-entered weekly value, grouped by metric id, oldest -> newest. */
export async function readManualSeries(): Promise<Map<string, ManualPoint[]>> {
  const out = new Map<string, ManualPoint[]>()
  try {
    const rows = await getDb().select().from(metricValues).orderBy(asc(metricValues.week))
    for (const row of rows) {
      const point: ManualPoint = { week: row.week, value: row.value }
      const list = out.get(row.metricId)
      if (list) list.push(point)
      else out.set(row.metricId, [point])
    }
  } catch {
    // No database (local dev without DB_*, or unreachable): every manual row reports nodata,
    // same as an unsourced row — a silent zero would be worse than an honest gap.
  }
  return out
}

/** Upsert one metric's weekly values. Throws when there is no database — a silent no-op would be worse. */
export async function writeManualValues(
  metricId: string,
  values: { week: string; value: number }[],
  updatedBy: string | null,
): Promise<void> {
  const db = getDb()
  for (const { week, value } of values) {
    await db
      .insert(metricValues)
      .values({ metricId, week, value, updatedBy })
      .onConflictDoUpdate({
        target: [metricValues.metricId, metricValues.week],
        set: { value, updatedBy, updatedAt: new Date() },
      })
  }
}
