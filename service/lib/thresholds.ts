// Runtime target/yellowMin overrides for `thresholdEditable` rows (service/lib/rows.ts). Mirrors
// the read/write/degrade-gracefully shape of manual-metrics.ts and settings.ts. Every call is for
// one tenant, the one on the caller's token (@mspbots/tenant-db gives each tenant its own database).

import { db } from './db.ts'
import { metricThresholds } from '../schema.ts'

export interface ThresholdOverride {
  target: number
  yellowMin: number | null
}

/** Every saved threshold override of one tenant, keyed by metric id. */
export async function readThresholdOverrides(tenantId: string): Promise<Map<string, ThresholdOverride>> {
  const out = new Map<string, ThresholdOverride>()
  try {
    const rows = await (await db(tenantId)).select().from(metricThresholds)
    for (const row of rows) {
      out.set(row.metricId, { target: row.target, yellowMin: row.yellowMin })
    }
  } catch {
    // No database (local dev without DB_*, or unreachable): every row falls back to its code
    // default target/yellowMin, the same degrade-gracefully rule as readManualSeries()/readSettings().
  }
  return out
}

/** Upsert one metric's threshold override for one tenant. Throws when there is no database: a silent no-op would be worse. */
export async function writeThresholdOverride(
  tenantId: string,
  metricId: string,
  override: ThresholdOverride,
  updatedBy: string | null,
): Promise<void> {
  const conn = await db(tenantId)
  await conn
    .insert(metricThresholds)
    .values({ metricId, target: override.target, yellowMin: override.yellowMin, updatedBy })
    .onConflictDoUpdate({
      target: metricThresholds.metricId,
      set: { target: override.target, yellowMin: override.yellowMin, updatedBy, updatedAt: new Date() },
    })
}
