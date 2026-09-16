// Drizzle schema. Its presence is what makes `mspack` provision the app's Postgres schema and run
// migrations. The schema name MUST equal package.json "id" — that id is stable across releases,
// which is exactly why settings stored here survive a version update (the dist bundle is replaced;
// this schema is not).

import { integer, pgSchema, primaryKey, text, timestamp, varchar } from 'drizzle-orm/pg-core'

// biome-ignore lint/security/noSecrets: the app's public platform id, mirrored from package.json
const app = pgSchema('yke0x6nvil03yca1cx686ioxx6wbi4fg') // === package.json "id"

/**
 * Single key/value store for app configuration set from the Settings page.
 * Keys in use: `public_api_key`, `dataset.ai_weekly`, `dataset.ai_credit`, `dataset.weekly_metrics`.
 */
export const settings = app.table('settings', {
  key: varchar('key', { length: 128 }).primaryKey(),
  value: text('value').notNull(),
  updatedBy: text('updated_by'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export type Setting = typeof settings.$inferSelect

/**
 * Weekly values for `kind: 'manual'` rows (service/lib/rows.ts) — rows with no dataset behind
 * them, hand-entered from the row's edit dialog. `week` is the Thursday date (YYYY-MM-DD) the
 * value was logged for.
 */
export const metricValues = app.table(
  'metric_values',
  {
    metricId: varchar('metric_id', { length: 32 }).notNull(),
    week: varchar('week', { length: 10 }).notNull(),
    value: integer('value').notNull(),
    updatedBy: text('updated_by'),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.metricId, t.week] })],
)

export type MetricValue = typeof metricValues.$inferSelect

/**
 * Runtime overrides for a `thresholdEditable` row's target/yellowMin (service/lib/rows.ts) —
 * edited from the row's own dialog when the code default needs to move without a redeploy.
 */
export const metricThresholds = app.table('metric_thresholds', {
  metricId: varchar('metric_id', { length: 32 }).primaryKey(),
  target: integer('target').notNull(),
  yellowMin: integer('yellow_min'),
  updatedBy: text('updated_by'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export type MetricThreshold = typeof metricThresholds.$inferSelect
