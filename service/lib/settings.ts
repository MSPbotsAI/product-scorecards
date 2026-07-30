// App settings: the values the Settings page owns.
//
// Resolution order per key: database → environment variable → built-in default.
// The database is what makes a value survive a version update — the dist bundle is replaced on
// every publish, but the app's Postgres schema (named after the stable package.json id) is not.
// The env fallback keeps the app working before anything has been saved, and keeps local dev
// running without a database.

import { eq } from 'drizzle-orm'
import { getDb } from './db.ts'
import { settings } from '../schema.ts'

export interface SettingDef {
  key: string
  /** Env var consulted when the database has no value. */
  env: string
  default: string
  secret?: boolean
}

export const SETTING_DEFS: SettingDef[] = [
  { key: 'public_api_key', env: 'PUBLIC_API_KEY', default: '', secret: true },
  { key: 'dataset.ai_weekly', env: 'AI_WEEKLY_DATASET', default: '2082481324433739777' },
  { key: 'dataset.ai_credit', env: 'AI_CREDIT_DATASET', default: '1985255723050872834' },
  { key: 'dataset.weekly_metrics', env: 'WEEKLY_METRICS_DATASET', default: '2082466110929776641' },
  { key: 'dataset.timesheet', env: 'TIMESHEET_DATASET', default: '2073966327621623809' },
  // Root of the reporting tree that defines "our people". Filtering by department would miss
  // product-team members who sit in other departments (Kevin in MSPbots.ai, Glenn in Asset - Core),
  // and filtering by manager alone would miss the root and second-level reports.
  { key: 'org.root', env: 'ORG_ROOT', default: 'Micus Zhang' },
  // People to drop from the resolved tree, comma-separated. Needed because the timesheet source
  // lags real transfers: Nora Li moved to the dev team but her rows still carry manager "Grace Guo"
  // and department "Product", so the tree would keep counting her hours as product labor.
  { key: 'org.exclude', env: 'ORG_EXCLUDE', default: 'Nora Li' },
]

const DEFS = new Map(SETTING_DEFS.map((d) => [d.key, d]))

export interface SettingsSnapshot {
  values: Record<string, string>
  /** Where each value came from, so the UI never implies a saved value that isn't saved. */
  origin: Record<string, 'database' | 'environment' | 'default'>
  /** Null when the database is reachable; the reason it isn't when it's not. */
  storageError: string | null
}

let cache: SettingsSnapshot | null = null

function fromEnvOrDefault(): SettingsSnapshot {
  const values: Record<string, string> = {}
  const origin: SettingsSnapshot['origin'] = {}
  for (const def of SETTING_DEFS) {
    const env = process.env[def.env]
    values[def.key] = env && env.length > 0 ? env : def.default
    origin[def.key] = env && env.length > 0 ? 'environment' : 'default'
  }
  return { values, origin, storageError: null }
}

/** Read every setting, layering the database over env/defaults. Cached until a write invalidates it. */
export async function readSettings(): Promise<SettingsSnapshot> {
  if (cache) return cache

  const snapshot = fromEnvOrDefault()
  try {
    const rows = await getDb().select().from(settings)
    for (const row of rows) {
      if (!DEFS.has(row.key)) continue // ignore keys this version doesn't know about
      if (row.value.length === 0) continue
      snapshot.values[row.key] = row.value
      snapshot.origin[row.key] = 'database'
    }
  } catch (error) {
    // No database (local dev without DB_*, or an unreachable one): env/defaults still serve the
    // app. Saving is what breaks, and the UI says so rather than pretending a write succeeded.
    snapshot.storageError = (error as Error).message.slice(0, 200)
  }

  cache = snapshot
  return snapshot
}

/** Persist one or more settings. Throws when there is no database — a silent no-op would be worse. */
export async function writeSettings(patch: Record<string, string>, updatedBy: string | null): Promise<void> {
  const db = getDb()
  for (const [key, raw] of Object.entries(patch)) {
    const def = DEFS.get(key)
    if (!def) throw new Error(`unknown setting: ${key}`)
    const value = raw.trim()
    // Secrets may be blank (means "keep"), and an empty exclusion list is a legitimate state.
    const mayBeEmpty = def.secret || key === 'org.exclude'
    if (!mayBeEmpty && value.length === 0) throw new Error(`${key} cannot be empty`)
    if (key.startsWith('dataset.') && !/^\d{6,25}$/.test(value)) {
      throw new Error(`${key} must be a numeric dataset id`)
    }
    await db
      .insert(settings)
      .values({ key, value, updatedBy })
      .onConflictDoUpdate({ target: settings.key, set: { value, updatedBy, updatedAt: new Date() } })
  }
  cache = null
}

export function invalidateSettings(): void {
  cache = null
}

/** Never send a secret back to the browser — a length-aware hint is enough to confirm it is set. */
export function maskSecret(value: string): string {
  if (!value) return ''
  return value.length <= 8 ? '••••' : `${value.slice(0, 4)}••••${value.slice(-4)}`
}
