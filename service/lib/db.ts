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

// Defaults match drizzle.config.ts exactly. They have to: the migration runs against the config's
// defaults, so a runtime that demanded its own env vars would provision a table it then could not
// read. In production the platform injects DB_* and these are never used.
const DEFAULTS = { host: '20.241.40.252', port: '15432', database: 'mb_app_agentint' }

function connectionUrl(): string {
  const appId = process.env.APP_ID ?? ''
  const host = process.env.DB_HOST ?? DEFAULTS.host
  const port = process.env.DB_PORT ?? DEFAULTS.port
  const database = process.env.DB_NAME ?? DEFAULTS.database
  // .env.local sets DB_USER/DB_PASSWORD to the full per-app role; fall back to
  // deriving them from APP_ID if only that is present.
  const user = process.env.DB_USER ?? `user_${appId}`
  const password = process.env.DB_PASSWORD ?? `pass_${appId}`
  if (!user || user === 'user_') throw new Error('Cannot derive the database role: APP_ID is not set')
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
