// ClickUp logged hours, scoped to the product org.
//
// "Our people" is resolved as the reporting tree rooted at the configured person (org.root),
// NOT as a department and NOT as a hardcoded roster. Verified against the live data: the product
// team spans three departments (Product, MSPbots.ai, Asset - Core), so `department = 'Product'`
// silently drops Kevin and Glenn; `manager = <root>` drops the root and every second-level report
// (e.g. Nora Li, who reports to Grace). Walking the tree picks up new hires automatically.

import { createMspbotsReportClient } from './mspbots-report.ts'
import { readSettings } from './settings.ts'

const PAGE_SIZE = 500
const MAX_PAGES = 20

export interface TimesheetEntry {
  date: string
  ticketId: string | null
  subject: string | null
  project: string
  person: string
  category: string
  client: string | null
  department: string | null
  manager: string | null
  hours: number
}

export interface TimesheetResult {
  entries: TimesheetEntry[]
  /** The resolved org tree, so the filter is auditable in the UI rather than implicit. */
  roster: { person: string; department: string | null; manager: string | null }[]
  /** Names dropped from the tree by configuration, shown so an exclusion is never invisible. */
  excluded: string[]
  root: string
  /** Full date span available in the dataset. */
  span: { from: string | null; to: string | null }
  /** When the upstream dataset was last read (epoch ms) — the page shows this as "synced". */
  fetchedAt: number
  totalRowsScanned: number
}

type Row = Record<string, unknown>

const str = (v: unknown): string => (v == null ? '' : String(v).trim())
const numOr0 = (v: unknown): number => {
  const n = typeof v === 'number' ? v : Number(str(v).replace(/[^0-9.-]/g, ''))
  return Number.isFinite(n) ? n : 0
}
/** Dataset dates arrive as 'YYYY-MM-DD' or a full timestamp; keep the day only. */
const dayOf = (v: unknown): string => {
  const s = str(v)
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/)
  if (m) return m[1]
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10)
}

/**
 * The upstream read is the expensive part — four paged calls, ~9s — and the underlying data is a
 * weekly timesheet that changes slowly. Caching it means changing the displayed date range costs
 * nothing: the range is applied to already-fetched rows (the client slices them locally too).
 */
const CACHE_TTL_MS = 10 * 60 * 1000
let rowCache: { datasetId: string; rows: Row[]; fetchedAt: number } | null = null

export function invalidateTimesheet(): void {
  rowCache = null
}

async function readAllRows(datasetId: string, apiKey: string): Promise<Row[]> {
  const client = createMspbotsReportClient({ public_api_key: apiKey })
  const out: Row[] = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = (await client.getPublicDatasetData(datasetId, { current: page, size: PAGE_SIZE })) as Row
    const code = res?.code
    if (code != null && String(code) !== '0') {
      const msg = str(res?.msg).replace(/eyJ[\w-]+\.[\w-]*\.?[\w-]*/g, '[token redacted]').slice(0, 200)
      throw new Error(`timesheet dataset ${datasetId} refused the read (code ${code}): ${msg}`)
    }
    const payload = (res?.data ?? res) as Row
    const batch = (Array.isArray(res?.data) ? res.data : (payload?.records ?? [])) as Row[]
    if (!Array.isArray(batch) || batch.length === 0) break
    out.push(...batch)
    if (batch.length < PAGE_SIZE) break
    if (page === MAX_PAGES) {
      throw new Error(`timesheet dataset ${datasetId} exceeded ${MAX_PAGES * PAGE_SIZE} rows — refusing a truncated read`)
    }
  }
  return out
}

/**
 * Everyone at or below `root` in the manager chain. Iterates to a fixed point so depth is not
 * assumed, and guards against a cycle in the data (a manager loop would otherwise hang).
 */
function resolveOrg(rows: Row[], root: string, exclude: Set<string>): Set<string> {
  const managerOf = new Map<string, string>()
  for (const r of rows) {
    const person = str(r.worker)
    if (person) managerOf.set(person, str(r.manager))
  }
  const inTree = new Set<string>()
  if ([...managerOf.keys()].some((p) => p.toLowerCase() === root.toLowerCase())) {
    for (const p of managerOf.keys()) if (p.toLowerCase() === root.toLowerCase()) inTree.add(p)
  } else {
    inTree.add(root)
  }
  for (let pass = 0; pass < 10; pass++) {
    let grew = false
    for (const [person, manager] of managerOf) {
      if (inTree.has(person) || !manager) continue
      // An excluded person is not a branch: their own reports do not enter the tree through them.
      if (exclude.has(person.toLowerCase())) continue
      for (const member of inTree) {
        if (manager.toLowerCase() === member.toLowerCase()) {
          inTree.add(person)
          grew = true
          break
        }
      }
    }
    if (!grew) break
  }
  for (const person of [...inTree]) {
    if (exclude.has(person.toLowerCase())) inTree.delete(person)
  }
  return inTree
}

export async function readTimesheet(opts: { refresh?: boolean } = {}): Promise<TimesheetResult> {
  const { values } = await readSettings()
  const apiKey = values.public_api_key
  if (!apiKey) throw new Error('no API key configured — set it on the Settings page')

  const datasetId = values['dataset.timesheet']
  const fresh =
    rowCache && rowCache.datasetId === datasetId && Date.now() - rowCache.fetchedAt < CACHE_TTL_MS
  if (opts.refresh || !fresh) {
    rowCache = { datasetId, rows: await readAllRows(datasetId, apiKey), fetchedAt: Date.now() }
  }
  const rows = rowCache!.rows
  const root = values['org.root']
  const excludeList = (values['org.exclude'] ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const team = resolveOrg(rows, root, new Set(excludeList.map((s) => s.toLowerCase())))

  const roster = new Map<string, { person: string; department: string | null; manager: string | null }>()
  const entries: TimesheetEntry[] = []
  let min: string | null = null
  let max: string | null = null

  for (const r of rows) {
    const person = str(r.worker)
    if (!person || !team.has(person)) continue

    const date = dayOf(r.date)
    if (!date) continue // an entry without a parseable date cannot sit on the timeline
    if (!min || date < min) min = date
    if (!max || date > max) max = date

    if (!roster.has(person)) {
      roster.set(person, { person, department: str(r.department) || null, manager: str(r.manager) || null })
    }

    entries.push({
      date,
      ticketId: str(r.ticket_id) || null,
      subject: str(r.ticket_subject) || null,
      // A blank timesheet_project stays "(unassigned)" — never fall back to list_name, a ClickUp
      // list is not a project (the reference app makes the same call).
      project: str(r.timesheet_project) || '(unassigned)',
      person,
      category: str(r.timesheet_category) || '(unassigned)',
      client: str(r.timesheet_client) || null,
      department: str(r.department) || null,
      manager: str(r.manager) || null,
      hours: numOr0(r.hours_taken),
    })
  }

  entries.sort((a, b) => (a.date === b.date ? b.hours - a.hours : b.date.localeCompare(a.date)))

  return {
    entries,
    roster: [...roster.values()].sort((a, b) => a.person.localeCompare(b.person)),
    excluded: excludeList,
    root,
    span: { from: min, to: max },
    fetchedAt: rowCache!.fetchedAt,
    totalRowsScanned: rows.length,
  }
}
