// biome-ignore-all lint/security/noSecrets: the EN/ZH copy tables in this file are display text — the
// entropy scan reads long CJK strings as high-entropy secrets. Nothing secret is rendered here.

/**
 * Support Ticket Updates — the PM's weekly response numbers, laid out like the By Owner page: one card
 * for the owner, one row per number (status icon, name over a one-line reading, sparkline, value and
 * week-on-week change). A row opens the number's detail: current reading, weekly history, and the
 * exact tickets behind any week. The server speaks English; every word on this page is in T below.
 */
import { type ReactNode, useRef, useState } from 'react'
import {
  Alert,
  AlertDescription,
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  cn,
  root,
} from '@mspbots/ui'
import { AlertTriangle, RefreshCw, Upload } from 'lucide-react'
import { Delta, LangToggle, Sparkline, StatusChip, StatusIcon } from '../../lib/board'
import { useLang } from '../../lib/i18n'
import type { RowStatus, ScorecardRow } from '../../lib/scorecard-client'
import {
  type EntryKind,
  type EntryRow,
  type OffClock,
  type ResponseRow,
  type SupportUpdatesPayload,
  type WeekRow,
  importLog,
  useSupportUpdates,
} from '../../lib/support-updates-client'

export const meta = {
  label: 'Support Ticket Updates',
  icon: 'Timer',
  order: 4.5,
  menu: true,
  description: 'The PM’s weekly response numbers on support tickets — first response, requirement to development, requirement to Canny.',
}

type Metric = 'response' | EntryKind
type Unit = 'h' | 'd'

const METRICS: { id: Metric; tag: string; unit: Unit }[] = [
  { id: 'response', tag: 'PM1', unit: 'h' },
  { id: 'prd', tag: 'PM2', unit: 'd' },
  { id: 'canny', tag: 'PM3', unit: 'd' },
  { id: 'mb', tag: 'PM4', unit: 'd' },
]

// i18n: this page's own EN/ZH copy table. The app ships a language switch (lib/i18n.tsx) and the zh
// half is deliberate display copy, not untranslated English.
const EN = {
  title: 'Support Ticket Updates',
  subtitle:
    'Three numbers, read once a week in the PM’s working time. A week runs Monday to Sunday, so weekend and make-up-day work lands in it; only working hours count. Every row opens the tickets behind it.',
  refresh: 'Refresh',
  thisWeek: 'this week',
  logStartsMidWeek: 'log starts mid-week',
  metrics: {
    response: {
      name: 'PM first response',
      noun: (n: number): string => (n === 1 ? 'response' : 'responses'),
      short: 'Each arrival into the queue, to the first reply to the customer or a hand-off with a private note.',
      notes: [
        'A clock starts every time a ticket is moved into the PM queue (Product · product_zd@ or the PM) from anywhere else — Support, Development, anyone. A ticket that comes back is answered again and counted again.',
        'It stops at the PM’s first email to the customer (Email User or Email Update), or at the PM moving the ticket out of the queue with a private note left alongside. Triage is not a response, and a private note on its own is not one either — even one that posts a ClickUp link.',
        'Not counted, but listed with the reason: a hand-off with no private note, a ticket moved out by someone else first, or one closed before any response. A ticket still waiting is not in any average until it is answered.',
        'A reply on a rest day or outside working hours, to a ticket that arrived in the same off-hours stretch, scores 0.0 h: it came before the working clock started. It stays in the average as 0.0 h and is marked in the list.',
      ],
    },
    prd: {
      name: 'Requirement → development',
      noun: (n: number): string => (n === 1 ? 'requirement' : 'requirements'),
      short: 'The ticket’s first arrival in the queue, to the first ClickUp PRD link the PM posts on it.',
      notes: [
        'Measured from the first time the ticket entered the PM queue, not from its latest return, so the whole path a requirement takes — clarification rounds included — is in the number.',
        'Only a pasted ClickUp link counts (app.clickup.com/t/…/PRD-…); a bare "PRD-14894" in prose is usually a reference to something else.',
        'A ticket created before the log starts has no first arrival on record, so it is listed as not counted rather than guessed.',
      ],
    },
    canny: {
      name: 'Requirement → Canny',
      noun: (n: number): string => (n === 1 ? 'requirement' : 'requirements'),
      short: 'The ticket’s first arrival in the queue, to the first Canny post link the PM posts on it.',
      notes: [
        'A new Canny post and adding the request to an existing post both count; only links the PM posts himself count.',
        'Same clock and the same rule for tickets older than the log as requirement → development.',
      ],
    },
    mb: {
      name: 'Bug → development',
      noun: (n: number): string => (n === 1 ? 'bug' : 'bugs'),
      short: 'The ticket’s first arrival in the queue, to the PM handing it into development.',
      notes: [
        'The clock stops when the PM moves the ticket to Lucas (who takes bugs in for development) or to anyone in Development, or posts a ClickUp MB link himself — whichever comes first.',
        'The MB task Lucas logs afterwards does not stop it: reproducing and logging the bug is development’s time, not the PM’s.',
        'Kept apart from requirements: bugs and requirements move at different speeds, and one average over both would describe neither.',
      ],
    },
  },
  rowSub: (tag: string, n: number, noun: string, median: string) => `${tag} · ${n} ${noun} · median ${median} · target not set`,
  rowNone: (tag: string) => `${tag} · none measured in this week · target not set`,
  waitingName: 'Waiting for a first response',
  waitingSub: (hours: string) => `now · oldest ${hours} working h · in no average until answered`,
  waitingNone: 'now · nothing waiting',
  waitingBadge: (n: number) => `${n} waiting`,
  workingDays: (n: number) => `${n} working days`,
  holidays: (n: number) => (n === 1 ? '1 holiday' : `${n} holidays`),
  makeupDays: (n: number) => (n === 1 ? '1 make-up day' : `${n} make-up days`),
  aside: (parts: string[]) => (parts.length ? ` (${parts.join(', ')})` : ''),
  inProgress: (gone: string, total: string) => `in progress, ${gone} of ${total} h gone`,
  logStarts: (date: string) => `the log starts ${date}, mid-week`,
  complete: 'complete',
  // detail dialog
  reading: (label: string, n: number, noun: string) => `${label} / week before · ${n} ${noun}`,
  median: (v: string) => `median ${v}`,
  historyHeading: 'Weekly history — pick a week to list its tickets',
  colWeek: 'Week',
  colAverage: 'Average',
  colCounted: 'Counted',
  colChange: 'Change',
  ticketsHeading: (label: string, counted: number, other: number) =>
    `Tickets · ${label} — ${counted} counted${other > 0 ? `, ${other} not` : ''}`,
  nothingCounted: 'Nothing counted in this week.',
  notCountedHeading: 'Landed in this week, not counted',
  howHeading: 'How it is measured',
  colTicket: 'Ticket',
  colRequest: 'Request',
  colArrived: 'Arrived · from',
  colResponded: 'Responded',
  colLeft: 'Left',
  colTime: 'Time',
  colHow: 'How',
  colWhy: 'Why not counted',
  colFirstArrival: 'First arrival',
  colStopped: 'Clock stopped',
  colRef: 'Link or hand-off',
  unknown: 'unknown',
  replied: (action: string) => `Replied to the customer (${action})`,
  handedOff: (to: string) => `Re-Assign → ${to} + private note`,
  noNote: (to: string) => `Re-Assign → ${to}, no private note`,
  takenOut: (to: string, by: string) => `moved to ${to} by ${by}`,
  closedEarly: (action: string) => `${action} before any response`,
  notYet: 'no response yet',
  handedTo: (to: string) => `handed to ${to}`,
  notCounted: {
    'no-note': 'handed off without a private note',
    'taken-out': 'moved out by someone else before a PM response',
    closed: 'closed before any response',
    'history-before-data': 'created before the log starts — first arrival not on record',
    'no-arrival-on-record': 'no arrival into the queue on record',
  } as Record<string, string>,
  offClockReply: {
    'rest-day': 'Rest-day reply — the working clock had not started',
    'after-hours': 'Outside working hours — the working clock had not started',
  },
  offClockEntry: {
    'rest-day': 'On a rest day — the working clock had not started',
    'after-hours': 'Outside working hours — the working clock had not started',
  },
  source: 'Source: ',
  logFrom: (date: string) => `log from ${date}`,
  clock: (hours: string, confirmed: boolean) => `working time ${hours}, CN calendar (${confirmed ? 'confirmed' : 'proposed'})`,
  // waiting dialog
  asOfNow: 'as of now',
  waitingDescription:
    'In the queue with no reply to the customer and no hand-off yet. Working time so far — not in any average until answered.',
  nothingWaiting: 'Nothing is waiting.',
  // banners and footer
  captureFailed: (at: string) => `The last refresh from Halo failed; showing the log as of ${at}.`,
  gaps: (n: number, list: string) =>
    `The log has ${n === 1 ? 'a gap' : `${n} gaps`} (${list}). Actions in it aged out of Halo before they were copied; the weeks it touches are incomplete.`,
  firstCapture: 'First capture running — reading 14 days of Halo Actions. This takes a minute or two; the page updates by itself.',
  emptyLog: 'No events in the log yet.',
  refreshing: 'Refreshing from Halo… ',
  captured: (at: string, source: string) => `Captured ${at} (${source}). `,
  legend: (workday: number, from: string) =>
    `h = working hours, d = working days of ${workday} h. Halo keeps 14 days of actions, so they are copied into a log that starts ${from}.`,
  importLog: 'Import log',
  importHint: 'Backfill from an exported event log (the local PM Weekly file). Only what this log does not already hold is added.',
  imported: (added: number, read: number) => `Imported — ${added} new of ${read} events.`,
  importFailed: (why: string) => `Import failed: ${why}`,
}

// i18n: the zh half of the copy table above — deliberate display copy, not untranslated English.
const ZH: typeof EN = {
  title: 'Support 工单更新',
  subtitle:
    '三个数字，每周看一次，按 PM 的工作时间计。一周为周一至周日，周末和调休补班日的工作都算在内；只计工作时段。每一行都能点开，查看背后的工单。',
  refresh: '刷新',
  thisWeek: '本周',
  logStartsMidWeek: '日志从周中开始',
  metrics: {
    response: {
      name: 'PM 首次响应',
      noun: () => '次响应',
      short: '工单每次进入队列，到 PM 首次回复客户、或带内部备注转出为止。',
      notes: [
        '工单每次从其他任何地方（Support、Development 或任何人）被转入 PM 队列（Product · product_zd@ 或 PM 本人）时开始计时。工单退回后再次进入队列，就要再次响应、再次计入。',
        '在 PM 第一次给客户发邮件（Email User 或 Email Update）时停表，或在 PM 把工单转出队列、同时留下内部备注（private note）时停表。Triage 不算响应；单独一条内部备注也不算——即使里面贴了 ClickUp 链接。',
        '以下情况不计入，但会连同原因列出：转出时没留内部备注、PM 响应前已被他人转出、响应前已关闭。仍在等待的工单，在得到响应前不计入任何平均值。',
        '在休息日或非工作时段回复、且工单也是在同一段非工作时间内到达的，记为 0.0 h：回复发生在工作时钟开始之前。它按 0.0 h 计入平均值，并在列表中标注。',
      ],
    },
    prd: {
      name: '需求进研发',
      noun: () => '个需求',
      short: '工单首次进入队列，到 PM 在工单上贴出第一个 ClickUp PRD 链接为止。',
      notes: [
        '从工单第一次进入 PM 队列起算，而不是从最近一次退回起算，因此需求走过的完整路径——包括来回澄清——都计在内。',
        '只有贴出的 ClickUp 链接才算（app.clickup.com/t/…/PRD-…）；正文里单独写的 "PRD-14894" 通常是在引用别的东西。',
        '日志起点之前创建的工单没有首次到达记录，因此列为「不计入」，而不是去猜。',
      ],
    },
    canny: {
      name: '需求推 Canny',
      noun: () => '个需求',
      short: '工单首次进入队列，到 PM 在工单上贴出第一个 Canny 帖子链接为止。',
      notes: [
        '新建 Canny 帖子、或把需求挂到已有帖子上，都算；只统计 PM 本人贴出的链接。',
        '计时方式、以及对早于日志起点的工单的处理规则，都与「需求进研发」相同。',
      ],
    },
    mb: {
      name: 'Bug 进研发',
      noun: () => '个 bug',
      short: '工单首次进入队列，到 PM 把它交给研发为止。',
      notes: [
        'PM 把工单转给 Lucas（负责接收 bug 进研发）或 Development 部门的任何人，或 PM 本人贴出 ClickUp MB 链接——以先发生者为准——即停表。',
        'Lucas 之后建的 MB 任务不作为停表点：复现和登记 bug 是研发的时间，不是 PM 的。',
        '与需求分开统计：bug 和需求的推进速度不同，混在一起的平均值哪个都描述不了。',
      ],
    },
  },
  rowSub: (tag: string, n: number, noun: string, median: string) => `${tag} · ${n} ${noun} · 中位数 ${median} · 未设目标`,
  rowNone: (tag: string) => `${tag} · 该周无测量 · 未设目标`,
  waitingName: '等待首次响应',
  waitingSub: (hours: string) => `当前 · 最久已等 ${hours} 工作小时 · 回复前不计入任何平均值`,
  waitingNone: '当前 · 无等待',
  waitingBadge: (n: number) => `${n} 个等待中`,
  workingDays: (n: number) => `${n} 个工作日`,
  holidays: (n: number) => `${n} 天假期`,
  makeupDays: (n: number) => `${n} 天调休补班`,
  aside: (parts: string[]) => (parts.length ? `（${parts.join('、')}）` : ''),
  inProgress: (gone: string, total: string) => `进行中，已过 ${gone}/${total} 小时`,
  logStarts: (date: string) => `日志从 ${date} 开始，非整周`,
  complete: '已完结',
  reading: (label: string, n: number, noun: string) => `${label} / 上一周 · ${n} ${noun}`,
  median: (v: string) => `中位数 ${v}`,
  historyHeading: '周历史 — 点选某一周，查看对应工单',
  colWeek: '周',
  colAverage: '平均',
  colCounted: '计入',
  colChange: '环比',
  ticketsHeading: (label: string, counted: number, other: number) =>
    `工单 · ${label} — 计入 ${counted} 条${other > 0 ? `，未计入 ${other} 条` : ''}`,
  nothingCounted: '该周没有计入的记录。',
  notCountedHeading: '落在该周、但未计入',
  howHeading: '口径',
  colTicket: '工单',
  colRequest: '请求',
  colArrived: '到达 · 来源',
  colResponded: '响应时间',
  colLeft: '离开时间',
  colTime: '用时',
  colHow: '方式',
  colWhy: '未计入原因',
  colFirstArrival: '首次到达',
  colStopped: '停表时间',
  colRef: '链接或转交',
  unknown: '未知',
  replied: (action: string) => `回复客户（${action}）`,
  handedOff: (to: string) => `转给 ${to} ＋ 内部备注`,
  noNote: (to: string) => `转给 ${to}，无内部备注`,
  takenOut: (to: string, by: string) => `被 ${by} 转给 ${to}`,
  closedEarly: (action: string) => `响应前已 ${action}`,
  notYet: '尚未响应',
  handedTo: (to: string) => `转给 ${to}`,
  notCounted: {
    'no-note': '转出时没有留内部备注',
    'taken-out': 'PM 响应前已被他人转出',
    closed: '响应前已关闭',
    'history-before-data': '工单创建早于日志起点——首次到达无记录',
    'no-arrival-on-record': '没有进入队列的记录',
  },
  offClockReply: {
    'rest-day': '休息日回复——工作时钟尚未开始',
    'after-hours': '非工作时段——工作时钟尚未开始',
  },
  offClockEntry: {
    'rest-day': '休息日完成——工作时钟尚未开始',
    'after-hours': '非工作时段——工作时钟尚未开始',
  },
  source: '数据源：',
  logFrom: (date: string) => `日志起点 ${date}`,
  clock: (hours: string, confirmed: boolean) => `工作时间 ${hours}，中国节假日日历（${confirmed ? '已确认' : '待确认'}）`,
  asOfNow: '截至当前',
  waitingDescription: '在队列中，尚未回复客户、也未转出。显示至今的工作时长——回复前不计入任何平均值。',
  nothingWaiting: '当前没有等待中的工单。',
  captureFailed: (at: string) => `最近一次从 Halo 刷新失败；当前显示的是截至 ${at} 的日志。`,
  gaps: (n: number, list: string) => `日志有 ${n} 处缺口（${list}）。其中的 action 在复制前已从 Halo 过期，涉及的周数据不完整。`,
  firstCapture: '首次采集中——正在读取 Halo Actions 最近 14 天的数据，约需一两分钟，页面会自动更新。',
  emptyLog: '日志里还没有事件。',
  refreshing: '正在从 Halo 刷新… ',
  captured: (at: string, source: string) => `采集于 ${at}（${source}）。`,
  legend: (workday: number, from: string) =>
    `h = 工作小时，d = 工作日（每天 ${workday} 小时）。Halo 只保留 14 天的 action，因此会复制到日志中，日志起点 ${from}。`,
  importLog: '导入日志',
  importHint: '用导出的事件日志（本地 PM Weekly 文件）补齐更早的历史。只会添加当前日志里没有的内容。',
  imported: (added: number, read: number) => `已导入——${read} 条事件中新增 ${added} 条。`,
  importFailed: (why: string) => `导入失败：${why}`,
}

const T = { en: EN, zh: ZH }
type Copy = typeof EN

/* ── reading the payload ── */

const counted = (r: ResponseRow) => r.outcome === 'replied' || r.outcome === 'handed-off'

/** Asia/Shanghai wall time, "09-28 11:57" — the PM's clock, not the viewer's. */
function local(iso: string | null): string {
  if (!iso) return '—'
  return new Date(Date.parse(iso) + 8 * 3600_000).toISOString().slice(5, 16).replace('T', ' ')
}

/** One decimal, as displayed — deltas are computed from the rounded values so they match what is shown. */
const round1 = (v: number) => Math.round(v * 10) / 10

function inUnit(hours: number | null, unit: Unit, workday: number): number | null {
  if (hours === null) return null
  return round1(unit === 'h' ? hours : hours / workday)
}

const show = (v: number | null, unit: Unit) => (v === null ? '—' : `${v.toFixed(1)} ${unit}`)

/** The rows behind a number — the same predicate the server's stat uses, so the two cannot disagree. */
function rowsFor(data: SupportUpdatesPayload, metric: Metric, week: string) {
  if (metric === 'response') {
    const inWeek = data.response.filter((r) => r.week === week)
    return { counted: inWeek.filter(counted), other: inWeek.filter((r) => !counted(r) && r.outcome !== 'open') }
  }
  const inWeek = data.entries.filter((r) => r.kind === metric && r.week === week)
  return { counted: inWeek.filter((r) => r.status === 'counted'), other: inWeek.filter((r) => r.status !== 'counted') }
}

/**
 * One number at one week, shaped as a scorecard row so it draws with the board's own sparkline,
 * delta and status icon. Weeks arrive newest first: `index` is the selected week, `index + 1` the one
 * before it. compare 'lte': every number here is a wait, so down is the good direction.
 */
function reading(data: SupportUpdatesPayload, metric: Metric, index: number) {
  const unit = METRICS.find((m) => m.id === metric)?.unit ?? 'h'
  const workday = data.calendar.workdayHours
  const week = data.weeks[index]
  const prev = data.weeks[index + 1]
  const stat = week?.[metric]
  const value = stat && stat.n > 0 ? inUnit(stat.meanHours, unit, workday) : null
  const previous = prev && prev[metric].n > 0 ? inUnit(prev[metric].meanHours, unit, workday) : null
  const history = data.weeks
    .slice(index)
    .filter((w) => w[metric].n > 0)
    .map((w) => ({ week: w.label, value: inUnit(w[metric].meanHours, unit, workday) as number }))
    .reverse()
  const row: ScorecardRow = {
    id: metric,
    name: metric,
    owner: data.pm,
    group: 'support',
    kind: 'computed',
    compare: 'lte',
    value,
    previous,
    status: 'display',
    target: null,
    targetText: '',
    history,
  }
  return { unit, stat, row, median: stat && stat.n > 0 ? inUnit(stat.medianHours, unit, workday) : null }
}

function howText(r: ResponseRow, t: Copy): string {
  const to = r.to ?? t.unknown
  switch (r.outcome) {
    case 'replied':
      return t.replied(r.action ?? '')
    case 'handed-off':
      return t.handedOff(to)
    case 'no-note':
      return t.noNote(to)
    case 'taken-out':
      return t.takenOut(to, r.by ?? t.unknown)
    case 'closed':
      return t.closedEarly(r.action ?? '')
    default:
      return t.notYet
  }
}

/* ── rows ── */

function Line({
  status,
  name,
  sub,
  spark,
  value,
  delta,
  onClick,
}: {
  status: RowStatus
  name: string
  sub: string
  spark?: ReactNode
  value: string
  delta?: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full cursor-pointer items-center gap-3 rounded-md border border-l-2 bg-card px-3 py-2 text-left transition-colors hover:bg-muted/40',
        status === 'yellow' ? 'border-l-warning-500 bg-warning-500/[0.04] hover:bg-warning-500/[0.08]' : 'border-l-transparent',
      )}
    >
      <StatusIcon status={status} className="w-5 justify-center" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm">{name}</div>
        <div className="text-[11px] text-muted-foreground">{sub}</div>
      </div>
      {spark}
      <div className="flex shrink-0 items-baseline gap-1.5">
        <span className="font-mono text-sm font-semibold tabular-nums">{value}</span>
        {delta}
      </div>
    </button>
  )
}

/* ── detail dialogs ── */

function Heading({ children }: { children: ReactNode }) {
  return <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{children}</div>
}

function Request({ summary, client }: { summary: string; client: string }) {
  return (
    <TableCell className="whitespace-normal align-top">
      <div className="text-xs">{summary || '—'}</div>
      {client && <div className="text-[11px] text-muted-foreground">{client}</div>}
    </TableCell>
  )
}

function OffClockNote({ value, labels }: { value: OffClock; labels: Record<'rest-day' | 'after-hours', string> }) {
  if (!value) return null
  return <div className="mt-0.5 text-[11px] text-warning-700">{labels[value]}</div>
}

function ResponseRows({ rows, reason, t }: { rows: ResponseRow[]; reason?: boolean; t: Copy }) {
  return (
    <Table className="text-xs">
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">{t.colTicket}</TableHead>
          <TableHead>{t.colRequest}</TableHead>
          <TableHead className="w-36">{t.colArrived}</TableHead>
          <TableHead className="w-24">{reason ? t.colLeft : t.colResponded}</TableHead>
          {!reason && <TableHead className="w-16 text-right">{t.colTime}</TableHead>}
          <TableHead className="w-40">{reason ? t.colWhy : t.colHow}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={`${r.ticket}-${r.arrivedAt}`}>
            <TableCell className="align-top tabular-nums text-muted-foreground">#{r.ticket}</TableCell>
            <Request summary={r.summary} client={r.client} />
            <TableCell className="whitespace-normal align-top">
              <div className="tabular-nums">{local(r.arrivedAt)}</div>
              <div className="text-[11px] text-muted-foreground">{r.arrivedFrom ?? t.unknown}</div>
            </TableCell>
            <TableCell className="align-top tabular-nums">{local(r.endedAt)}</TableCell>
            {!reason && (
              <TableCell className="text-right align-top tabular-nums">{r.hours === null ? '—' : `${r.hours.toFixed(1)} h`}</TableCell>
            )}
            <TableCell className="whitespace-normal align-top text-muted-foreground">
              {reason ? `${t.notCounted[r.outcome] ?? r.outcome} · ${howText(r, t)}` : howText(r, t)}
              <OffClockNote value={r.offClock} labels={t.offClockReply} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// The ClickUp workspace every PM dev link points into.
const CLICKUP_WORKSPACE = '2280862'

function RefLink({ row, t }: { row: EntryRow; t: Copy }) {
  // A hand-off has no link to follow: say who it went to.
  if (row.via === 'handoff') return <span className="text-muted-foreground">{t.handedTo(row.ref)}</span>
  const href = row.kind === 'canny' ? `https://mspbots.canny.io${row.ref}` : `https://app.clickup.com/t/${CLICKUP_WORKSPACE}/${row.ref}`
  return (
    <a href={href} target="_blank" rel="noreferrer" className="break-all underline-offset-2 hover:underline">
      {row.ref}
    </a>
  )
}

function EntryRows({ rows, workday, reason, t }: { rows: EntryRow[]; workday: number; reason?: boolean; t: Copy }) {
  return (
    <Table className="text-xs">
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">{t.colTicket}</TableHead>
          <TableHead>{t.colRequest}</TableHead>
          <TableHead className="w-24">{t.colFirstArrival}</TableHead>
          <TableHead className="w-24">{t.colStopped}</TableHead>
          {!reason && <TableHead className="w-16 text-right">{t.colTime}</TableHead>}
          <TableHead className="w-48">{reason ? t.colWhy : t.colRef}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={`${r.ticket}-${r.kind}`}>
            <TableCell className="align-top tabular-nums text-muted-foreground">#{r.ticket}</TableCell>
            <Request summary={r.summary} client={r.client} />
            <TableCell className="align-top tabular-nums">{local(r.arrivedAt)}</TableCell>
            <TableCell className="align-top tabular-nums">{local(r.at)}</TableCell>
            {!reason && (
              <TableCell className="text-right align-top tabular-nums">
                {r.hours === null ? '—' : `${(r.hours / workday).toFixed(1)} d`}
                {r.hours !== null && <div className="text-[11px] text-muted-foreground">{r.hours.toFixed(1)} h</div>}
              </TableCell>
            )}
            <TableCell className="whitespace-normal align-top">
              {reason && <div className="text-muted-foreground">{t.notCounted[r.status] ?? r.status}</div>}
              <RefLink row={r} t={t} />
              <OffClockNote value={r.offClock} labels={t.offClockEntry} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function Source({ data, t }: { data: SupportUpdatesPayload; t: Copy }) {
  return (
    <>
      <Separator />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        <span>
          {t.source}
          <span className="font-mono">Halo Actions ({data.dataset})</span>
        </span>
        <span>{t.logFrom(local(data.coverageFrom))}</span>
        <span>{t.clock(data.calendar.hours, data.calendar.status === 'confirmed')}</span>
      </div>
    </>
  )
}

function MetricDialog({
  data,
  metric,
  initial,
  onClose,
}: {
  data: SupportUpdatesPayload
  metric: Metric
  initial: number
  onClose: () => void
}) {
  const lang = useLang()
  const t = T[lang]
  const copy = t.metrics[metric]
  const tag = METRICS.find((m) => m.id === metric)?.tag ?? ''
  const [index, setIndex] = useState(initial)
  const workday = data.calendar.workdayHours
  const { unit, stat, row, median } = reading(data, metric, index)
  const week = data.weeks[index]
  const { counted: rows, other } = week ? rowsFor(data, metric, week.monday) : { counted: [], other: [] }
  // History newest first, each with its change against the week before it.
  const history = data.weeks.map((w, i) => {
    const v = w[metric].n > 0 ? inUnit(w[metric].meanHours, unit, workday) : null
    const next = data.weeks[i + 1]
    const before = next && next[metric].n > 0 ? inUnit(next[metric].meanHours, unit, workday) : null
    return { i, w, v, diff: v !== null && before !== null ? round1(v - before) : null }
  })
  const n = stat?.n ?? 0

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent container={root()} className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <StatusChip status="display" />
            <span className="text-[11px] text-muted-foreground">
              {tag} · {data.pm}
            </span>
          </div>
          <DialogTitle className="text-base leading-snug">{copy.name}</DialogTitle>
          <DialogDescription className="text-xs">{copy.short}</DialogDescription>
        </DialogHeader>

        {/* current reading */}
        <div className="flex items-end justify-between gap-4 rounded-lg border bg-muted/30 px-4 py-3">
          <div>
            <div className="text-[11px] text-muted-foreground">
              {t.reading(week?.label ?? '', n, copy.noun(n))}
              {median !== null ? ` · ${t.median(show(median, unit))}` : ''}
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-semibold leading-none tracking-tight tabular-nums">{show(row.value, unit)}</span>
              <span className="font-mono text-sm tabular-nums text-muted-foreground">{show(row.previous, unit)}</span>
              <Delta row={row} />
            </div>
          </div>
          <Sparkline row={row} width={150} height={44} />
        </div>

        <div>
          <Heading>{t.historyHeading}</Heading>
          <div className="max-h-44 overflow-y-auto rounded-md border">
            <Table className="text-xs tabular-nums">
              <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur">
                <TableRow>
                  <TableHead className="h-8 px-3">{t.colWeek}</TableHead>
                  <TableHead className="h-8 px-3 text-right">{t.colAverage}</TableHead>
                  <TableHead className="h-8 px-3 text-right">{t.colCounted}</TableHead>
                  <TableHead className="h-8 px-3 text-right">{t.colChange}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map(({ i, w, v, diff }) => (
                  <TableRow
                    key={w.monday}
                    onClick={() => setIndex(i)}
                    className={cn('cursor-pointer hover:bg-muted/40', i === index && 'bg-primary/5 font-medium')}
                  >
                    <TableCell className="px-3 py-1.5">
                      {w.label}
                      {w.partial === 'in-progress' && <span className="ml-1.5 text-muted-foreground">{t.thisWeek}</span>}
                      {w.partial === 'coverage' && <span className="ml-1.5 text-muted-foreground">{t.logStartsMidWeek}</span>}
                    </TableCell>
                    <TableCell className="px-3 py-1.5 text-right">{show(v, unit)}</TableCell>
                    <TableCell className="px-3 py-1.5 text-right text-muted-foreground">{w[metric].n}</TableCell>
                    <TableCell
                      className={cn(
                        'px-3 py-1.5 text-right',
                        diff === null || diff === 0 ? 'text-muted-foreground/60' : diff < 0 ? 'text-success-700' : 'text-danger-700',
                      )}
                    >
                      {diff === null ? '—' : `${diff > 0 ? '+' : ''}${diff}`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="space-y-2">
          <Heading>{t.ticketsHeading(week?.label ?? '', rows.length, other.length)}</Heading>
          {rows.length === 0 ? (
            <p className="text-xs italic text-muted-foreground">{t.nothingCounted}</p>
          ) : metric === 'response' ? (
            <ResponseRows rows={rows as ResponseRow[]} t={t} />
          ) : (
            <EntryRows rows={rows as EntryRow[]} workday={workday} t={t} />
          )}
          {other.length > 0 && (
            <div className="rounded-md border border-dashed p-2">
              <div className="mb-1 text-[11px] text-muted-foreground">{t.notCountedHeading}</div>
              {metric === 'response' ? (
                <ResponseRows rows={other as ResponseRow[]} reason t={t} />
              ) : (
                <EntryRows rows={other as EntryRow[]} workday={workday} reason t={t} />
              )}
            </div>
          )}
        </div>

        <div>
          <Heading>{t.howHeading}</Heading>
          <div className="space-y-1.5">
            {copy.notes.map((note) => (
              <p key={note} className="text-xs leading-relaxed text-muted-foreground">
                {note}
              </p>
            ))}
          </div>
        </div>

        <Source data={data} t={t} />
      </DialogContent>
    </Dialog>
  )
}

function WaitingDialog({ data, onClose }: { data: SupportUpdatesPayload; onClose: () => void }) {
  const t = T[useLang()]
  const rows = data.response.filter((r) => r.outcome === 'open')
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent container={root()} className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <StatusChip status={rows.length ? 'yellow' : 'green'} />
            <span className="text-[11px] text-muted-foreground">
              {t.asOfNow} · {data.pm}
            </span>
          </div>
          <DialogTitle className="text-base leading-snug">{t.waitingName}</DialogTitle>
          <DialogDescription className="text-xs">{t.waitingDescription}</DialogDescription>
        </DialogHeader>
        {rows.length === 0 ? (
          <p className="text-xs italic text-muted-foreground">{t.nothingWaiting}</p>
        ) : (
          <ResponseRows rows={rows} t={t} />
        )}
        <Source data={data} t={t} />
      </DialogContent>
    </Dialog>
  )
}

/* ── page ── */

function OwnerCard({ data, index, onOpen }: { data: SupportUpdatesPayload; index: number; onOpen: (m: Metric | 'waiting') => void }) {
  const t = T[useLang()]
  const week: WeekRow | undefined = data.weeks[index]
  const open = data.response.filter((r) => r.outcome === 'open')
  const oldest = open.reduce((m, r) => Math.max(m, r.hours ?? 0), 0)
  const shape = week?.shape
  const done = shape ? shape.elapsedHours / Math.max(shape.totalHours, 1) : 0
  const extras = [shape?.holidays ? t.holidays(shape.holidays) : '', shape?.makeupDays ? t.makeupDays(shape.makeupDays) : ''].filter(
    Boolean,
  )
  const status =
    week?.partial === 'in-progress'
      ? t.inProgress(shape?.elapsedHours.toFixed(0) ?? '0', String(shape?.totalHours ?? 0))
      : week?.partial === 'coverage'
        ? t.logStarts(local(data.coverageFrom).slice(0, 5))
        : t.complete

  return (
    <Card className={cn(open.length > 0 && 'border-warning-500/30')}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">{data.pm.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="truncate text-base">{data.pm}</CardTitle>
              <div className="flex shrink-0 items-center gap-1.5">
                {open.length > 0 && (
                  <Badge variant="outline" className="h-5 border-warning-500/50 px-1.5 text-[11px] text-warning-700">
                    {t.waitingBadge(open.length)}
                  </Badge>
                )}
                <Badge variant="outline" className="h-5 px-1.5 text-[11px]">
                  {week?.label}
                </Badge>
              </div>
            </div>
            <CardDescription className="text-xs">
              {shape ? t.workingDays(shape.workdays) : ''}
              {t.aside(extras)} · {status}
            </CardDescription>
          </div>
        </div>
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn('absolute inset-y-0 left-0 rounded-full', done >= 1 ? 'bg-success-500' : 'bg-primary')}
            style={{ width: `${Math.min(done, 1) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {METRICS.map((m) => {
          const { row, stat, median, unit } = reading(data, m.id, index)
          const n = stat?.n ?? 0
          const copy = t.metrics[m.id]
          return (
            <Line
              key={m.id}
              status="display"
              name={copy.name}
              sub={n > 0 ? t.rowSub(m.tag, n, copy.noun(n), show(median, unit)) : t.rowNone(m.tag)}
              spark={<Sparkline row={row} width={56} height={18} />}
              value={show(row.value, unit)}
              delta={<Delta row={row} />}
              onClick={() => onOpen(m.id)}
            />
          )
        })}
        <Line
          status={open.length > 0 ? 'yellow' : 'green'}
          name={t.waitingName}
          sub={open.length > 0 ? t.waitingSub(oldest.toFixed(1)) : t.waitingNone}
          value={String(open.length)}
          onClick={() => onOpen('waiting')}
        />
      </CardContent>
    </Card>
  )
}

function ImportButton({ onDone }: { onDone: () => void }) {
  const t = T[useLang()]
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const pick = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    setNote(null)
    try {
      const result = await importLog(file)
      setNote(t.imported(result.added, result.read))
      onDone()
    } catch (err) {
      setNote(t.importFailed(err instanceof Error ? err.message : String(err)))
    } finally {
      setBusy(false)
      if (input.current) input.current.value = ''
    }
  }
  return (
    <span className="inline-flex items-center gap-2">
      <Input ref={input} type="file" accept="application/json,.json" className="hidden" onChange={(e) => void pick(e.target.files?.[0])} />
      <Button
        size="sm"
        variant="ghost"
        className="h-6 px-2 text-[11px]"
        title={t.importHint}
        disabled={busy}
        onClick={() => input.current?.click()}
      >
        <Upload className={cn('size-3', busy && 'animate-pulse')} />
        {t.importLog}
      </Button>
      {note && <span>{note}</span>}
    </span>
  )
}

export default function SupportTicketUpdates() {
  const t = T[useLang()]
  const { data, error, loading, reload, refresh } = useSupportUpdates()
  const [pick, setPick] = useState<string | null>(null)
  const [open, setOpen] = useState<Metric | 'waiting' | null>(null)

  const index = data
    ? Math.max(
        0,
        data.weeks.findIndex((w) => w.monday === (pick ?? data.weeks[0]?.monday)),
      )
    : 0
  const cap = data?.capture
  const busy = loading || !!cap?.inFlight

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t.title}</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {data && data.weeks.length > 0 && (
            <Select value={data.weeks[index]?.monday} onValueChange={setPick}>
              <SelectTrigger className="h-8 w-48 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent container={root()}>
                {data.weeks.map((w) => (
                  <SelectItem key={w.monday} value={w.monday} className="text-xs">
                    {w.label}
                    {w.partial === 'in-progress' ? ` · ${t.thisWeek}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button size="sm" variant="outline" onClick={refresh} disabled={busy}>
            <RefreshCw className={cn('size-3.5', busy && 'animate-spin')} />
            {t.refresh}
          </Button>
          <LangToggle />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {cap?.lastError && (
        <Alert>
          <AlertTriangle className="h-4 w-4 text-warning-600" />
          <AlertDescription>
            <span className="font-medium text-warning-700">{t.captureFailed(local(cap.lastAt))} </span>
            <span className="text-muted-foreground">{cap.lastError}</span>
          </AlertDescription>
        </Alert>
      )}
      {data && data.gaps.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {t.gaps(data.gaps.length, data.gaps.map((g) => `${local(g.from)} → ${local(g.to)}`).join('; '))}
          </AlertDescription>
        </Alert>
      )}

      {!data && !error && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-72 w-full" />
        </div>
      )}

      {data && data.weeks.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {cap?.inFlight ? t.firstCapture : t.emptyLog}
          </CardContent>
        </Card>
      )}

      {data && data.weeks.length > 0 && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <OwnerCard data={data} index={index} onOpen={setOpen} />
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
            <span>
              {cap?.inFlight ? t.refreshing : cap?.lastAt ? t.captured(local(cap.lastAt), cap.source ?? '') : ''}
              {t.legend(data.calendar.workdayHours, local(data.coverageFrom))}
            </span>
            <ImportButton onDone={reload} />
          </div>
          {open === 'waiting' && <WaitingDialog data={data} onClose={() => setOpen(null)} />}
          {open && open !== 'waiting' && <MetricDialog data={data} metric={open} initial={index} onClose={() => setOpen(null)} />}
        </>
      )}

      {data && data.weeks.length === 0 && (
        <div className="text-[11px] text-muted-foreground">
          <ImportButton onDone={reload} />
        </div>
      )}
    </div>
  )
}
