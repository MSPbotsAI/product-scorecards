// App settings: the values the Settings page owns.
//
// Resolution order per key: database -> environment variable -> built-in default.
// The database is what makes a value survive a version update: the dist bundle is replaced on
// every publish, but the app's Postgres schema (named after the stable package.json id) is not.
// The env fallback keeps the app working before anything has been saved, and keeps local dev
// running without a database.
//
// Every tenant has its own database (@mspbots/tenant-db), so every read and write is for ONE tenant,
// the one on the caller's token, and the cache is keyed by tenant too.

import { db } from './db.ts'
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
  // Deep-link template for a timesheet ticket. The dataset only carries the human ticket key
  // (PRD-15944), not ClickUp's internal task id, so the link is built from the key: ClickUp
  // resolves a Custom Task ID under /t/<workspace>/<key>. Kept as a template rather than a
  // workspace id so the shape stays editable; blank turns the links back into plain text.
  { key: 'clickup.ticket_url', env: 'CLICKUP_TICKET_URL', default: 'https://app.clickup.com/t/2280862/{id}' },
  // Root of the reporting tree that defines "our people". Filtering by department would miss
  // product-team members who sit in other departments (Kevin in MSPbots.ai, Glenn in Asset - Core),
  // and filtering by manager alone would miss the root and second-level reports.
  { key: 'org.root', env: 'ORG_ROOT', default: 'Micus Zhang' },
  // People to drop from the resolved tree, comma-separated. Needed because the timesheet source
  // lags real transfers: Nora Li moved to the dev team but her rows still carry manager "Grace Guo"
  // and department "Product", so the tree would keep counting her hours as product labor.
  { key: 'org.exclude', env: 'ORG_EXCLUDE', default: 'Nora Li' },
  // The SOP Agent engagement store — the markdown repo `/sopagent-sync` writes and the ClickUp
  // client-engagement board mirrors. Cloned at runtime and pulled every 5 minutes, so a store push
  // reaches this app without a republish. The token is a repo-scoped PAT; the repo is private.
  { key: 'store.git_url', env: 'STORE_GIT_URL', default: 'https://github.com/MSPbotsAI/sop-agent-engagement.git' },
  { key: 'store.git_token', env: 'STORE_GIT_TOKEN', default: '', secret: true },
]

const DEFS = new Map(SETTING_DEFS.map((d) => [d.key, d]))

export interface SettingsSnapshot {
  values: Record<string, string>
  /** Where each value came from, so the UI never implies a saved value that isn't saved. */
  origin: Record<string, 'database' | 'environment' | 'default'>
  /** Null when the database is reachable; the reason it isn't when it's not. */
  storageError: string | null
}

/** One snapshot per tenant, until a write for that tenant invalidates it. */
const cache = new Map<string, SettingsSnapshot>()

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

/** Read every setting of one tenant, layering its database over env/defaults. Cached until a write invalidates it. */
export async function readSettings(tenantId: string): Promise<SettingsSnapshot> {
  const hit = cache.get(tenantId)
  if (hit) return hit

  const snapshot = fromEnvOrDefault()
  try {
    const rows = await (await db(tenantId)).select().from(settings)
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

  cache.set(tenantId, snapshot)
  return snapshot
}

/** Persist one or more settings for one tenant. Throws when there is no database: a silent no-op would be worse. */
export async function writeSettings(tenantId: string, patch: Record<string, string>, updatedBy: string | null): Promise<void> {
  const conn = await db(tenantId)
  for (const [key, raw] of Object.entries(patch)) {
    const def = DEFS.get(key)
    if (!def) throw new Error(`unknown setting: ${key}`)
    const value = raw.trim()
    // Secrets may be blank (means "keep"), an empty exclusion list is a legitimate state, and a
    // blank ticket-url template is how ticket links get switched off.
    const mayBeEmpty = def.secret || key === 'org.exclude' || key === 'clickup.ticket_url'
    if (!mayBeEmpty && value.length === 0) throw new Error(`${key} cannot be empty`)
    if (key.startsWith('dataset.') && !/^\d{6,25}$/.test(value)) {
      throw new Error(`${key} must be a numeric dataset id`)
    }
    // A template without {id} would send every ticket to the same page: reject it rather than
    // render links that all lie. http(s) only: the value becomes an href in the browser.
    if (key === 'clickup.ticket_url' && value.length > 0) {
      if (!/^https?:\/\//i.test(value)) throw new Error(`${key} must start with http:// or https://`)
      if (!value.includes('{id}')) throw new Error(`${key} must contain the {id} placeholder`)
    }
    await conn
      .insert(settings)
      .values({ key, value, updatedBy })
      .onConflictDoUpdate({ target: settings.key, set: { value, updatedBy, updatedAt: new Date() } })
  }
  cache.delete(tenantId)
}

/** Drop the cached snapshot of one tenant (or of every tenant when none is given). */
export function invalidateSettings(tenantId?: string): void {
  if (tenantId) cache.delete(tenantId)
  else cache.clear()
}

/** Never send a secret back to the browser: a length-aware hint is enough to confirm it is set. */
export function maskSecret(value: string): string {
  if (!value) return ''
  return value.length <= 8 ? '****' : `${value.slice(0, 4)}****${value.slice(-4)}`
}
