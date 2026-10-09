/**
 * The PM's events, read from Halo Actions.
 *
 * All PM numbers are built from action rows, and Halo keeps only the last ~14 days of them. So this
 * module reads the three slices the numbers need and reduces each row to the facts they use — never
 * the note text itself, which carries customer correspondence and has no business being stored:
 *
 *   who = <PM>          every PM action: replies, private notes, hand-offs, the dev and Canny links
 *   outcome = Re-Assign every move, from which arrivals into and departures from the queue are read
 *   time_log_id = 1     each ticket's first action, so a ticket's history is known to be complete
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
 * Who counts as "the PM's queue" on either end of a Re-Assign. The shared mailbox and the PM
 * personally are both the queue; a move between them is internal and neither arrives nor leaves.
 */
export const PM_QUEUE_PEOPLE = ['product_zd@mspbots.ai', 'Frank Tian', 'frank.tian@mspbots.ai']
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

function toEvent(r: Row): PmEvent | null {
  const id = String(r.action_id ?? '')
  const ticket = String(r.ticket_id ?? '')
  const at = String(r.datetime ?? '')
  if (!id || !ticket || !Number.isFinite(Date.parse(at))) return null
  const who = String(r.who ?? '')
  const outcome = String(r.outcome ?? '')
  const note = String(r.note ?? '')
  const isPm = who === PM_NAME
  const move = outcome === 'Re-Assign' ? parseMove(note) : {}
  return {
    id,
    ticket,
    seq: Number(r.time_log_id) || 0,
    at: new Date(Date.parse(at)).toISOString(),
    who,
    outcome,
    ...move,
    prd: isPm ? clickupIds(note, 'PRD') : [],
    mb: isPm ? clickupIds(note, 'MB') : [],
    canny: isPm ? cannyPaths(note) : [],
  }
}

/** A Re-Assign is kept only if the PM's queue is on one end of it; the rest of the tenant is noise. */
export function relevant(e: PmEvent): boolean {
  if (e.who === PM_NAME) return true
  if (e.outcome === 'Re-Assign') return inQueue(e.from) || inQueue(e.to)
  return false
}

export async function readActions(datasetId: string, auth: ReadAuth): Promise<ActionsRead> {
  const client = createMspbotsReportClient({
    mspbots_client_host: process.env.MSPBOTS_REPORT_HOST ?? 'https://app.mspbots.ai/web/reports',
    public_api_key: auth.apiKey,
  })
  const slice = (params: Record<string, string>) =>
    pullSlice((page) => {
      const query = { current: page, size: PAGE_SIZE, ...params }
      const read =
        auth.mode === 'public'
          ? client.getPublicDatasetData(datasetId, query)
          : client.getDatasetData(datasetId, query, { token: auth.token, tenantCode: auth.tenantCode })
      return withTimeout(read as Promise<Row>, REQUEST_TIMEOUT_MS, `dataset ${datasetId} page ${page}`).then((b) => checked(b, datasetId))
    })

  const [pm, moves, firsts] = await Promise.all([slice({ who: PM_NAME }), slice({ outcome: 'Re-Assign' }), slice({ time_log_id: '1' })])
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
    if (e && relevant(e) && !events.has(e.id)) {
      events.set(e.id, e)
      noteTicket(r)
    }
  }
  const created: Record<string, string> = {}
  for (const r of firsts) {
    const t = String(r.ticket_id ?? '')
    const at = Date.parse(String(r.datetime ?? ''))
    if (t && Number.isFinite(at)) created[t] = new Date(at).toISOString()
  }

  const all = [...pm, ...moves, ...firsts].map((r) => Date.parse(String(r.datetime ?? ''))).filter(Number.isFinite)
  return {
    events: [...events.values()],
    created,
    tickets,
    source: auth.mode,
    rows: pm.length + moves.length + firsts.length,
    oldest: all.length ? new Date(Math.min(...all)).toISOString() : null,
    newest: all.length ? new Date(Math.max(...all)).toISOString() : null,
  }
}
