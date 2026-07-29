// Copy to: service/schema.ts
//
// The PRESENCE of service/schema.ts is what triggers `mspack` migrations.
// The schema name passed to pgSchema(...) MUST equal your app's `id` in
// package.json — drizzle.config.ts filters migrations by that id (schemaFilter),
// and the platform provisions one isolated Postgres schema + restricted role per id.

import { pgSchema, varchar, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core'
import { randomUUID } from 'node:crypto'

const app = pgSchema('REPLACE_WITH_YOUR_APP_ID') // === package.json "id"

export const users = app.table('users', {
  id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => randomUUID()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  age: integer('age'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Inferred row types — use these in handlers and the db layer.
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
