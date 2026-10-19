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
import { Delta, LangToggle, STATUS_META, Sparkline, StatusChip, StatusIcon } from '../../lib/board'
import { useLang } from '../../lib/i18n'
import type { RowStatus, ScorecardRow } from '../../lib/scorecard-client'
import {
  type Benchmark,
  type Sample,
  type EntryKind,
  type EntryRow,
  type Light,
  type Line as BenchmarkLine,
  type ResponseRow,
  type SupportUpdatesPayload,
  type TicketWeek,
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
    'The PM’s numbers, read once a week, all in clock time from the moment a ticket is escalated into the PM queue — nights, weekends and holidays included, because that is what the customer waits. A week runs Monday to Sunday. Every row opens the tickets behind it.',
  refresh: 'Refresh',
  thisWeek: 'this week',
  logStartsMidWeek: 'log starts mid-week',
  metrics: {
    response: {
      name: 'PM first response',
      noun: (n: number): string => (n === 1 ? 'ticket' : 'tickets'),
      short: 'Each arrival into the queue, to the first reply to the customer or a hand-off with a private note.',
      notes: [
        'A clock starts every time a ticket is moved into the PM queue (Product · product_zd@ or the PM) from anywhere else — Support, Development, anyone. A ticket that comes back is answered again, and that answer is timed on its own.',
        'It runs in clock time: nights, weekends and public holidays all count, because that is how long the customer waits.',
        'It stops at the PM’s first email to the customer (Email User or Email Update), or at the PM moving the ticket out of the queue with a private note left alongside. Triage is not a response, and a private note on its own is not one either — even one that posts a ClickUp link.',
        'The week’s number is an average over tickets. A ticket that came into the queue more than once that week counts once, at the average of those first responses, so a ticket that bounces back and forth weighs no more than one that does not. A ticket whose entries fall in different weeks counts in each week with that week’s entries; the list shows its average over all of them beside it, and a finished week never changes.',
        'Time the ticket spends on hold — SLA Hold, such as scheduled or waiting on the requester — does not count, the same as in Halo’s own SLA. The list shows how much was left out.',
        'Not counted, but listed with the reason: a hand-off with no private note, a ticket moved out by someone else first, or one closed before any response — by the PM or, as Halo’s ticket list shows, by anyone else. A ticket still waiting is not in any average until it is answered.',
      ],
    },
    prd: {
      name: 'Requirement → development',
      noun: (n: number): string => (n === 1 ? 'requirement' : 'requirements'),
      short: 'The ticket’s first arrival in the queue, to the first ClickUp PRD link the PM posts on it.',
      notes: [
        'Measured from the first time the ticket entered the PM queue, not from its latest return, so the whole path a requirement takes — clarification rounds included — is in the number. Counted in calendar days of 24 h, weekends and holidays included.',
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
        'The clock stops when the PM moves the ticket to Lucas (who takes bugs in for development) or to anyone in Development, or posts a ClickUp MB link himself — whichever comes first. Counted in calendar days of 24 h, weekends and holidays included.',
        'The MB task Lucas logs afterwards does not stop it: reproducing and logging the bug is development’s time, not the PM’s.',
        'Kept apart from requirements: bugs and requirements move at different speeds, and one average over both would describe neither.',
      ],
    },
  },
  rowSub: (tag: string, count: string, median: string, target: string) => `${tag} · ${count} · median ${median} · ${target}`,
  rowNone: (tag: string, target: string) => `${tag} · none measured in this week · ${target}`,
  target: (benchmark: string) => `benchmark ${benchmark}`,
  trendOnly: 'trend only',
  benchmarksTitle: (quarter: string) => `Benchmarks · ${quarter}`,
  benchmarksFrom: (from: string, history: boolean) =>
    `The ${from} average, held for the whole quarter${history ? ' — from Halo’s full history, which the log does not reach' : ''}.`,
  benchmarksLeftOut: (longWait: number, minWorkdays: number) =>
    `Left out of it: waits of over ${longWait} days, and weeks with fewer than ${minWorkdays} working days.`,
  colMetric: 'Number',
  colBenchmark: 'Benchmark',
  colSamples: 'Samples',
  tooFew: (n: number, min: number) => `trend only — ${n} of ${min} needed`,
  benchmarkTitle: (name: string) => `${name} — benchmark`,
  benchmarkIs: (from: string, n: number, noun: string) => `= the average of the ${n} ${noun} from ${from} counted below`,
  byWeekHeading: (from: string) => `By week · ${from}`,
  shortWeekOut: (min: number) => `week under ${min} working days — left out`,
  samplesHeading: (n: number) => `Counted · ${n}`,
  colValue: 'Value',
  entriesNote: (n: number) => `average of ${n} queue entries`,
  leftOutHeading: 'Listed, not averaged',
  longWaitOut: (days: number, limit: number) => `waited ${days} days (over ${limit}) — counts in its week, not in the benchmark`,
  noSamples: 'No measurements.',
  quarter: (q: string) => `${q.slice(5)} ${q.slice(0, 4)}`,
  benchmarkFrom: (quarter: string, count: string, longWait: number, history: boolean) =>
    `Benchmark: the ${quarter} average over ${count}, waits of over ${longWait} days left out${history ? ' — from Halo’s full history, which the log does not reach' : ''}.`,
  trendWhy: (quarter: string, n: number, min: number) => `Trend only: ${quarter} has ${n} measurements, and a benchmark needs ${min}.`,
  noBenchmark: (quarter: string) => `Trend only: there is no benchmark for ${quarter} yet.`,
  longWait: (days: number) => `Waited ${days} days — counts this week, left out of the quarter benchmark`,
  awayWhy: (days: string, limit: number) => `out of the queue ${days} days in one stretch on the way (over ${limit}) — in no average`,
  colourHeading: 'Colours',
  colourNotes: (r: { yellowFactor: number; minWorkdays: number; minSamples: number; longWaitDays: number; awayDays: number }) => [
    `Green when the week’s number is at or under the benchmark, yellow up to ${r.yellowFactor} × the benchmark, red above that. The comparison uses the one decimal the page shows.`,
    `The benchmark is the previous quarter’s average, fixed for the whole quarter. A week belongs to the quarter its Monday falls in. Weeks with fewer than ${r.minWorkdays} working days are left out of it, and it needs at least ${r.minSamples} measurements; with fewer, the number is shown as a trend only.`,
    `A wait of more than ${r.longWaitDays} days counts in its week like any other, so the week that clears an old ticket shows it. It is left out of the benchmark, so a few months-old tickets do not set the bar.`,
    `A request that was out of the queue for more than ${r.awayDays} days in one stretch, after it first arrived, is in no average at all: that time was not the PM’s. First response is never affected, because its clock stops when a ticket leaves the queue.`,
  ],
  countTickets: (tickets: number, responses: number) =>
    `${tickets} ${tickets === 1 ? 'ticket' : 'tickets'}${responses > tickets ? ` (${responses} responses)` : ''}`,
  countRows: (n: number) => String(n),
  waitingName: 'Waiting for a first response',
  waitingSub: (hours: string) => `now · oldest ${hours} h · in no average until answered`,
  waitingNone: 'now · nothing waiting',
  waitingSubAt: (week: string, hours: string) => `end of ${week} · oldest ${hours} h`,
  waitingNoneAt: (week: string) => `end of ${week} · nothing waiting`,
  othersNote: (held: number) => (held ? ` · ${held} on hold` : ''),
  asOfWeekEnd: (week: string) => `as of the end of ${week}`,
  groupOnHold: (n: number) => `On hold at that moment — ${n}, not counted: scheduled, or waiting on the requester`,
  laterNote: (week: string) => `Time runs to the end of ${week}. First response and How show what happened afterwards.`,
  waitingBadge: (n: number) => `${n} waiting`,
  workingDays: (n: number) => `${n} working days`,
  holidays: (n: number) => (n === 1 ? '1 holiday' : `${n} holidays`),
  makeupDays: (n: number) => (n === 1 ? '1 make-up day' : `${n} make-up days`),
  aside: (parts: string[]) => (parts.length ? ` (${parts.join(', ')})` : ''),
  inProgress: (gone: string, total: string) => `in progress, ${gone} of ${total} h gone`,
  logStarts: (date: string) => `the log starts ${date}, mid-week`,
  complete: 'complete',
  // detail dialog
  reading: (label: string, count: string) => `${label} / week before · ${count}`,
  median: (v: string) => `median ${v}`,
  historyHeading: 'Weekly history — pick a week to list its tickets',
  colWeek: 'Week',
  colAverage: 'Average',
  colCounted: 'Counted',
  colChange: 'Change',
  ticketsHeading: (label: string, counted: string, other: number) =>
    `Tickets · ${label} — ${counted} counted${other > 0 ? `, ${other} not` : ''}`,
  colTicketAvg: 'Counts this week',
  colTicketAvgHint:
    'What this ticket adds to the week’s average: its time, or the average when it entered the queue more than once this week.',
  allEntries: (n: number, hours: string) => `all ${n} entries ${hours}`,
  avgOf: (parts: string[]) => `(${parts.join(' + ')}) ÷ ${parts.length}`,
  pm1TableNote: (label: string, avg: string) =>
    `${label}: ${avg} is the average of the “Counts this week” column. Times are clock hours from entering the queue — nights, weekends and holidays included — less time on hold.`,
  nothingCounted: 'Nothing counted in this week.',
  notCountedHeading: 'Landed in this week, not counted',
  howHeading: 'How it is measured',
  colTicket: 'Ticket',
  colRequest: 'Request',
  colArrived: 'Entered queue · from',
  colResponded: 'First response',
  colLeft: 'Left',
  colElapsed: 'Time',
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
  closedInHalo: 'closed in Halo before any response',
  heldNote: (hours: string) => `on hold ${hours} h, not counted`,
  notYet: 'no response yet',
  handedTo: (to: string) => `handed to ${to}`,
  notCounted: {
    'no-note': 'handed off without a private note',
    'taken-out': 'moved out by someone else before a PM response',
    closed: 'closed before any response',
    'history-before-data': 'created before the log starts — first arrival not on record',
    'no-arrival-on-record': 'no arrival into the queue on record',
  } as Record<string, string>,
  source: 'Source: ',
  logFrom: (date: string) => `log from ${date}`,
  clock: (confirmed: boolean) =>
    `clock time, Asia/Shanghai; the CN calendar (${confirmed ? 'confirmed' : 'proposed'}) only marks holiday weeks`,
  // waiting dialog
  asOfNow: 'as of now',
  waitingDescription:
    'In the queue with no reply to the customer and no hand-off yet, at the end of the selected week (now, for this week). Time up to then in clock hours, less time on hold — not in any average until answered. Tickets on hold are listed below and not counted.',
  nothingWaiting: 'Nothing is waiting.',
  // banners and footer
  captureFailed: (at: string) => `The last refresh from Halo failed; showing the log as of ${at}.`,
  gaps: (n: number, list: string) =>
    `The log has ${n === 1 ? 'a gap' : `${n} gaps`} (${list}). Actions in it aged out of Halo before they were copied; the weeks it touches are incomplete.`,
  firstCapture: 'First capture running — reading 14 days of Halo Actions. This takes a minute or two; the page updates by itself.',
  emptyLog: 'No events in the log yet.',
  refreshing: 'Refreshing from Halo… ',
  captured: (at: string, source: string) => `Captured ${at} (${source}). `,
  legend: (dayHours: number, from: string) =>
    `All clock time: h = hours, d = calendar days of ${dayHours} h. Halo keeps 14 days of actions, so they are copied into a log that starts ${from}.`,
  importLog: 'Import log',
  importHint: 'Backfill from an exported event log (the local PM Weekly file). Only what this log does not already hold is added.',
  imported: (added: number, read: number) => `Imported — ${added} new of ${read} events.`,
  importFailed: (why: string) => `Import failed: ${why}`,
}

// i18n: the zh half of the copy table above — deliberate display copy, not untranslated English.
const ZH: typeof EN = {
  title: 'Support 工单更新',
  subtitle:
    'PM 的几个数字，每周看一次，全部从工单升级进 PM 队列那一刻起按自然时间计——晚上、周末和假期都算，因为客户就是等了这么久。一周为周一至周日。每一行都能点开，查看背后的工单。',
  refresh: '刷新',
  thisWeek: '本周',
  logStartsMidWeek: '日志从周中开始',
  metrics: {
    response: {
      name: 'PM 首次响应',
      noun: () => '张单',
      short: '工单每次进入队列，到 PM 首次回复客户、或带内部备注转出为止。',
      notes: [
        '工单每次从其他任何地方（Support、Development 或任何人）被转入 PM 队列（Product · product_zd@ 或 PM 本人）时开始计时。工单退回后再次进入队列，就要再次响应，这次响应单独计时。',
        '按自然时间计：晚上、周末和法定假期都算，因为客户就是等了这么久。',
        '在 PM 第一次给客户发邮件（Email User 或 Email Update）时停表，或在 PM 把工单转出队列、同时留下内部备注（private note）时停表。Triage 不算响应；单独一条内部备注也不算——即使里面贴了 ClickUp 链接。',
        '每周的数字按工单平均。同一张单在一周内多次进入队列，只算一张，取这几次首次响应的平均值，所以来回流转的单不会比只进一次的单占更多权重。一张单的几次进队列落在不同周时，每周只用当周的那几次计算，列表里另外标出它全部进队列的平均值；已结束的周，数字不会再变。',
        '单子挂起（SLA Hold，例如排期、等客户回复）期间不计时，与 Halo 自己的 SLA 一致；列表里会标出扣掉了多少。',
        '以下情况不计入，但会连同原因列出：转出时没留内部备注、PM 响应前已被他人转出、响应前已关闭（PM 自己关的，或 Halo 工单列表显示已被别人关闭）。仍在等待的工单，在得到响应前不计入任何平均值。',
      ],
    },
    prd: {
      name: '需求进研发',
      noun: () => '个需求',
      short: '工单首次进入队列，到 PM 在工单上贴出第一个 ClickUp PRD 链接为止。',
      notes: [
        '从工单第一次进入 PM 队列起算，而不是从最近一次退回起算，因此需求走过的完整路径——包括来回澄清——都计在内。按日历天（每天 24 小时）计，周末和假期都算。',
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
        'PM 把工单转给 Lucas（负责接收 bug 进研发）或 Development 部门的任何人，或 PM 本人贴出 ClickUp MB 链接——以先发生者为准——即停表。按日历天（每天 24 小时）计，周末和假期都算。',
        'Lucas 之后建的 MB 任务不作为停表点：复现和登记 bug 是研发的时间，不是 PM 的。',
        '与需求分开统计：bug 和需求的推进速度不同，混在一起的平均值哪个都描述不了。',
      ],
    },
  },
  rowSub: (tag: string, count: string, median: string, target: string) => `${tag} · ${count} · 中位数 ${median} · ${target}`,
  rowNone: (tag: string, target: string) => `${tag} · 该周无测量 · ${target}`,
  target: (benchmark: string) => `基准 ${benchmark}`,
  trendOnly: '仅看趋势',
  benchmarksTitle: (quarter: string) => `基准 · ${quarter}`,
  benchmarksFrom: (from: string, history: boolean) =>
    `取自 ${from} 的平均值，整个季度固定不变${history ? '；日志覆盖不到那个季度，取自 Halo 完整历史' : ''}。`,
  benchmarksLeftOut: (longWait: number, minWorkdays: number) => `不含等了 ${longWait} 天以上的单，也不含不足 ${minWorkdays} 个工作日的周。`,
  colMetric: '指标',
  colBenchmark: '基准',
  colSamples: '样本',
  tooFew: (n: number, min: number) => `仅看趋势：只有 ${n} 个样本，需要 ${min} 个`,
  benchmarkTitle: (name: string) => `${name} — 基准`,
  benchmarkIs: (from: string, n: number, noun: string) => `= 下表 ${from} 计入的 ${n} ${noun}的平均值`,
  byWeekHeading: (from: string) => `按周 · ${from}`,
  shortWeekOut: (min: number) => `该周不足 ${min} 个工作日——不计入`,
  samplesHeading: (n: number) => `计入 · ${n} 个`,
  colValue: '值',
  entriesNote: (n: number) => `${n} 次进队列取平均`,
  leftOutHeading: '列出但不计入',
  longWaitOut: (days: number, limit: number) => `等了 ${days} 天（超过 ${limit} 天）——计入当周，不计入基准`,
  noSamples: '没有样本。',
  quarter: (q: string) => `${q.slice(0, 4)} ${q.slice(5)}`,
  benchmarkFrom: (quarter: string, count: string, longWait: number, history: boolean) =>
    `基准：${quarter} 平均（${count}，不含等了 ${longWait} 天以上的单）${history ? '——日志覆盖不到，取自 Halo 完整历史' : ''}。`,
  trendWhy: (quarter: string, n: number, min: number) => `仅看趋势：${quarter} 只有 ${n} 个样本，基准至少需要 ${min} 个。`,
  noBenchmark: (quarter: string) => `仅看趋势：${quarter} 还没有基准。`,
  longWait: (days: number) => `等了 ${days} 天——计入本周，不计入季度基准`,
  awayWhy: (days: string, limit: number) => `中途连续离开队列 ${days} 天（超过 ${limit} 天）——不计入任何平均值`,
  colourHeading: '颜色规则',
  colourNotes: (r: { yellowFactor: number; minWorkdays: number; minSamples: number; longWaitDays: number; awayDays: number }) => [
    `本周数字 ≤ 基准为绿，≤ 基准 × ${r.yellowFactor} 为黄，超过为红；按页面显示的一位小数比较。`,
    `基准 = 上一季度的平均值，整个季度固定不变；一周按它的周一归属季度。不足 ${r.minWorkdays} 个工作日的周不进基准；基准至少需要 ${r.minSamples} 个样本，不够时只显示趋势。`,
    `等了 ${r.longWaitDays} 天以上的单照常计入当周，所以清理老单的那一周会显示出来；但不进基准，免得几张积压几个月的单把线拉高。`,
    `首次进队列之后，中途连续离开队列超过 ${r.awayDays} 天的需求，不计入任何平均值——那段时间不在 PM 手上。首次响应不受影响：单子一离开队列，它的计时就停了。`,
  ],
  countTickets: (tickets: number, responses: number) => `${tickets} 张单${responses > tickets ? `（${responses} 次响应）` : ''}`,
  countRows: (n: number) => `${n} 条`,
  waitingName: '等待首次响应',
  waitingSub: (hours: string) => `当前 · 最久已等 ${hours} 小时 · 回复前不计入任何平均值`,
  waitingNone: '当前 · 无等待',
  waitingSubAt: (week: string, hours: string) => `${week} 周末 · 最久已等 ${hours} 小时`,
  waitingNoneAt: (week: string) => `${week} 周末 · 无等待`,
  othersNote: (held: number) => (held ? ` · 另有 ${held} 张挂起中` : ''),
  asOfWeekEnd: (week: string) => `截至 ${week} 周末`,
  groupOnHold: (n: number) => `当时挂起中 — ${n} 张，不计入：排期或等客户回复`,
  laterNote: (week: string) => `用时只算到 ${week} 周末；"首次响应"和"方式"两栏是后来实际发生的情况。`,
  waitingBadge: (n: number) => `${n} 个等待中`,
  workingDays: (n: number) => `${n} 个工作日`,
  holidays: (n: number) => `${n} 天假期`,
  makeupDays: (n: number) => `${n} 天调休补班`,
  aside: (parts: string[]) => (parts.length ? `（${parts.join('、')}）` : ''),
  inProgress: (gone: string, total: string) => `进行中，已过 ${gone}/${total} 小时`,
  logStarts: (date: string) => `日志从 ${date} 开始，非整周`,
  complete: '已完结',
  reading: (label: string, count: string) => `${label} / 上一周 · ${count}`,
  median: (v: string) => `中位数 ${v}`,
  historyHeading: '周历史 — 点选某一周，查看对应工单',
  colWeek: '周',
  colAverage: '平均',
  colCounted: '计入',
  colChange: '环比',
  ticketsHeading: (label: string, counted: string, other: number) =>
    `工单 · ${label} — 计入 ${counted}${other > 0 ? `，未计入 ${other} 条` : ''}`,
  colTicketAvg: '本周计入',
  colTicketAvgHint: '这张单计入本周平均的值：等于用时；本周多次进队列时取平均。',
  allEntries: (n: number, hours: string) => `全部 ${n} 次 ${hours}`,
  avgOf: (parts: string[]) => `(${parts.join(' + ')}) ÷ ${parts.length}`,
  pm1TableNote: (label: string, avg: string) =>
    `${label} 的 ${avg} = 下表「本周计入」一列的平均值；用时按自然时间从进队列算起，晚上、周末、假期都算，挂起时间不算。`,
  nothingCounted: '该周没有计入的记录。',
  notCountedHeading: '落在该周、但未计入',
  howHeading: '口径',
  colTicket: '工单',
  colRequest: '请求',
  colArrived: '进队列时间 · 来源',
  colResponded: '首次响应时间',
  colLeft: '离开时间',
  colElapsed: '用时',
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
  closedInHalo: '响应前已在 Halo 关闭',
  heldNote: (hours: string) => `挂起 ${hours} h 不计`,
  notYet: '尚未响应',
  handedTo: (to: string) => `转给 ${to}`,
  notCounted: {
    'no-note': '转出时没有留内部备注',
    'taken-out': 'PM 响应前已被他人转出',
    closed: '响应前已关闭',
    'history-before-data': '工单创建早于日志起点——首次到达无记录',
    'no-arrival-on-record': '没有进入队列的记录',
  },
  source: '数据源：',
  logFrom: (date: string) => `日志起点 ${date}`,
  clock: (confirmed: boolean) => `自然时间（Asia/Shanghai）；中国节假日日历（${confirmed ? '已确认' : '待确认'}）只用来标出假期周`,
  asOfNow: '截至当前',
  waitingDescription:
    '所选那一周结束时（本周为当前），已在队列中、尚未回复客户也未转出的工单。显示到那时为止的自然时间（不含挂起）——回复前不计入任何平均值。挂起中的单列在下面，不计入数字。',
  nothingWaiting: '当前没有等待中的工单。',
  captureFailed: (at: string) => `最近一次从 Halo 刷新失败；当前显示的是截至 ${at} 的日志。`,
  gaps: (n: number, list: string) => `日志有 ${n} 处缺口（${list}）。其中的 action 在复制前已从 Halo 过期，涉及的周数据不完整。`,
  firstCapture: '首次采集中——正在读取 Halo Actions 最近 14 天的数据，约需一两分钟，页面会自动更新。',
  emptyLog: '日志里还没有事件。',
  refreshing: '正在从 Halo 刷新… ',
  captured: (at: string, source: string) => `采集于 ${at}（${source}）。`,
  legend: (dayHours: number, from: string) =>
    `全部按自然时间：h = 小时，d = 日历天（每天 ${dayHours} 小时）。Halo 只保留 14 天的 action，因此会复制到日志中，日志起点 ${from}。`,
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

function inUnit(hours: number | null, unit: Unit, dayHours: number): number | null {
  if (hours === null) return null
  return round1(unit === 'h' ? hours : hours / dayHours)
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
  const dayHours = data.calendar.dayHours
  const week = data.weeks[index]
  const prev = data.weeks[index + 1]
  const stat = week?.[metric]
  const value = stat && stat.n > 0 ? inUnit(stat.meanHours, unit, dayHours) : null
  const previous = prev && prev[metric].n > 0 ? inUnit(prev[metric].meanHours, unit, dayHours) : null
  const history = data.weeks
    .slice(index)
    .filter((w) => w[metric].n > 0)
    .map((w) => ({ week: w.label, value: inUnit(w[metric].meanHours, unit, dayHours) as number }))
    .reverse()
  // Judged on the server against the week's quarter benchmark, at the one decimal shown here.
  const benchmark = week ? data.benchmarks.find((b) => b.quarter === week.quarter) : undefined
  const line = benchmark?.lines[metric]
  const row: ScorecardRow = {
    id: metric,
    name: metric,
    owner: data.pm,
    group: 'support',
    kind: 'computed',
    compare: 'lte',
    value,
    previous,
    status: week?.light[metric] ?? 'display',
    target: line?.green ?? null,
    targetText: '',
    history,
  }
  return { unit, stat, row, benchmark, line, median: stat && stat.n > 0 ? inUnit(stat.medianHours, unit, dayHours) : null }
}

/** "benchmark 7.7 h", or "trend only" when the quarter has no usable benchmark for this number. */
function targetText(t: Copy, line: BenchmarkLine | undefined, unit: Unit): string {
  return line?.green != null ? t.target(show(line.green, unit)) : t.trendOnly
}

/**
 * The three bands as ranges of the shown value. Values compare at one decimal, so yellow starts one
 * tenth above the benchmark: "≤ 7.7 h", "7.8–9.6 h", "> 9.6 h".
 */
function ranges(line: BenchmarkLine, unit: Unit): Record<'green' | 'yellow' | 'red', string> | null {
  if (line.green === null || line.yellow === null) return null
  const from = round1(line.green + 0.1)
  return {
    green: `≤ ${show(line.green, unit)}`,
    yellow: line.yellow >= from ? `${from.toFixed(1)}–${show(line.yellow, unit)}` : '—',
    red: `> ${show(line.yellow, unit)}`,
  }
}

/** Calendar days between two instants, for "waited 230 days". */
const daysBetween = (from: string, to: string | null) => Math.round(((to ? Date.parse(to) : Date.now()) - Date.parse(from)) / 86_400_000)

/** "11 tickets (12 responses)" for PM1, whose average is over tickets; "1 requirement" for the rest. */
function countText(t: Copy, metric: Metric, n: number, responses: number): string {
  return metric === 'response' ? t.countTickets(n, responses) : `${n} ${t.metrics[metric].noun(n)}`
}

/** A ticket's entries together: tickets newest first by their latest entry, entries oldest first within. */
function groupByTicket(rows: ResponseRow[]): ResponseRow[] {
  const groups = new Map<string, ResponseRow[]>()
  for (const r of rows) groups.set(r.ticket, [...(groups.get(r.ticket) ?? []), r])
  const at = (r: ResponseRow) => Date.parse(r.endedAt ?? r.arrivedAt)
  const latest = (rs: ResponseRow[]) => Math.max(...rs.map(at))
  return [...groups.values()].sort((a, b) => latest(b) - latest(a)).flatMap((rs) => [...rs].sort((a, b) => at(a) - at(b)))
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
      return r.action === 'Ticket closed' ? t.closedInHalo : t.closedEarly(r.action ?? '')
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
        status === 'red'
          ? 'border-l-danger-500 bg-danger-500/[0.04] hover:bg-danger-500/[0.08]'
          : status === 'yellow'
            ? 'border-l-warning-500 bg-warning-500/[0.04] hover:bg-warning-500/[0.08]'
            : 'border-l-transparent',
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

/**
 * First-response rows. Given `units` (the PM1 counted list), a ticket's entries sit together and one
 * merged cell carries the ticket's average: the value the week's number is averaged over, so the
 * list adds up to the number at the top.
 */
function ResponseRows({ rows, reason, units, t }: { rows: ResponseRow[]; reason?: boolean; units?: Map<string, TicketWeek>; t: Copy }) {
  const ordered = units ? groupByTicket(rows) : rows
  return (
    <Table className="text-xs">
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">{t.colTicket}</TableHead>
          <TableHead>{t.colRequest}</TableHead>
          <TableHead className="w-36">{t.colArrived}</TableHead>
          <TableHead className="w-24">{reason ? t.colLeft : t.colResponded}</TableHead>
          {!reason && <TableHead className="w-16 text-right">{t.colElapsed}</TableHead>}
          {units && (
            <TableHead className="w-24 text-right" title={t.colTicketAvgHint}>
              {t.colTicketAvg}
            </TableHead>
          )}
          <TableHead className="w-40">{reason ? t.colWhy : t.colHow}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ordered.map((r, i) => {
          const unit = units?.get(r.ticket)
          const opensGroup = i === 0 || ordered[i - 1].ticket !== r.ticket
          const span = ordered.filter((x) => x.ticket === r.ticket).length
          return (
            <TableRow key={`${r.ticket}-${r.arrivedAt}`}>
              <TableCell className="align-top tabular-nums text-muted-foreground">#{r.ticket}</TableCell>
              <Request summary={r.summary} client={r.client} />
              <TableCell className="whitespace-normal align-top">
                <div className="tabular-nums">{local(r.arrivedAt)}</div>
                <div className="text-[11px] text-muted-foreground">{r.arrivedFrom ?? t.unknown}</div>
              </TableCell>
              <TableCell className="align-top tabular-nums">{local(r.endedAt)}</TableCell>
              {!reason && (
                <TableCell className="text-right align-top tabular-nums">
                  {r.hours === null ? '—' : `${r.hours.toFixed(1)} h`}
                  {r.heldHours >= 0.05 && <div className="text-[11px] text-muted-foreground">{t.heldNote(r.heldHours.toFixed(1))}</div>}
                </TableCell>
              )}
              {units && opensGroup && (
                <TableCell rowSpan={span} className="border-l text-right align-top font-medium tabular-nums">
                  {unit ? `${unit.meanHours.toFixed(1)} h` : '—'}
                  {unit && unit.entries > 1 && (
                    <div className="text-[11px] font-normal text-muted-foreground">
                      {t.avgOf(ordered.filter((x) => x.ticket === r.ticket).map((x) => (x.hours ?? 0).toFixed(1)))}
                    </div>
                  )}
                  {unit && unit.allEntries > unit.entries && (
                    <div className="text-[11px] font-normal text-muted-foreground">
                      {t.allEntries(unit.allEntries, `${unit.allMeanHours.toFixed(1)} h`)}
                    </div>
                  )}
                </TableCell>
              )}
              <TableCell className="whitespace-normal align-top text-muted-foreground">
                {reason ? `${t.notCounted[r.outcome] ?? r.outcome} · ${howText(r, t)}` : howText(r, t)}
                {r.longWait && <div className="mt-0.5 text-[11px] text-warning-700">{t.longWait(daysBetween(r.arrivedAt, r.endedAt))}</div>}
              </TableCell>
            </TableRow>
          )
        })}
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

function EntryRows({
  rows,
  dayHours,
  awayLimit,
  reason,
  t,
}: {
  rows: EntryRow[]
  dayHours: number
  awayLimit: number
  reason?: boolean
  t: Copy
}) {
  return (
    <Table className="text-xs">
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">{t.colTicket}</TableHead>
          <TableHead>{t.colRequest}</TableHead>
          <TableHead className="w-24">{t.colFirstArrival}</TableHead>
          <TableHead className="w-24">{t.colStopped}</TableHead>
          {!reason && <TableHead className="w-16 text-right">{t.colElapsed}</TableHead>}
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
                {r.hours === null ? '—' : `${(r.hours / dayHours).toFixed(1)} d`}
                {r.hours !== null && <div className="text-[11px] text-muted-foreground">{r.hours.toFixed(1)} h</div>}
              </TableCell>
            )}
            <TableCell className="whitespace-normal align-top">
              {reason && (
                <div className="text-muted-foreground">
                  {r.status === 'away' ? t.awayWhy(String(r.awayDays ?? '—'), awayLimit) : (t.notCounted[r.status] ?? r.status)}
                </div>
              )}
              <RefLink row={r} t={t} />
              {r.longWait && r.arrivedAt && (
                <div className="mt-0.5 text-[11px] text-warning-700">{t.longWait(daysBetween(r.arrivedAt, r.at))}</div>
              )}
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
        <span>{t.clock(data.calendar.status === 'confirmed')}</span>
      </div>
    </>
  )
}

/**
 * The week's colour bands and where they come from — or why the number is a trend only. Bounds are
 * the server's, already at the shown decimal, so a value on the page and its colour always agree.
 */
function Bands({
  data,
  quarter,
  benchmark,
  metric,
  unit,
  t,
}: {
  data: SupportUpdatesPayload
  quarter: string
  benchmark: Benchmark | undefined
  metric: Metric
  unit: Unit
  t: Copy
}) {
  const line = benchmark?.lines[metric]
  if (!benchmark || !line) return <p className="text-[11px] text-muted-foreground">{t.noBenchmark(t.quarter(quarter))}</p>
  const from = t.quarter(benchmark.from)
  if (line.green === null || line.yellow === null) {
    return <p className="text-[11px] text-muted-foreground">{t.trendWhy(from, line.n, data.rules.minSamples)}</p>
  }
  const r = ranges(line, unit) as Record<'green' | 'yellow' | 'red', string>
  const bands: [Light, string][] = [
    ['green', r.green],
    ['yellow', r.yellow],
    ['red', r.red],
  ]
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {bands.map(([status, bound]) => (
          <span key={status} className="inline-flex items-center gap-1.5">
            <StatusChip status={status} />
            <span className="font-mono text-xs tabular-nums">{bound}</span>
          </span>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground">
        {t.benchmarkFrom(from, `${line.n} ${t.metrics[metric].noun(line.n)}`, data.rules.longWaitDays, benchmark.source === 'history')}
      </p>
    </div>
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
  const dayHours = data.calendar.dayHours
  const { unit, stat, row, median, benchmark } = reading(data, metric, index)
  const week = data.weeks[index]
  const { counted: rows, other } = week ? rowsFor(data, metric, week.monday) : { counted: [], other: [] }
  // PM1 averages over tickets: each ticket's mean of its entries this week (server-computed).
  const units =
    metric === 'response' && week
      ? new Map(data.responseTickets.filter((u) => u.week === week.monday).map((u) => [u.ticket, u]))
      : undefined
  // History newest first, each with its change against the week before it.
  const history = data.weeks.map((w, i) => {
    const v = w[metric].n > 0 ? inUnit(w[metric].meanHours, unit, dayHours) : null
    const next = data.weeks[i + 1]
    const before = next && next[metric].n > 0 ? inUnit(next[metric].meanHours, unit, dayHours) : null
    return { i, w, v, diff: v !== null && before !== null ? round1(v - before) : null }
  })
  const n = stat?.n ?? 0

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent container={root()} className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <StatusChip status={row.status} />
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
              {t.reading(week?.label ?? '', countText(t, metric, n, week?.responseEntries ?? n))}
              {median !== null ? ` · ${t.median(show(median, unit))}` : ''}
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span
                className={cn(
                  'text-3xl font-semibold leading-none tracking-tight tabular-nums',
                  row.status === 'red' && 'text-danger-700',
                  row.status === 'green' && 'text-success-700',
                )}
              >
                {show(row.value, unit)}
              </span>
              <span className="font-mono text-sm tabular-nums text-muted-foreground">{show(row.previous, unit)}</span>
              <Delta row={row} />
            </div>
          </div>
          <Sparkline row={row} width={150} height={44} />
        </div>
        {week && <Bands data={data} quarter={week.quarter} benchmark={benchmark} metric={metric} unit={unit} t={t} />}

        <div>
          <Heading>{t.historyHeading}</Heading>
          <div className="max-h-44 overflow-y-auto rounded-md border">
            <Table className="text-xs tabular-nums">
              <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur">
                <TableRow>
                  <TableHead className="h-8 w-6 px-0" />
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
                    <TableCell className="px-0 py-1.5">
                      <span className={cn('mx-auto block h-2 w-2 rounded-full', STATUS_META[w.light[metric]].dot)} />
                    </TableCell>
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
          <Heading>
            {t.ticketsHeading(
              week?.label ?? '',
              metric === 'response' ? t.countTickets(units?.size ?? 0, rows.length) : t.countRows(rows.length),
              other.length,
            )}
          </Heading>
          {rows.length === 0 ? (
            <p className="text-xs italic text-muted-foreground">{t.nothingCounted}</p>
          ) : metric === 'response' ? (
            <>
              <p className="text-[11px] text-muted-foreground">{t.pm1TableNote(week?.label ?? '', show(row.value, unit))}</p>
              <ResponseRows rows={rows as ResponseRow[]} units={units} t={t} />
            </>
          ) : (
            <EntryRows rows={rows as EntryRow[]} dayHours={dayHours} awayLimit={data.rules.awayDays} t={t} />
          )}
          {other.length > 0 && (
            <div className="rounded-md border border-dashed p-2">
              <div className="mb-1 text-[11px] text-muted-foreground">{t.notCountedHeading}</div>
              {metric === 'response' ? (
                <ResponseRows rows={other as ResponseRow[]} reason t={t} />
              ) : (
                <EntryRows rows={other as EntryRow[]} dayHours={dayHours} awayLimit={data.rules.awayDays} reason t={t} />
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

        <div>
          <Heading>{t.colourHeading}</Heading>
          <div className="space-y-1.5">
            {t.colourNotes(data.rules).map((note) => (
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

function WaitingDialog({ data, index, onClose }: { data: SupportUpdatesPayload; index: number; onClose: () => void }) {
  const t = T[useLang()]
  const week: WeekRow | undefined = data.weeks[index]
  const live = !week || week.partial === 'in-progress'
  // Each entry aged to the week's end. For a past week its cycle keeps what happened afterwards, so
  // the list says when it was answered; the working time is still the time up to the week's end.
  const rowsOf = (state: string) =>
    (week?.waiting ?? [])
      .filter((w) => w.state === state)
      .flatMap((w) => {
        const base = data.response.find((r) => r.ticket === w.ticket && r.arrivedAt === w.arrivedAt)
        return base ? [{ ...base, hours: w.hours, heldHours: w.heldHours, longWait: false }] : []
      })
  const rows = rowsOf('waiting')
  const held = rowsOf('on-hold')
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent container={root()} className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <StatusChip status={rows.length ? 'yellow' : 'green'} />
            <span className="text-[11px] text-muted-foreground">
              {live ? t.asOfNow : t.asOfWeekEnd(week?.label ?? '')} · {data.pm}
            </span>
          </div>
          <DialogTitle className="text-base leading-snug">{t.waitingName}</DialogTitle>
          <DialogDescription className="text-xs">{t.waitingDescription}</DialogDescription>
        </DialogHeader>
        {!live && <p className="text-[11px] text-muted-foreground">{t.laterNote(week?.label ?? '')}</p>}
        {rows.length === 0 ? (
          <p className="text-xs italic text-muted-foreground">{t.nothingWaiting}</p>
        ) : (
          <ResponseRows rows={rows} t={t} />
        )}
        {[[held, t.groupOnHold(held.length)] as const].map(([group, heading]) =>
          group.length > 0 ? (
            <div key={heading} className="rounded-md border border-dashed p-2">
              <div className="mb-1 text-[11px] text-muted-foreground">{heading}</div>
              <ResponseRows rows={group} t={t} />
            </div>
          ) : null,
        )}
        <Source data={data} t={t} />
      </DialogContent>
    </Dialog>
  )
}

/* ── page ── */

/** "07-06 – 07-12" for a Monday, as the server labels weeks. */
function weekSpan(monday: string): string {
  const sunday = new Date(Date.parse(`${monday}T00:00:00Z`) + 6 * 86_400_000).toISOString().slice(0, 10)
  return `${monday.slice(5)} – ${sunday.slice(5)}`
}

/** A sample's value in the number's unit, with the hours beside a day value. */
function SampleValue({ hours, unit, dayHours }: { hours: number; unit: Unit; dayHours: number }) {
  return (
    <>
      {show(inUnit(hours, unit, dayHours), unit)}
      {unit === 'd' && <div className="text-[11px] text-muted-foreground">{hours.toFixed(1)} h</div>}
    </>
  )
}

function SampleTable({
  rows,
  unit,
  dayHours,
  why,
  t,
}: {
  rows: Sample[]
  unit: Unit
  dayHours: number
  why?: (x: Sample) => string
  t: Copy
}) {
  return (
    <Table className="text-xs tabular-nums">
      <TableHeader>
        <TableRow>
          <TableHead className="w-20">{t.colTicket}</TableHead>
          <TableHead className="w-32">{t.colWeek}</TableHead>
          <TableHead className="w-20 text-right">{t.colValue}</TableHead>
          <TableHead>{why ? t.colWhy : ''}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((x) => (
          <TableRow key={`${x.ticket}-${x.week}-${x.hours}`}>
            <TableCell className="align-top text-muted-foreground">#{x.ticket}</TableCell>
            <TableCell className="align-top">{weekSpan(x.week)}</TableCell>
            <TableCell className="text-right align-top">
              <SampleValue hours={x.hours} unit={unit} dayHours={dayHours} />
            </TableCell>
            <TableCell className="whitespace-normal align-top text-muted-foreground">
              {why ? why(x) : x.entries && x.entries > 1 ? t.entriesNote(x.entries) : ''}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

/**
 * One benchmark, drilled into: the value, its bands, the baseline quarter week by week, and every
 * sample — the counted ones, which average to the benchmark, and the ones listed but left out, with why.
 */
function BenchmarkDialog({
  data,
  benchmark,
  metric,
  onClose,
}: {
  data: SupportUpdatesPayload
  benchmark: Benchmark
  metric: Metric
  onClose: () => void
}) {
  const t = T[useLang()]
  const spec = METRICS.find((m) => m.id === metric) ?? METRICS[0]
  const dayHours = data.calendar.dayHours
  const line = benchmark.lines[metric]
  const from = t.quarter(benchmark.from)
  const all = benchmark.samples.filter((x) => x.metric === metric)
  const counted = all.filter((x) => !x.out)
  const left = all.filter((x) => x.out)
  const weeks = [...new Set(all.map((x) => x.week))].sort().map((week) => {
    const inWeek = counted.filter((x) => x.week === week)
    const avg = inWeek.length ? inWeek.reduce((a, x) => a + x.hours, 0) / inWeek.length : null
    return {
      week,
      n: inWeek.length,
      value: inUnit(avg, spec.unit, dayHours),
      short: all.some((x) => x.week === week && x.out === 'short-week'),
    }
  })
  const why = (x: Sample) =>
    x.out === 'long-wait' ? t.longWaitOut(x.waitedDays ?? 0, data.rules.longWaitDays) : t.shortWeekOut(data.rules.minWorkdays)

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent container={root()} className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <span className="text-[11px] text-muted-foreground">
            {spec.tag} · {t.benchmarksTitle(t.quarter(benchmark.quarter))}
          </span>
          <DialogTitle className="text-base leading-snug">{t.benchmarkTitle(t.metrics[metric].name)}</DialogTitle>
          <DialogDescription className="text-xs">
            {t.benchmarksFrom(from, benchmark.source === 'history')} {t.benchmarksLeftOut(data.rules.longWaitDays, data.rules.minWorkdays)}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/30 px-4 py-3">
          {line.green !== null ? (
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-3xl font-semibold leading-none tracking-tight tabular-nums">{show(line.green, spec.unit)}</span>
              <span className="text-xs text-muted-foreground">{t.benchmarkIs(from, line.n, t.metrics[metric].noun(line.n))}</span>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">{t.tooFew(line.n, data.rules.minSamples)}</p>
          )}
        </div>
        <Bands data={data} quarter={benchmark.quarter} benchmark={benchmark} metric={metric} unit={spec.unit} t={t} />

        <div>
          <Heading>{t.byWeekHeading(from)}</Heading>
          <div className="max-h-44 overflow-y-auto rounded-md border">
            <Table className="text-xs tabular-nums">
              <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur">
                <TableRow>
                  <TableHead className="h-8 px-3">{t.colWeek}</TableHead>
                  <TableHead className="h-8 px-3 text-right">{t.colAverage}</TableHead>
                  <TableHead className="h-8 px-3 text-right">{t.colCounted}</TableHead>
                  <TableHead className="h-8 px-3" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {weeks.map((w) => (
                  <TableRow key={w.week}>
                    <TableCell className="px-3 py-1.5">{weekSpan(w.week)}</TableCell>
                    <TableCell className="px-3 py-1.5 text-right">{show(w.value, spec.unit)}</TableCell>
                    <TableCell className="px-3 py-1.5 text-right text-muted-foreground">{w.n}</TableCell>
                    <TableCell className="px-3 py-1.5 text-muted-foreground">
                      {w.short ? t.shortWeekOut(data.rules.minWorkdays) : ''}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="space-y-2">
          <Heading>{t.samplesHeading(counted.length)}</Heading>
          {counted.length === 0 ? (
            <p className="text-xs italic text-muted-foreground">{t.noSamples}</p>
          ) : (
            <SampleTable rows={counted} unit={spec.unit} dayHours={dayHours} t={t} />
          )}
          {left.length > 0 && (
            <div className="rounded-md border border-dashed p-2">
              <div className="mb-1 text-[11px] text-muted-foreground">{t.leftOutHeading}</div>
              <SampleTable rows={left} unit={spec.unit} dayHours={dayHours} why={why} t={t} />
            </div>
          )}
        </div>

        <Source data={data} t={t} />
      </DialogContent>
    </Dialog>
  )
}

/** Every number's benchmark for the selected week's quarter, written out: the value and its three bands. */
function BenchmarkCard({ data, index, onOpen }: { data: SupportUpdatesPayload; index: number; onOpen: (m: Metric) => void }) {
  const t = T[useLang()]
  const week: WeekRow | undefined = data.weeks[index]
  const benchmark = week ? data.benchmarks.find((b) => b.quarter === week.quarter) : undefined
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t.benchmarksTitle(week ? t.quarter(week.quarter) : '')}</CardTitle>
        <CardDescription className="text-xs">
          {benchmark
            ? `${t.benchmarksFrom(t.quarter(benchmark.from), benchmark.source === 'history')} ${t.benchmarksLeftOut(data.rules.longWaitDays, data.rules.minWorkdays)}`
            : t.noBenchmark(week ? t.quarter(week.quarter) : '')}
        </CardDescription>
      </CardHeader>
      {benchmark && (
        <CardContent>
          <Table className="text-xs tabular-nums">
            <TableHeader>
              <TableRow>
                <TableHead className="h-8 px-2">{t.colMetric}</TableHead>
                <TableHead className="h-8 px-2 text-right">{t.colBenchmark}</TableHead>
                <TableHead className="h-8 px-2 text-right">
                  <StatusChip status="green" />
                </TableHead>
                <TableHead className="h-8 px-2 text-right">
                  <StatusChip status="yellow" />
                </TableHead>
                <TableHead className="h-8 px-2 text-right">
                  <StatusChip status="red" />
                </TableHead>
                <TableHead className="h-8 px-2 text-right">{t.colSamples}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {METRICS.map((m) => {
                const line = benchmark.lines[m.id]
                const r = ranges(line, m.unit)
                return (
                  <TableRow key={m.id} onClick={() => onOpen(m.id)} className="cursor-pointer hover:bg-muted/40">
                    <TableCell className="px-2 py-1.5">
                      <span className="text-muted-foreground">{m.tag}</span> {t.metrics[m.id].name}
                    </TableCell>
                    {r && line.green !== null ? (
                      <>
                        <TableCell className="px-2 py-1.5 text-right font-mono font-semibold">{show(line.green, m.unit)}</TableCell>
                        <TableCell className="px-2 py-1.5 text-right font-mono">{r.green}</TableCell>
                        <TableCell className="px-2 py-1.5 text-right font-mono">{r.yellow}</TableCell>
                        <TableCell className="px-2 py-1.5 text-right font-mono">{r.red}</TableCell>
                      </>
                    ) : (
                      <TableCell colSpan={4} className="px-2 py-1.5 text-right text-muted-foreground">
                        {t.tooFew(line.n, data.rules.minSamples)}
                      </TableCell>
                    )}
                    <TableCell className="px-2 py-1.5 text-right text-muted-foreground">
                      {line.n} {t.metrics[m.id].noun(line.n)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      )}
    </Card>
  )
}

function OwnerCard({ data, index, onOpen }: { data: SupportUpdatesPayload; index: number; onOpen: (m: Metric | 'waiting') => void }) {
  const t = T[useLang()]
  const week: WeekRow | undefined = data.weeks[index]
  // Waiting on the PM as the selected week ended (now, for the week in progress): the clock running,
  // not on hold. Tickets on hold or not yet due are mentioned, not counted.
  const all = week?.waiting ?? []
  const open = all.filter((w) => w.state === 'waiting')
  const oldest = open.reduce((m, w) => Math.max(m, w.hours), 0)
  const live = !week || week.partial === 'in-progress'
  const others = t.othersNote(all.filter((w) => w.state === 'on-hold').length)
  const waitingSub = `${
    open.length > 0
      ? live
        ? t.waitingSub(oldest.toFixed(1))
        : t.waitingSubAt(week?.label ?? '', oldest.toFixed(1))
      : live
        ? t.waitingNone
        : t.waitingNoneAt(week?.label ?? '')
  }${others}`
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
          const { row, stat, median, unit, line } = reading(data, m.id, index)
          const n = stat?.n ?? 0
          const copy = t.metrics[m.id]
          const target = targetText(t, line, unit)
          return (
            <Line
              key={m.id}
              status={row.status}
              name={copy.name}
              sub={
                n > 0
                  ? t.rowSub(m.tag, countText(t, m.id, n, week?.responseEntries ?? n), show(median, unit), target)
                  : t.rowNone(m.tag, target)
              }
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
          sub={waitingSub}
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
  const [openBenchmark, setOpenBenchmark] = useState<{ quarter: string; metric: Metric } | null>(null)

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
            <BenchmarkCard
              data={data}
              index={index}
              onOpen={(metric) => {
                const quarter = data.weeks[index]?.quarter
                if (quarter) setOpenBenchmark({ quarter, metric })
              }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
            <span>
              {cap?.inFlight ? t.refreshing : cap?.lastAt ? t.captured(local(cap.lastAt), cap.source ?? '') : ''}
              {t.legend(data.calendar.dayHours, local(data.coverageFrom))}
            </span>
            <ImportButton onDone={reload} />
          </div>
          {open === 'waiting' && <WaitingDialog data={data} index={index} onClose={() => setOpen(null)} />}
          {openBenchmark &&
            (() => {
              const benchmark = data.benchmarks.find((b) => b.quarter === openBenchmark.quarter)
              return benchmark ? (
                <BenchmarkDialog data={data} benchmark={benchmark} metric={openBenchmark.metric} onClose={() => setOpenBenchmark(null)} />
              ) : null
            })()}
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
