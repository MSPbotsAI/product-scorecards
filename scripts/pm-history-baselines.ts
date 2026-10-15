/**
 * Recompute the history benchmarks in service/lib/pm/baselines.ts from Halo's full action history.
 *
 *   pnpm exec tsx scripts/pm-history-baselines.ts 2026-Q2 2026-Q3
 *
 * Reads the ODS Halo Actions table, which keeps every action since 2019. It uses PUBLIC_API_KEY from
 * .env.local, and the key needs that dataset granted.
 *
 * It keeps the PM team's actions and the queue moves, then runs them through the scorecard engine.
 * For each quarter given, it prints a baselines.ts entry: that quarter's averages, which judge the
 * quarter after it. Nothing is written, and no note text is kept.
 */
import { readFileSync } from 'node:fs'
import { PM_NAME, type PmEvent, relevant, toEvent } from '../service/lib/pm/actions.ts'
import { buildScorecard, quarterAverages, quarterOf } from '../service/lib/pm/metrics.ts'
import type { EventStore } from '../service/lib/pm/store.ts'

const DATASET = '1563065169343234049'
/** Whose actions count as the PM's (decided by the PM, 2026-10-14): the team that worked the queue. */
const TEAM = ['Frank Tian', 'Grace Guo', 'Micus Zhang', 'product_zd@mspbots.ai']
/** The names a team member appears under on a queue move. */
const TEAM_PARTIES = new Set([...TEAM, 'frank.tian@mspbots.ai', 'grace.guo@mspbots.ai', 'micus.zhang@mspbots.ai'])
/** The largest page the API serves: it answers size=5000 with 2000 rows. */
const PAGE_SIZE = 2000
/**
 * Pages come back in no fixed order. A full pass over one slice repeats some rows and skips others:
 * 2,280 rows read as 2,258 distinct on 2026-10-15. So the slice is read again until every row has
 * been seen.
 */
const MAX_PASSES = 8

const quarters = process.argv.slice(2)
if (!quarters.length || !quarters.every((q) => /^\d{4}-Q[1-4]$/.test(q))) {
  console.error('usage: tsx scripts/pm-history-baselines.ts 2026-Q2 [2026-Q3 …]')
  process.exit(1)
}
const key = /^PUBLIC_API_KEY=(.+)$/m.exec(readFileSync('.env.local', 'utf8'))?.[1]?.trim()
if (!key) throw new Error('PUBLIC_API_KEY is not set in .env.local')

type Row = Record<string, unknown>
async function page(params: Record<string, string>, n: number): Promise<{ rows: Row[]; total: number }> {
  for (let attempt = 1; ; attempt++) {
    try {
      const query = new URLSearchParams({ current: String(n), size: String(PAGE_SIZE), ...params })
      const res = await fetch(`https://api.mspbots.ai/api/dataset/${DATASET}?${query}`, {
        headers: { apiKey: key as string },
        signal: AbortSignal.timeout(300_000),
      })
      const body = await res.json()
      if (String(body.code) !== '0') throw new Error(`code ${body.code}: ${String(body.msg).slice(0, 80)}`)
      const data = body.data ?? {}
      return { rows: Array.isArray(data) ? data : (data.records ?? []), total: Number(data.total ?? 0) }
    } catch (error) {
      if (attempt >= 4) throw error
      await new Promise((done) => setTimeout(done, 2000 * attempt))
    }
  }
}

/** Every distinct row of one filtered slice, by ticket and per-ticket action number. */
async function slice(params: Record<string, string>): Promise<Row[]> {
  const seen = new Map<string, Row>()
  let total = 0
  for (let pass = 1; pass <= MAX_PASSES; pass++) {
    const first = await page(params, 1)
    total = first.total
    const todo = Array.from({ length: Math.max(0, Math.ceil(total / PAGE_SIZE) - 1) }, (_, i) => i + 2)
    const rows = [...first.rows]
    await Promise.all(
      Array.from({ length: 6 }, async () => {
        for (let n = todo.shift(); n !== undefined; n = todo.shift()) rows.push(...(await page(params, n)).rows)
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

// One slice at a time: six pages in flight is enough load on the API.
const rows: Row[] = []
for (const params of [...TEAM.map((who) => ({ who })), { outcome: 'Re-Assign' }]) rows.push(...(await slice(params)))
const asPm = (person: string) => (TEAM_PARTIES.has(person) ? PM_NAME : person)
const events: Record<string, PmEvent> = {}
for (const r of rows) {
  // The ODS table names an action by its per-ticket number, other_id; the live reader's id is "<ticket>-<n>".
  const e = toEvent({
    action_id: `${r.ticket_id}-${r.other_id}`,
    time_log_id: r.other_id,
    ticket_id: r.ticket_id,
    datetime: r.datetime,
    who: TEAM.includes(String(r.who)) ? PM_NAME : r.who,
    outcome: r.outcome,
    note: r.note,
  })
  if (!e) continue
  if (e.from) e.from = { ...e.from, person: asPm(e.from.person) }
  if (e.to) e.to = { ...e.to, person: asPm(e.to.person) }
  if (relevant(e) && !events[e.id]) events[e.id] = e
}

// Every ticket's history is complete here. The log is opened one week before the earliest quarter,
// so that quarter's first week is a whole week.
const created: Record<string, string> = {}
for (const e of Object.values(events)) if (!created[e.ticket] || e.at < created[e.ticket]) created[e.ticket] = e.at
const earliest = [...quarters].sort()[0]
const firstDay = `${earliest.slice(0, 4)}-${String((Number(earliest.slice(6)) - 1) * 3 + 1).padStart(2, '0')}-01`
const firstMonday = new Date(Date.parse(`${firstDay}T00:00:00Z`) + ((8 - new Date(`${firstDay}T00:00:00Z`).getUTCDay()) % 7) * 86_400_000)
const opens = new Date(Date.parse(`${firstMonday.toISOString().slice(0, 10)}T00:00:00+08:00`) - 7 * 86_400_000).toISOString()
const now = new Date().toISOString()
const store: EventStore = { version: 1, events, created, tickets: {}, captures: [{ at: now, source: 'ods', rows: rows.length, oldest: opens, newest: now }] }
const card = buildScorecard(store, now)

console.log(`read ${rows.length} rows; ${Object.keys(events).length} PM-team or queue events on ${Object.keys(created).length} tickets\n`)
for (const q of quarters) {
  const averages = quarterAverages(card, q)
  if (!averages) {
    console.log(`// ${q}: not complete yet — every week of it must be over`)
    continue
  }
  const year = Number(q.slice(0, 4))
  const n = Number(q.slice(6))
  const judged = quarterOf(n === 4 ? `${year + 1}-01-01` : `${year}-${String(n * 3 + 1).padStart(2, '0')}-01`)
  const line = (m: keyof typeof averages) => `${m}: { hours: ${averages[m].hours === null ? 'null' : averages[m].hours.toFixed(3)}, n: ${averages[m].n} }`
  console.log(`  '${judged}': {\n    from: '${q}',\n    lines: { ${(['response', 'prd', 'mb', 'canny'] as const).map(line).join(', ')} },\n  },`)
}
