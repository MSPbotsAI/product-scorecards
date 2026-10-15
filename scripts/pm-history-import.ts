/**
 * Build an event log from Halo's full history, for the page's "Import log" button.
 *
 *   pnpm exec tsx scripts/pm-history-import.ts 2026-07-06 [out.json]
 *
 * The page's own log starts on the day it first captured, because Halo Actions keeps only 14 days.
 * This reads the ODS Halo Actions table (halo-ods.ts) instead, and writes a version-1 event log:
 * - The PM's own actions and every move into or out of the queue, reduced as the live capture reduces
 *   them, with no note text. "The PM" is PM_NAME only, as the page counts.
 * - Each ticket's first action. The history is complete, so tickets older than the log are timed too.
 * - Each ticket's summary and client, from the Halo tickets table, for the ticket lists.
 * - One capture covering the log from local midnight of the given Monday. The weeks from that Monday on
 *   appear on the page.
 *
 * The file holds ticket summaries and client names. It stays under data/, which is gitignored, and
 * goes only to the page's import. The import adds only what the live log does not already hold.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { PM_NAME } from '../service/lib/pm/actions.ts'
import { HALO_TICKETS, eventsFor, firstActions, localMidnight, page, readActions } from './halo-ods.ts'

const start = process.argv[2] ?? ''
const out = process.argv[3] ?? 'data/ods/pm-history-import.json'
if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || new Date(`${start}T00:00:00Z`).getUTCDay() !== 1) {
  console.error('usage: tsx scripts/pm-history-import.ts <Monday, YYYY-MM-DD> [out.json]')
  process.exit(1)
}

const rows = await readActions([PM_NAME])
const events = eventsFor(rows, [PM_NAME])
const created = firstActions(events)

// Summary and client per ticket, three lookups at a time (more trips the gateway): the tickets table
// filters on ticket_id.
const tickets: Record<string, { summary: string; client: string }> = {}
const todo = Object.keys(created)
await Promise.all(
  Array.from({ length: 3 }, async () => {
    for (let t = todo.shift(); t !== undefined; t = todo.shift()) {
      const row = (await page(HALO_TICKETS, { ticket_id: t }, 1, 1)).rows[0]
      if (row) tickets[t] = { summary: String(row.summary ?? '').slice(0, 2000), client: String(row.client_name ?? '').slice(0, 500) }
    }
  }),
)

const now = new Date().toISOString()
const log = {
  version: 1,
  events,
  created,
  tickets,
  captures: [{ at: now, source: 'ods-import', rows: rows.length, oldest: localMidnight(start), newest: now }],
}
mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, JSON.stringify(log))
console.log(
  `wrote ${out}: ${Object.keys(events).length} events on ${Object.keys(created).length} tickets ` +
    `(${Object.keys(tickets).length} with summary and client), log from ${start}`,
)
