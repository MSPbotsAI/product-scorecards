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
    schema: id
  },
  schemaFilter: id,

  tablesFilter: ['!__drizzle_migrations'],

  dbCredentials: {
    host: env('DB_HOST', '20.241.40.252'),
    port: Number(env('DB_PORT', '15432')),
    user: env('DB_USER', `user_${id}`),
    password: env('DB_PASSWORD', `pass_${id}`),
    database: env('DB_NAME', 'mb_app_agentint'),
  },

  verbose: true,
  strict: true,
})
