/**
 * The PM's events, read from Halo Actions.
 *
 * All PM numbers are built from action rows, and Halo keeps only the last ~14 days of them. So this
 * module reads the three slices the numbers need and reduces each row to the facts they use — never
 * the note text itself, which carries customer correspondence and has no business being stored:
 *
 *   who = <PM account>  every PM action: replies, private notes, hand-offs, the dev and Canny links
 *   outcome = Re-Assign every move, from which arrivals into and departures from the queue are read
 *   time_log_id = 1     each ticket's first action, so a ticket's history is known to be complete
 *   outcome = SLA Hold / SLA Release
 *                       when a ticket the log follows is parked (scheduled, waiting on the requester)
 *                       and released: first response does not run while a ticket is on hold
 *
 * The reports API filters server-side on any column passed as a query parameter, which keeps each
 * read to a page or two out of ~9k rows. Each page is slow (40–70 s), so pages after the first are
 * fetched in parallel and the three slices run concurrently.
 */
import { createMspbotsReportClient } from '../mspbots-report.ts'
import type { ReadMode } from '../scorecard.ts'

/** The PM whose clock this is. Every PM action in Halo is recorded under this name. */
export const PM_NAME = 'Frank Tian'
/**
 * Every Halo account the PM works under. product_zd@mspbots.ai is the queue's shared mailbox, and the
 * PM has used it as his own since July 2026 (confirmed by the PM, 2026-10-15). A reply, note,
 * hand-off or link from it is his.
 */
export const PM_ACCOUNTS = [PM_NAME, 'product_zd@mspbots.ai']
export const isPm = (who: string) => PM_ACCOUNTS.includes(who)

/**
 * Who counts as "the PM's queue" on either end of a Re-Assign. The shared mailbox and the PM
 * personally are both the queue; a move between them is internal and neither arrives nor leaves.
 */
export const PM_QUEUE_PEOPLE = ['product_zd@mspbots.ai', 'Frank Tian', 'frank.tian@mspbots.ai']
/** Halo parks a ticket (scheduled, waiting on the requester) with a hold and resumes it with a release. */
export const HOLD = 'SLA Hold'
export const RELEASE = 'SLA Release'
/**
 * Not a Halo action. The capture writes it when Halo's ticket list shows a ticket closed, or no
 * longer lists it. A ticket closed by anyone but the PM leaves no action in the slices read here, so
 * without it the ticket would wait for a first response forever.
 */
export const TICKET_CLOSED = 'Ticket closed'
/** Exactly "Product" — not "Product - Assets", which is a different team with its own queue. */
export const PRODUCT_DEPT = 'Product'

const PAGE_SIZE = 500
const MAX_PAGES = 20
/** A page normally answers in 40–70 s; a read that hangs past this is abandoned, not waited on forever. */
const REQUEST_TIMEOUT_MS = 180_000

type Row = Record<string, unknown>

export interface Party {
  dept: string
  person: string
}

/** One action, reduced to what the PM numbers read. */
export interface PmEvent {
  /** Halo's action id, "<ticket>-<n>". */
  id: string
  ticket: string
  /** Halo's per-ticket sequence (time_log_id); 1 is the ticket's first action. */
  seq: number
  at: string
  who: string
  outcome: string
  from?: Party
  to?: Party
  /** ClickUp PRD-/MB- task ids found in a PM note, e.g. "PRD-19414". */
  prd: string[]
  mb: string[]
  /** Canny post paths found in a PM note, e.g. "/feature-requests/p/box-plot-widget…". */
  canny: string[]
}

export interface TicketMeta {
  summary: string
  client: string
}

export interface ActionsRead {
  events: PmEvent[]
  /** Ticket id → the instant of its first action, from the time_log_id = 1 slice. */
  created: Record<string, string>
  tickets: Record<string, TicketMeta>
  source: ReadMode
  rows: number
  oldest: string | null
  newest: string | null
}

/** How one tenant reads the dataset: its own API key (public), or the caller's platform token (token). */
export interface ReadAuth {
  mode: ReadMode
  apiKey: string
  token: string
  tenantCode: string
}

/** Upstream error bodies can echo the credential back; never let one reach a log line or a page intact. */
export function sanitize(text: string): string {
  return text
    .replace(/eyJ[\w-]+\.[\w-]*\.?[\w-]*/g, '[token redacted]')
    .replace(/[A-Za-z0-9_-]{32,}/g, '[redacted]')
    .slice(0, 300)
}

function withTimeout<T>(work: Promise<T>, ms: number, what: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${what} took longer than ${ms / 1000} s`)), ms)
  })
  return Promise.race([work, timeout]).finally(() => clearTimeout(timer))
}

/**
 * The platform answers auth and query errors with HTTP 200 and a non-zero `code` in the envelope.
 * Read as an empty page, that would turn a broken read into a confident zero.
 */
function checked(body: Row, datasetId: string): Row {
  const code = body?.code
  if (code != null && !['0', '200', 'success'].includes(String(code).toLowerCase())) {
    throw new Error(`dataset ${datasetId} refused the read (code ${code}): ${sanitize(String(body?.msg ?? 'no message'))}`)
  }
  return body
}

function pageOf(body: Row): { rows: Row[]; total: number | null } {
  const data = (body.data ?? body) as Row
  const rows = Array.isArray(body.data) ? body.data : (data.records ?? data.list ?? data.rows)
  if (!Array.isArray(rows)) throw new Error('dataset returned an unrecognised envelope — refusing to guess')
  const total = Number(data.total)
  return { rows: rows as Row[], total: Number.isFinite(total) ? total : null }
}

/**
 * Every page of one filtered slice. Page one reveals the total, so the rest are fetched together
 * rather than one after another — at ~60 s a page that is the difference between one minute and four.
 */
async function pullSlice(fetchPage: (page: number) => Promise<Row>): Promise<Row[]> {
  const first = pageOf(await fetchPage(1))
  if (first.total === null || first.rows.length < PAGE_SIZE) return first.rows
  const pages = Math.ceil(first.total / PAGE_SIZE)
  if (pages > MAX_PAGES) {
    throw new Error(`slice has ${first.total} rows, over the ${MAX_PAGES * PAGE_SIZE}-row guard — refusing to read a truncated history`)
  }
  const rest = await Promise.all(Array.from({ length: pages - 1 }, (_, i) => fetchPage(i + 2).then((b) => pageOf(b).rows)))
  return [first.rows, ...rest].flat()
}

/** "From: Support, Kinn Maagad; To: Product, product_zd@mspbots.ai." → both parties. */
function parseMove(note: string): { from?: Party; to?: Party } {
  const m = /From:\s*([^,;]+?)\s*,\s*([^;]+?)\s*;\s*To:\s*([^,;]+?)\s*,\s*(.+?)\s*\.?\s*$/.exec(note.trim())
  if (!m) return {}
  return { from: { dept: m[1], person: m[2] }, to: { dept: m[3], person: m[4] } }
}

export function inQueue(p: Party | undefined): boolean {
  return !!p && p.dept === PRODUCT_DEPT && PM_QUEUE_PEOPLE.includes(p.person)
}

/**
 * ClickUp dev links, in the URL form only. A bare "PRD-14894" in prose is usually a reference to a
 * Rock deliverable, not a request entering development — only a pasted task link is a dev entry.
 */
function clickupIds(note: string, kind: 'PRD' | 'MB'): string[] {
  const re = new RegExp(`app\\.clickup\\.com/t/(?:\\d+/)?${kind}-(\\d+)`, 'g')
  return [...new Set([...note.matchAll(re)].map((m) => `${kind}-${m[1]}`))]
}

function cannyPaths(note: string): string[] {
  const paths = [...note.matchAll(/mspbots\.canny\.io(\/[^\s\])>"'<]+)/g)].map((m) => m[1].replace(/[.,;:!?]+$/, ''))
  return [...new Set(paths)]
}

/** One Halo action row reduced to the facts the numbers read; null without an id, a ticket or a time. */
export function toEvent(r: Row): PmEvent | null {
  const id = String(r.action_id ?? '')
  const ticket = String(r.ticket_id ?? '')
  const at = String(r.datetime ?? '')
  if (!id || !ticket || !Number.isFinite(Date.parse(at))) return null
  const who = String(r.who ?? '')
  const outcome = String(r.outcome ?? '')
  const note = String(r.note ?? '')
  const pm = isPm(who)
  const move = outcome === 'Re-Assign' ? parseMove(note) : {}
  return {
    id,
    ticket,
    seq: Number(r.time_log_id) || 0,
    at: new Date(Date.parse(at)).toISOString(),
    who,
    outcome,
    ...move,
    prd: pm ? clickupIds(note, 'PRD') : [],
    mb: pm ? clickupIds(note, 'MB') : [],
    canny: pm ? cannyPaths(note) : [],
  }
}

/**
 * A Re-Assign is kept only if the PM's queue is on one end of it; the rest of the tenant is noise.
 * Holds, releases and closures are kept here too; the reader keeps them only for tickets the log follows.
 */
export function relevant(e: PmEvent): boolean {
  if (isPm(e.who)) return true
  if (e.outcome === 'Re-Assign') return inQueue(e.from) || inQueue(e.to)
  return e.outcome === HOLD || e.outcome === RELEASE || e.outcome === TICKET_CLOSED
}

const isPark = (e: PmEvent) => e.outcome === HOLD || e.outcome === RELEASE

function reader(datasetId: string, auth: ReadAuth) {
  const client = createMspbotsReportClient({
    mspbots_client_host: process.env.MSPBOTS_REPORT_HOST ?? 'https://app.mspbots.ai/web/reports',
    public_api_key: auth.apiKey,
  })
  return (query: Record<string, string | number>) => {
    const read =
      auth.mode === 'public'
        ? client.getPublicDatasetData(datasetId, query)
        : client.getDatasetData(datasetId, query, { token: auth.token, tenantCode: auth.tenantCode })
    return withTimeout(read as Promise<Row>, REQUEST_TIMEOUT_MS, `dataset ${datasetId}`).then((b) => checked(b, datasetId))
  }
}

/** `known`: tickets the log already follows, whose holds and releases are kept even with no other action in this read. */
export async function readActions(datasetId: string, auth: ReadAuth, known: Set<string> = new Set()): Promise<ActionsRead> {
  const read = reader(datasetId, auth)
  const slice = (params: Record<string, string>) => pullSlice((page) => read({ current: page, size: PAGE_SIZE, ...params }))

  const [moves, firsts, holds, releases, ...perAccount] = await Promise.all([
    slice({ outcome: 'Re-Assign' }),
    slice({ time_log_id: '1' }),
    slice({ outcome: HOLD }),
    slice({ outcome: RELEASE }),
    ...PM_ACCOUNTS.map((who) => slice({ who })),
  ])
  const pm = perAccount.flat()
  // Zero PM rows is not a zero measurement — two weeks of an active queue always has some.
  if (pm.length === 0) throw new Error('no PM actions returned — treating this as unavailable, not as zero')

  const events = new Map<string, PmEvent>()
  const tickets: Record<string, TicketMeta> = {}
  const noteTicket = (r: Row) => {
    const t = String(r.ticket_id ?? '')
    if (t && !tickets[t]) tickets[t] = { summary: String(r.ticket_summary ?? ''), client: String(r.client ?? '') }
  }
  for (const r of [...pm, ...moves]) {
    const e = toEvent(r)
    // Halo returns some actions twice, byte-identical; the action id is the identity.
    if (e && relevant(e) && !isPark(e) && !events.has(e.id)) {
      events.set(e.id, e)
      noteTicket(r)
    }
  }
  // Holds come for the whole tenant; keep those of tickets the log follows.
  const followed = new Set([...known, ...[...events.values()].map((e) => e.ticket)])
  for (const r of [...holds, ...releases]) {
    const e = toEvent(r)
    if (e && followed.has(e.ticket) && !events.has(e.id)) events.set(e.id, e)
  }
  const created: Record<string, string> = {}
  for (const r of firsts) {
    const t = String(r.ticket_id ?? '')
    const at = Date.parse(String(r.datetime ?? ''))
    if (t && Number.isFinite(at)) created[t] = new Date(at).toISOString()
  }

  const all = [...pm, ...moves, ...firsts, ...holds, ...releases].map((r) => Date.parse(String(r.datetime ?? ''))).filter(Number.isFinite)
  return {
    events: [...events.values()],
    created,
    tickets,
    source: auth.mode,
    rows: pm.length + moves.length + firsts.length + holds.length + releases.length,
    oldest: all.length ? new Date(Math.min(...all)).toISOString() : null,
    newest: all.length ? new Date(Math.max(...all)).toISOString() : null,
  }
}

/** A ticket's state in Halo's ticket list: closed (and when), still open, or no longer listed. */
export type TicketState = { state: 'closed'; at: string } | { state: 'open' } | { state: 'gone' }

/**
 * Look tickets up in Halo's ticket list, a few at a time. Used for tickets still waiting for a first
 * response: one closed by anyone but the PM leaves no action the capture reads.
 */
export async function readTicketStates(datasetId: string, auth: ReadAuth, tickets: string[]): Promise<Record<string, TicketState>> {
  const read = reader(datasetId, auth)
  const out: Record<string, TicketState> = {}
  const todo = [...tickets]
  await Promise.all(
    Array.from({ length: 3 }, async () => {
      for (let t = todo.shift(); t !== undefined; t = todo.shift()) {
        const row = pageOf(await read({ current: 1, size: 1, ticket_id: t })).rows[0]
        if (!row || String(row.ticket_id ?? '') !== t) out[t] = { state: 'gone' }
        else {
          // A reopened ticket can keep its old close date, so the status has to say closed too.
          const closed = Date.parse(String(row.dateclosed ?? ''))
          const isClosed = Number.isFinite(closed) && /clos|resolv|complet|cancel/i.test(String(row.status_name ?? ''))
          out[t] = isClosed ? { state: 'closed', at: new Date(closed).toISOString() } : { state: 'open' }
        }
      }
    }),
  )
  return out
}

/**
 * A closure event for each ticket Halo shows closed or no longer lists. Each one is placed no earlier
 * than the ticket's last action in the log (`lastAt`). Halo can keep an old close date on a ticket
 * that was reopened and closed again, and a closure must still land after the wait it ends.
 */
export function closureEvents(states: Record<string, TicketState>, lastAt: (ticket: string) => string | undefined): PmEvent[] {
  const out: PmEvent[] = []
  for (const [ticket, s] of Object.entries(states)) {
    const last = lastAt(ticket)
    if (s.state === 'open' || (s.state === 'gone' && !last)) continue
    const at = s.state === 'closed' && (!last || s.at > last) ? s.at : (last as string)
    out.push({
      id: `${ticket}-closed-${Date.parse(at)}`,
      ticket,
      // After any real action at the same instant: Halo's own sequence numbers are far smaller.
      seq: 2_000_000_000,
      at,
      who: 'Halo',
      outcome: TICKET_CLOSED,
      prd: [],
      mb: [],
      canny: [],
    })
  }
  return out
}
