import { defineConfig } from 'drizzle-kit'
import { existsSync, readFileSync } from 'node:fs'

const env = (key: string, fallback: string): string => process.env[key] ?? fallback

function appId(): string {
  try {
    return JSON.parse(readFileSync('package.json', 'utf8')).id || 'public'
  } catch {
    return 'public'
  }
}

function schema(): string {
  if (existsSync('service/schema.ts')) return 'service/schema.ts'
  if (existsSync('service/schemas')) return 'service/schemas'
  return 'service/schema.ts'
}

const id = appId()

export default defineConfig({
  dialect: 'postgresql',
  schema: schema(),
  out: 'drizzle',

  migrations: {
    table: '__drizzle_migrations',
    prefix: 'timestamp',
    schema: id,
  },
  schemaFilter: id,

  tablesFilter: ['!__drizzle_migrations'],

  // Local development targets the shared MSPBots dev database (disposable, no sensitive data) with the
  // common `mb_dev` role, so `pnpm migrate` needs only DB_PASSWORD (copy .env.example → .env.local).
  // The migration creates the app schema itself (CREATE SCHEMA IF NOT EXISTS <id>) — no provisioning step.
  // Deployed apps get DB_* injected by the platform; per-tenant access goes through pg-proxy (mb-database skill).
  dbCredentials: {
    host: env('DB_HOST', '20.241.40.252'),
    port: Number(env('DB_PORT', '15432')),
    database: env('DB_NAME', 'mb_app_agentint'),
    user: env('DB_USER', 'mb_dev'),
    password: env('DB_PASSWORD', ''),
  },

  verbose: true,
  strict: true,
})
