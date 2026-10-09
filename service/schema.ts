// Drizzle schema. Its presence is what makes `mspack` provision the app's Postgres schema and run
// migrations. The schema name MUST equal package.json "id" — that id is stable across releases,
// which is exactly why settings stored here survive a version update (the dist bundle is replaced;
// this schema is not).

import { sql } from 'drizzle-orm'
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

/*
 * The Support Ticket Updates log (service/lib/pm). Halo keeps ~14 days of ticket actions, so each
 * capture copies the actions the PM numbers read into these tables; the numbers are computed from
 * them, never from Halo directly. Rows are reduced facts — who moved a ticket where, which dev and
 * Canny links the PM posted — never a note's text.
 */

/** One Halo action. Written once and never updated: an action does not change after it happens. */
export const pmEvents = app.table('pm_events', {
  /** Halo action id, "<ticket>-<n>". */
  id: varchar('id', { length: 64 }).primaryKey(),
  ticket: varchar('ticket', { length: 32 }).notNull(),
  /** Halo's per-ticket sequence (time_log_id); 1 is the ticket's first action. */
  seq: integer('seq').notNull(),
  at: timestamp('at', { withTimezone: true }).notNull(),
  who: text('who').notNull(),
  outcome: text('outcome').notNull(),
  fromDept: text('from_dept'),
  fromPerson: text('from_person'),
  toDept: text('to_dept'),
  toPerson: text('to_person'),
  prd: text('prd').array().notNull().default(sql`'{}'::text[]`),
  mb: text('mb').array().notNull().default(sql`'{}'::text[]`),
  canny: text('canny').array().notNull().default(sql`'{}'::text[]`),
})

/**
 * Per ticket: its first action's instant (proves the log holds the ticket's whole history) and the
 * summary / client shown beside it. Either half may be missing — the first-action slice covers every
 * new ticket, the summary only tickets the PM numbers touch.
 */
export const pmTickets = app.table('pm_tickets', {
  ticket: varchar('ticket', { length: 32 }).primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }),
  summary: text('summary'),
  client: text('client'),
})

/** One row per capture (or imported capture): how far back it saw, which is how gaps are found. */
export const pmCaptures = app.table('pm_captures', {
  at: timestamp('at', { withTimezone: true }).primaryKey(),
  source: varchar('source', { length: 16 }).notNull(),
  rows: integer('rows').notNull(),
  oldest: timestamp('oldest', { withTimezone: true }),
  newest: timestamp('newest', { withTimezone: true }),
})
