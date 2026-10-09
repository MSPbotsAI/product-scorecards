/**
 * The Support Ticket Updates log, kept because Halo will not keep it.
 *
 * Halo Actions retains ~14 days. Without a copy, the page could only ever show this week and last —
 * no trend, no comparison, and any request that takes longer than two weeks to reach development
 * would lose its start before its end arrived. Each capture merges the latest 14 days in by action
 * id, so the log only ever grows and a re-read is idempotent.
 *
 * What is stored is the reduced event — the parties of a move, dev and Canny link ids — never a
 * note's text.
 *
 * Where it lives: deployed, the tenant's own database (service/schema.ts). Locally, a gitignored file
 * under data/pm/ — the local database is the shared dev database, which holds no real data by
 * agreement, and this log carries real ticket summaries and client names. PM_STORE=db|file overrides.
 */
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { sql } from 'drizzle-orm'
import { pmCaptures, pmEvents, pmTickets } from '../../schema.ts'
import { db } from '../db.ts'
import type { ActionsRead, PmEvent, TicketMeta } from './actions.ts'

export interface Capture {
  at: string
  source: string
  rows: number
  oldest: string | null
  newest: string | null
}

export interface EventStore {
  version: 1
  events: Record<string, PmEvent>
  created: Record<string, string>
  tickets: Record<string, TicketMeta>
  /** Oldest first. */
  captures: Capture[]
}

export const emptyStore = (): EventStore => ({ version: 1, events: {}, created: {}, tickets: {}, captures: [] })

/** What one capture or one import adds to the log. */
export interface Batch {
  events: PmEvent[]
  created: Record<string, string>
  tickets: Record<string, TicketMeta>
  captures: Capture[]
  /**
   * Whose ticket summary wins when both sides have one. A capture is newer than the log, so it
   * refreshes the summary; an imported log is older, so it only fills what is missing.
   */
  metaWins: 'incoming' | 'existing'
}

export function batchOf(read: ActionsRead, at: string): Batch {
  return {
    events: read.events,
    created: read.created,
    tickets: read.tickets,
    captures: [{ at, source: read.source, rows: read.rows, oldest: read.oldest, newest: read.newest }],
    metaWins: 'incoming',
  }
}

/**
 * The merge rule, shared by both backends: existing events and creation instants win — an action
 * does not change once it has happened — and a capture instant already in the log is not added twice.
 */
export function mergeInto(store: EventStore, batch: Batch): EventStore {
  for (const e of batch.events) if (!store.events[e.id]) store.events[e.id] = e
  for (const [t, iso] of Object.entries(batch.created)) if (!store.created[t]) store.created[t] = iso
  for (const [t, meta] of Object.entries(batch.tickets)) {
    if (batch.metaWins === 'incoming' || !store.tickets[t]) store.tickets[t] = meta
  }
  const seen = new Set(store.captures.map((c) => c.at))
  for (const c of batch.captures) if (!seen.has(c.at)) store.captures.push(c)
  store.captures.sort((a, b) => a.at.localeCompare(b.at))
  return store
}

interface Backend {
  load(tenantId: string): Promise<EventStore>
  merge(tenantId: string, batch: Batch): Promise<void>
}

/* ── local: one JSON file per tenant ── */

function filePath(tenantId: string): string {
  const dir = process.env.PM_STORE_DIR ?? join(process.cwd(), 'data', 'pm')
  return join(dir, `${tenantId.replace(/[^\w-]/g, '_')}.json`)
}

const fileBackend: Backend = {
  async load(tenantId) {
    try {
      const parsed = JSON.parse(readFileSync(filePath(tenantId), 'utf8')) as EventStore
      return parsed?.version === 1 ? parsed : emptyStore()
    } catch {
      return emptyStore()
    }
  },
  async merge(tenantId, batch) {
    const store = mergeInto(await fileBackend.load(tenantId), batch)
    const path = filePath(tenantId)
    mkdirSync(dirname(path), { recursive: true })
    // Write a sibling and rename, so a crash mid-write can never leave half a log.
    writeFileSync(`${path}.tmp`, JSON.stringify(store))
    renameSync(`${path}.tmp`, path)
  },
}

/* ── deployed: the tenant's own database ── */

const iso = (d: Date | null): string | null => (d ? d.toISOString() : null)
const at = (s: string | null): Date | null => (s ? new Date(s) : null)

/** Postgres caps one statement at 65 535 parameters; 500 rows × 13 columns stays far inside it. */
function chunks<T>(xs: T[], size = 500): T[][] {
  const out: T[][] = []
  for (let i = 0; i < xs.length; i += size) out.push(xs.slice(i, i + size))
  return out
}

const dbBackend: Backend = {
  async load(tenantId) {
    const conn = await db(tenantId)
    const [eventRows, ticketRows, captureRows] = await Promise.all([
      conn.select().from(pmEvents),
      conn.select().from(pmTickets),
      conn.select().from(pmCaptures),
    ])
    const store = emptyStore()
    for (const r of eventRows) {
      store.events[r.id] = {
        id: r.id,
        ticket: r.ticket,
        seq: r.seq,
        at: r.at.toISOString(),
        who: r.who,
        outcome: r.outcome,
        ...(r.fromDept != null && r.fromPerson != null ? { from: { dept: r.fromDept, person: r.fromPerson } } : {}),
        ...(r.toDept != null && r.toPerson != null ? { to: { dept: r.toDept, person: r.toPerson } } : {}),
        prd: r.prd,
        mb: r.mb,
        canny: r.canny,
      }
    }
    for (const r of ticketRows) {
      if (r.createdAt) store.created[r.ticket] = r.createdAt.toISOString()
      if (r.summary != null) store.tickets[r.ticket] = { summary: r.summary, client: r.client ?? '' }
    }
    store.captures = captureRows
      .map((r) => ({ at: r.at.toISOString(), source: r.source, rows: r.rows, oldest: iso(r.oldest), newest: iso(r.newest) }))
      .sort((a, b) => a.at.localeCompare(b.at))
    return store
  },

  async merge(tenantId, batch) {
    const conn = await db(tenantId)
    const tickets = [...new Set([...Object.keys(batch.created), ...Object.keys(batch.tickets)])].map((ticket) => ({
      ticket,
      createdAt: at(batch.created[ticket] ?? null),
      summary: batch.tickets[ticket]?.summary ?? null,
      client: batch.tickets[ticket]?.client ?? null,
    }))
    // Summary and client travel as a pair: both are written whenever one is, so the coalesce below
    // keeps or replaces them together.
    const incoming = batch.metaWins === 'incoming'
    // One transaction: a capture row is the claim "everything up to here was copied", so it must
    // never land without the events it vouches for.
    await conn.transaction(async (tx) => {
      for (const part of chunks(batch.events)) {
        await tx
          .insert(pmEvents)
          .values(
            part.map((e) => ({
              id: e.id,
              ticket: e.ticket,
              seq: e.seq,
              at: new Date(e.at),
              who: e.who,
              outcome: e.outcome,
              fromDept: e.from?.dept ?? null,
              fromPerson: e.from?.person ?? null,
              toDept: e.to?.dept ?? null,
              toPerson: e.to?.person ?? null,
              prd: e.prd,
              mb: e.mb,
              canny: e.canny,
            })),
          )
          .onConflictDoNothing()
      }
      for (const part of chunks(tickets)) {
        await tx
          .insert(pmTickets)
          .values(part)
          .onConflictDoUpdate({
            target: pmTickets.ticket,
            set: {
              createdAt: sql`coalesce(${pmTickets.createdAt}, excluded.created_at)`,
              summary: incoming
                ? sql`coalesce(excluded.summary, ${pmTickets.summary})`
                : sql`coalesce(${pmTickets.summary}, excluded.summary)`,
              client: incoming ? sql`coalesce(excluded.client, ${pmTickets.client})` : sql`coalesce(${pmTickets.client}, excluded.client)`,
            },
          })
      }
      if (batch.captures.length) {
        await tx
          .insert(pmCaptures)
          .values(
            batch.captures.map((c) => ({ at: new Date(c.at), source: c.source, rows: c.rows, oldest: at(c.oldest), newest: at(c.newest) })),
          )
          .onConflictDoNothing()
      }
    })
  },
}

/* ── the module's interface ── */

export function storeKind(): 'db' | 'file' {
  const choice = process.env.PM_STORE ?? (process.env.NODE_ENV === 'production' || process.env.DB_PROXY_BASE_URL ? 'db' : 'file')
  return choice === 'db' ? 'db' : 'file'
}

const backend = (): Backend => (storeKind() === 'db' ? dbBackend : fileBackend)

/** A page view reads the whole log; a short-lived copy spares the database a full read per view. */
const CACHE_MS = 60_000
const cache = new Map<string, { store: EventStore; at: number }>()

/** The tenant's log. Treat it as read-only: it may be the cached copy other requests also read. */
export async function loadStore(tenantId: string): Promise<EventStore> {
  const hit = cache.get(tenantId)
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.store
  const store = await backend().load(tenantId)
  cache.set(tenantId, { store, at: Date.now() })
  return store
}

export async function mergeBatch(tenantId: string, batch: Batch): Promise<void> {
  try {
    await backend().merge(tenantId, batch)
  } finally {
    cache.delete(tenantId)
  }
}

/**
 * Where the log has holes. Each capture sees back to its own `oldest`; if that is later than the
 * previous capture's instant, the actions in between were never seen and are gone from Halo for good.
 */
export function coverage(store: EventStore): { from: string | null; gaps: { from: string; to: string }[] } {
  const caps = [...store.captures].sort((a, b) => a.at.localeCompare(b.at))
  const gaps: { from: string; to: string }[] = []
  for (let i = 1; i < caps.length; i++) {
    const seenFrom = caps[i].oldest
    if (seenFrom && seenFrom > caps[i - 1].at) gaps.push({ from: caps[i - 1].at, to: seenFrom })
  }
  const from =
    caps
      .map((c) => c.oldest)
      .filter((x): x is string => !!x)
      .sort()[0] ?? null
  return { from, gaps }
}
