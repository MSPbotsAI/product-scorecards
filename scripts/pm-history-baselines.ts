/**
 * Recompute the history benchmarks from Halo's full action history.
 *
 *   pnpm exec tsx scripts/pm-history-baselines.ts           # print each quarter's lines
 *   pnpm exec tsx scripts/pm-history-baselines.ts --write   # also rewrite service/lib/pm/baselines.data.ts
 *
 * Reads the ODS Halo Actions table, which keeps every action since 2019. It uses PUBLIC_API_KEY from
 * .env.local, and the key needs that dataset granted.
 *
 * For each quarter in QUARTERS it keeps that quarter's PM team's actions and the queue moves, runs
 * them through the scorecard engine, and takes the quarter's samples — the measurements its benchmark
 * averages, plus the ones it leaves out. The samples hold ticket numbers, weeks and hours only; no
 * note text is kept.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { PM_NAME, type PmEvent, relevant, toEvent } from '../service/lib/pm/actions.ts'
import { type Metric, type Sample, buildScorecard, quarterOf, quarterSamples } from '../service/lib/pm/metrics.ts'
import type { EventStore } from '../service/lib/pm/store.ts'
import { WORKDAY_HOURS } from '../service/lib/pm/workTime.ts'

const DATASET = '1563065169343234049'
/**
 * The quarters averaged, and who counted as "the PM" in each (decided by the PM, 2026-10-14): Grace
 * Guo and Micus Zhang worked the queue with Frank in Q2.
 */
const QUARTERS: Record<string, string[]> = {
  '2026-Q2': ['Frank Tian', 'Grace Guo', 'Micus Zhang', 'product_zd@mspbots.ai'],
  '2026-Q3': ['Frank Tian', 'Grace Guo', 'Micus Zhang', 'product_zd@mspbots.ai'],
}
/** The other names a team member appears under on a queue move. */
const ALIASES: Record<string, string[]> = {
  'Frank Tian': ['frank.tian@mspbots.ai'],
  'Grace Guo': ['grace.guo@mspbots.ai'],
  'Micus Zhang': ['micus.zhang@mspbots.ai'],
}
/** The largest page the API serves: it answers size=5000 with 2000 rows. */
const PAGE_SIZE = 2000
/**
 * Pages come back in no fixed order. A full pass over one slice repeats some rows and skips others:
 * 2,280 rows read as 2,258 distinct on 2026-10-15. So the slice is read again until every row has
 * been seen.
 */
const MAX_PASSES = 8
const DATA_FILE = 'service/lib/pm/baselines.data.ts'

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

/** The log as it would be if `team` were the PM: their actions are the PM's, their names on a move are the queue. */
function storeFor(rows: Row[], team: string[], firstQuarter: string): EventStore {
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
  // Every ticket's history is complete here. The log opens one week before the quarter, so the
  // quarter's first week is a whole week.
  const created: Record<string, string> = {}
  for (const e of Object.values(events)) if (!created[e.ticket] || e.at < created[e.ticket]) created[e.ticket] = e.at
  const year = Number(firstQuarter.slice(0, 4))
  const firstDay = Date.UTC(year, (Number(firstQuarter.slice(6)) - 1) * 3, 1)
  const firstMonday = firstDay + ((8 - new Date(firstDay).getUTCDay()) % 7) * 86_400_000
  const opens = new Date(firstMonday - 8 * 3600_000 - 7 * 86_400_000).toISOString()
  const now = new Date().toISOString()
  return { version: 1, events, created, tickets: {}, captures: [{ at: now, source: 'ods', rows: rows.length, oldest: opens, newest: now }] }
}

const people = [...new Set(Object.values(QUARTERS).flat())]
const rows: Row[] = []
// One slice at a time: six pages in flight is enough load on the API.
for (const params of [...people.map((who) => ({ who })), { outcome: 'Re-Assign' }]) rows.push(...(await slice(params)))
console.log(`read ${rows.length} rows`)

const out: Record<string, { from: string; samples: Sample[] }> = {}
for (const [quarter, team] of Object.entries(QUARTERS)) {
  const card = buildScorecard(storeFor(rows, team, quarter), new Date().toISOString())
  const samples = quarterSamples(card, quarter)
  if (!samples) {
    console.log(`${quarter}: not complete yet — every week of it must be over`)
    continue
  }
  const year = Number(quarter.slice(0, 4))
  const q = Number(quarter.slice(6))
  const judged = quarterOf(q === 4 ? `${year + 1}-01-01` : `${year}-${String(q * 3 + 1).padStart(2, '0')}-01`)
  out[judged] = { from: quarter, samples }
  const line = (m: Metric) => {
    const hours = samples.filter((x) => x.metric === m && !x.out).map((x) => x.hours)
    const avg = hours.reduce((a, b) => a + b, 0) / hours.length
    const shown = m === 'response' ? `${avg.toFixed(1)} h` : `${(avg / WORKDAY_HOURS).toFixed(1)} d`
    return `${m} ${shown} (n ${hours.length}, left out ${samples.filter((x) => x.metric === m && x.out).length})`
  }
  console.log(`${quarter} → judges ${judged} [${team.join(', ')}]: ${(['response', 'prd', 'canny', 'mb'] as const).map(line).join(' | ')}`)
}

if (process.argv.includes('--write')) {
  const sample = (x: Sample) =>
    `      { metric: '${x.metric}', ticket: '${x.ticket}', week: '${x.week}', hours: ${Number(x.hours.toFixed(3))}` +
    `${x.entries !== undefined ? `, entries: ${x.entries}` : ''}${x.out ? `, out: '${x.out}'` : ''}${x.waitedDays !== undefined ? `, waitedDays: ${x.waitedDays}` : ''} },`
  const body = Object.entries(out)
    .map(([judged, b]) => `  '${judged}': {\n    from: '${b.from}',\n    samples: [\n${b.samples.map(sample).join('\n')}\n    ],\n  },`)
    .join('\n')
  writeFileSync(
    DATA_FILE,
    `// Generated by scripts/pm-history-baselines.ts on ${new Date().toISOString().slice(0, 10)} — do not edit by hand.\n` +
      `import type { Sample } from './metrics.ts'\n\n` +
      `export const HISTORY_SAMPLES: Record<string, { from: string; samples: Sample[] }> = {\n${body}\n}\n`,
  )
  console.log(`wrote ${DATA_FILE}`)
}
