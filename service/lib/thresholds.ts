// Runtime target/yellowMin overrides for `thresholdEditable` rows (service/lib/rows.ts) — mirrors
// the read/write/degrade-gracefully shape of manual-metrics.ts and settings.ts.

import { getDb } from './db.ts'
import { metricThresholds } from '../schema.ts'

export interface ThresholdOverride {
  target: number
  yellowMin: number | null
}

/** Every saved threshold override, keyed by metric id. */
export async function readThresholdOverrides(): Promise<Map<string, ThresholdOverride>> {
  const out = new Map<string, ThresholdOverride>()
  try {
    const rows = await getDb().select().from(metricThresholds)
    for (const row of rows) {
      out.set(row.metricId, { target: row.target, yellowMin: row.yellowMin })
    }
  } catch {
    // No database (local dev without DB_*, or unreachable): every row falls back to its code
    // default target/yellowMin — same degrade-gracefully rule as readManualSeries()/readSettings().
  }
  return out
}

/** Upsert one metric's threshold override. Throws when there is no database — a silent no-op would be worse. */
export async function writeThresholdOverride(
  metricId: string,
  override: ThresholdOverride,
  updatedBy: string | null,
): Promise<void> {
  const db = getDb()
  await db
    .insert(metricThresholds)
    .values({ metricId, target: override.target, yellowMin: override.yellowMin, updatedBy })
    .onConflictDoUpdate({
      target: metricThresholds.metricId,
      set: { target: override.target, yellowMin: override.yellowMin, updatedBy, updatedAt: new Date() },
    })
}
