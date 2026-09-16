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
const LOCAL_CANDIDATES = [resolve(process.cwd(), '../sop-agent-engagement'), resolve(process.cwd(), '../sopagent-engagement')]
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

/**
 * Run git, surfacing why it failed. With `stdio: 'pipe'` the thrown error's `message` is only
 * "Command failed: git …" — the reason git actually gives is on `stderr`, so it is lifted out
 * here. Without this the page would report a failure with no cause attached.
 */
function git(args: string[], cwd?: string): void {
  try {
    execFileSync('git', args, { cwd, stdio: 'pipe', timeout: 120_000 })
  } catch (error) {
    const e = error as NodeJS.ErrnoException & { stderr?: Buffer }
    // The runtime image must ship a git binary (see Dockerfile) — this is the failure when it does not.
    if (e.code === 'ENOENT') throw new Error('this server has no git binary, so the store cannot be cloned')
    // git puts the reason on a `fatal:`/`error:` line; the rest is progress chatter such as
    // "Cloning into '/app/data/…'", which carries a local path and tells the reader nothing.
    const stderr = e.stderr?.toString() ?? ''
    const reason = stderr.split('\n').find((line) => /^(fatal|error):/i.test(line.trim()))
    throw new Error(reason?.trim() || stderr.trim() || e.message)
  }
}

/**
 * Resolve the store, refreshing it when it is older than PULL_INTERVAL (or when `refresh` is set).
 *
 * Returns null ONLY when no URL is configured. Being unable to reach a store that IS configured
 * throws instead, carrying git's own reason: the two are different failures and used to collapse
 * into the same null, so an unreachable store was reported to the user as "not configured" while
 * the Settings page plainly showed a URL and a saved token. Nobody can act on that.
 *
 * The store itself is one global checkout (MSPBots' own SOP Agent pipeline); `tenantId` only
 * resolves whose Settings row supplies the URL and token used to reach it.
 */
export async function ensureStore(tenantId: string, refresh = false): Promise<StoreLocation | null> {
  for (const candidate of LOCAL_CANDIDATES) {
    if (isStore(candidate)) return { path: candidate, mode: 'local', syncedAt: null, syncError: null }
  }

  const { values } = await readSettings(tenantId)
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
    // A stale checkout still answers; only a missing one is fatal — and it is fatal as "could not
    // be read", never as "not configured".
    if (!isStore(CLONE_DIR)) throw new Error(`the engagement store (${gitUrl}) could not be read: ${lastError}`)
  }

  return {
    path: CLONE_DIR,
    mode: 'git',
    syncedAt: lastPull ? new Date(lastPull).toISOString() : null,
    syncError: lastError,
  }
}
