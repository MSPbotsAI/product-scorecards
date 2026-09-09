// The SOP Agent engagement store, kept fresh on disk.
//
// The store (`MSPbotsAI/sop-agent-engagement`) is a markdown data repo written by the
// `/sopagent-sync` routine 2-4x a day. It is the same source the ClickUp client-engagement board
// mirrors, so reading it here means the scorecard and the board cannot disagree.
//
// Mechanism copied deliberately from `sop-agent-clients-app/service/lib/storeSync.ts`, which has
// run against this repo since it was built: shallow-clone once, then `git pull --ff-only` at most
// every PULL_INTERVAL. A store push therefore reaches this app without a republish.

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { readSettings } from './settings.ts'

const PULL_INTERVAL_MS = 5 * 60_000

/** A sibling checkout, for local dev. Same convention the clients app uses. */
const LOCAL_CANDIDATES = [
  resolve(process.cwd(), '../sop-agent-engagement'),
  resolve(process.cwd(), '../sopagent-engagement'),
]
const DATA_DIR = process.env.SOPAGENT_DATA_DIR ?? resolve(process.cwd(), 'data')
const CLONE_DIR = join(DATA_DIR, 'engagement-store')

let lastPull = 0
let lastError: string | null = null

export interface StoreLocation {
  path: string
  mode: 'local' | 'git'
  /** When the clone was last refreshed; null in local mode, where git is never touched. */
  syncedAt: string | null
  /** Set when a pull failed but a usable older checkout remains — the page must say so. */
  syncError: string | null
}

/** A checkout is only the store if it carries the file every version of the store has had. */
function isStore(p: string): boolean {
  try {
    return existsSync(join(p, '_config', 'sources.yaml'))
  } catch {
    return false
  }
}

/** A token in a remote URL ends up in git's error text; never let it reach a page or a log. */
function scrub(msg: string, token: string): string {
  return token ? msg.split(token).join('***') : msg
}

function authedUrl(url: string, token: string): string {
  if (!token || !url.startsWith('https://')) return url
  return url.replace('https://', `https://x-access-token:${token}@`)
}

function git(args: string[], cwd?: string): void {
  execFileSync('git', args, { cwd, stdio: 'pipe', timeout: 120_000 })
}

/**
 * Resolve the store, refreshing it when it is older than PULL_INTERVAL (or when `refresh` is set).
 * Returns null when there is no checkout and no configured URL — the caller reports that as a
 * missing source, never as an empty funnel.
 */
export async function ensureStore(refresh = false): Promise<StoreLocation | null> {
  for (const candidate of LOCAL_CANDIDATES) {
    if (isStore(candidate)) return { path: candidate, mode: 'local', syncedAt: null, syncError: null }
  }

  const { values } = await readSettings()
  const gitUrl = values['store.git_url']
  const token = values['store.git_token']
  if (!gitUrl) return null

  try {
    if (!isStore(CLONE_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true })
      git(['clone', '--depth', '1', authedUrl(gitUrl, token), CLONE_DIR])
      lastPull = Date.now()
      lastError = null
    } else if (refresh || Date.now() - lastPull > PULL_INTERVAL_MS) {
      git(['remote', 'set-url', 'origin', authedUrl(gitUrl, token)], CLONE_DIR)
      git(['pull', '--ff-only'], CLONE_DIR)
      lastPull = Date.now()
      lastError = null
    }
  } catch (error) {
    lastError = scrub(error instanceof Error ? error.message : String(error), token)
    // A stale checkout still answers; only a missing one is fatal.
    if (!isStore(CLONE_DIR)) return null
  }

  return {
    path: CLONE_DIR,
    mode: 'git',
    syncedAt: lastPull ? new Date(lastPull).toISOString() : null,
    syncError: lastError,
  }
}
