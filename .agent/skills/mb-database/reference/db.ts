// Copy to: service/lib/db.ts
//
// Lazily-initialised singleton Drizzle client (postgres-js driver) for an MSPBots
// Node app. Connection details come from the DB_* env vars (.env.local) plus the
// platform-injected APP_ID. Migrated tables are owned by the per-app restricted
// role `user_<APP_ID>` / `pass_<APP_ID>`.
//
// Requires: pnpm add postgres   (drizzle-orm ships with the template)

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

function connectionUrl(): string {
  const appId = process.env.APP_ID ?? ''
  const host = process.env.DB_HOST ?? '127.0.0.1'
  const port = process.env.DB_PORT ?? '5432'
  const database = process.env.DB_NAME
  // .env.local sets DB_USER/DB_PASSWORD to the full per-app role; fall back to
  // deriving them from APP_ID if only that is present.
  const user = process.env.DB_USER ?? `user_${appId}`
  const password = process.env.DB_PASSWORD ?? `pass_${appId}`
  if (!database) throw new Error('Missing DB_NAME environment variable')
  return `postgres://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}?sslmode=disable`
}

let db: ReturnType<typeof drizzle> | null = null

/** Get the shared Drizzle database client (created on first call). */
export function getDb(): ReturnType<typeof drizzle> {
  if (!db) {
    const client = postgres(connectionUrl(), { connection: { timezone: 'UTC' } })
    db = drizzle(client)
  }
  return db
}
