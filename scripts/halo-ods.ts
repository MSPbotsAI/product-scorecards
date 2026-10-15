/**
 * Reading Halo's full history for the PM scripts.
 *
 * The live page reads the layered Halo Actions dataset, which keeps about 14 days. The ODS Halo
 * Actions table keeps every action since 2019, so the scripts that look further back read it instead.
 * Both tables read with PUBLIC_API_KEY from .env.local, and the key needs the dataset granted.
 */
import { readFileSync } from 'node:fs'
import { PM_NAME, type PmEvent, relevant, toEvent } from '../service/lib/pm/actions.ts'

/** Every Halo action since 2019. */
export const ODS_ACTIONS = '1563065169343234049'
/** Halo tickets: summary and client, one row per ticket. */
export const HALO_TICKETS = '1598347117760024578'

/** The largest page the API serves: it answers size=5000 with 2000 rows. */
const PAGE_SIZE = 2000
/**
 * Pages come back in no fixed order. A full pass over one slice repeats some rows and skips others:
 * 2,280 rows read as 2,258 distinct on 2026-10-15. So a slice is read again until every row has been
 * seen.
 */
const MAX_PASSES = 8

export type Row = Record<string, unknown>

let key: string | undefined
function apiKey(): string {
  key ??= /^PUBLIC_API_KEY=(.+)$/m.exec(readFileSync('.env.local', 'utf8'))?.[1]?.trim()
  if (!key) throw new Error('PUBLIC_API_KEY is not set in .env.local')
  return key
}

export async function page(dataset: string, params: Record<string, string>, n: number, size = PAGE_SIZE): Promise<{ rows: Row[]; total: number }> {
  for (let attempt = 1; ; attempt++) {
    try {
      const query = new URLSearchParams({ current: String(n), size: String(size), ...params })
      const res = await fetch(`https://api.mspbots.ai/api/dataset/${dataset}?${query}`, {
        headers: { apiKey: apiKey() },
        signal: AbortSignal.timeout(300_000),
      })
      // The gateway answers an overload with an HTML page, not JSON: retry it like any other failure.
      const text = await res.text()
      if (!text.trimStart().startsWith('{')) throw Object.assign(new Error(`HTTP ${res.status}, not JSON`), { status: res.status })
      const body = JSON.parse(text)
      if (String(body.code) !== '0') throw new Error(`code ${body.code}: ${String(body.msg).slice(0, 80)}`)
      const data = body.data ?? {}
      return { rows: Array.isArray(data) ? data : (data.records ?? []), total: Number(data.total ?? 0) }
    } catch (error) {
      if (attempt >= 6) throw error
      // 429 is the API's rate limit: give it a good half minute per attempt, not a few seconds.
      const limited = (error as { status?: number }).status === 429
      await new Promise((done) => setTimeout(done, (limited ? 30_000 : 3000) * attempt))
    }
  }
}

/** Every distinct row of one filtered slice of the ODS actions, by ticket and per-ticket action number. */
export async function slice(params: Record<string, string>): Promise<Row[]> {
  const seen = new Map<string, Row>()
  let total = 0
  for (let pass = 1; pass <= MAX_PASSES; pass++) {
    const first = await page(ODS_ACTIONS, params, 1)
    total = first.total
    const todo = Array.from({ length: Math.max(0, Math.ceil(total / PAGE_SIZE) - 1) }, (_, i) => i + 2)
    const rows = [...first.rows]
    await Promise.all(
      Array.from({ length: 3 }, async () => {
        for (let n = todo.shift(); n !== undefined; n = todo.shift()) rows.push(...(await page(ODS_ACTIONS, params, n)).rows)
      }),
    )
    const before = seen.size
    for (const r of rows) seen.set(`${r.ticket_id}-${r.other_id}`, r)
    if (seen.size >= total) return [...seen.values()]
    // A third or later pass that finds nothing new: what is missing is the dataset's own duplicates, not paging.
    if (pass >= 3 && seen.size === before) {
      console.warn(`${JSON.stringify(params)}: ${seen.size} distinct of ${total} rows — the rest never appeared`)
      return [...seen.values()]
    }
  }
  throw new Error(`${JSON.stringify(params)}: ${seen.size} of ${total} rows after ${MAX_PASSES} passes`)
}

/** The PM team's own actions and every queue move: one slice per person, plus all Re-Assigns. */
export async function readActions(people: string[]): Promise<Row[]> {
  const rows: Row[] = []
  // One slice at a time, three pages in flight: more trips the API's rate limit.
  for (const params of [...people.map((who) => ({ who })), { outcome: 'Re-Assign' }]) rows.push(...(await slice(params)))
  return rows
}

/**
 * Every action of the given outcomes on each of these tickets, read ticket by ticket. Holds and
 * releases are set by anyone, so a tenant-wide slice of them since 2019 would be enormous; the tickets
 * the PM numbers follow are a few hundred.
 */
export async function readTicketActions(tickets: string[], outcomes: string[]): Promise<Row[]> {
  const out: Row[] = []
  const todo = [...tickets]
  await Promise.all(
    Array.from({ length: 3 }, async () => {
      for (let t = todo.shift(); t !== undefined; t = todo.shift()) {
        for (let n = 1, seen = 0; ; n++) {
          const p = await page(ODS_ACTIONS, { ticket_id: t }, n, 500)
          out.push(...p.rows.filter((r) => outcomes.includes(String(r.outcome))))
          seen += p.rows.length
          if (seen >= p.total || p.rows.length === 0) break
        }
      }
    }),
  )
  return out
}

/** The other names a team member appears under on a queue move. */
const ALIASES: Record<string, string[]> = {
  'Frank Tian': ['frank.tian@mspbots.ai'],
  'Grace Guo': ['grace.guo@mspbots.ai'],
  'Micus Zhang': ['micus.zhang@mspbots.ai'],
}

/**
 * The PM events as the log would hold them if `team` were the PM: their actions are the PM's, and
 * their names on a move are the queue. Reduced as the live reader reduces them, so no note text.
 */
export function eventsFor(rows: Row[], team: string[]): Record<string, PmEvent> {
  const parties = new Set(team.flatMap((who) => [who, ...(ALIASES[who] ?? [])]))
  const asPm = (person: string) => (parties.has(person) ? PM_NAME : person)
  const events: Record<string, PmEvent> = {}
  for (const r of rows) {
    // The ODS table names an action by its per-ticket number, other_id; the live reader's id is "<ticket>-<n>".
    const e = toEvent({
      action_id: `${r.ticket_id}-${r.other_id}`,
      time_log_id: r.other_id,
      ticket_id: r.ticket_id,
      datetime: r.datetime,
      who: team.includes(String(r.who)) ? PM_NAME : r.who,
      outcome: r.outcome,
      note: r.note,
    })
    if (!e) continue
    if (e.from) e.from = { ...e.from, person: asPm(e.from.person) }
    if (e.to) e.to = { ...e.to, person: asPm(e.to.person) }
    if (relevant(e) && !events[e.id]) events[e.id] = e
  }
  return events
}

/** Each ticket's earliest action on record. The ODS history is complete, so every ticket's history is. */
export function firstActions(events: Record<string, PmEvent>): Record<string, string> {
  const created: Record<string, string> = {}
  for (const e of Object.values(events)) if (!created[e.ticket] || e.at < created[e.ticket]) created[e.ticket] = e.at
  return created
}

/** The instant of local (Asia/Shanghai) midnight at the start of a date. */
export const localMidnight = (date: string) => new Date(Date.parse(`${date}T00:00:00+08:00`)).toISOString()
