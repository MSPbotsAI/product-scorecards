// Drizzle schema. Its presence is what makes `mspack` provision the app's Postgres schema and run
// migrations. The schema name MUST equal package.json "id" — that id is stable across releases,
// which is exactly why settings stored here survive a version update (the dist bundle is replaced;
// this schema is not).

import { pgSchema, text, timestamp, varchar } from 'drizzle-orm/pg-core'

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
