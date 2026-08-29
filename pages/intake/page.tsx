// AI Ticket Intake — client engagement.
//
// The report side of the Intake product card: who is actually using it, how far along they are, and
// which follow-up is overdue. Reached from the top-right link on the Intake card in Product Cards,
// and from the sidebar.
//
// Structure follows the published report it came from: a masthead and headline tiles that are always
// visible, then collapsible sections whose summary lines carry enough ("14 clients · 2.6 met per
// week") to decide whether to open them. Everything starts closed, as it does there — the page is a
// filing cabinet you go into for one answer, not a wall to scroll.
//
// Read from a dated snapshot, not a live dataset (service/lib/intake.ts explains why). The snapshot
// date sits above the fold for that reason — the failure mode worth designing against is a stale
// picture that looks live.

import { useMemo, useState } from "react";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Separator,
  Skeleton,
  cn,
  root,
} from "@mspbots/ui";
import {
  AlertTriangle,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Mail,
  MessageSquare,
  RefreshCw,
  Users,
} from "lucide-react";
// The runtime mounts the app in a BrowserRouter whose basename is BASE_URL, so a router Link is what
// keeps `/products` correct both on localhost and under /apps/product-scorecards/.
import { Link } from "react-router-dom";
import { LangToggle, StatTile } from "../../lib/board";
import { useLang } from "../../lib/i18n";
import { STAGE_TONE, STATE_CELL, useIntake, type IntakeReport } from "../../lib/intake-client";

// Deliberately absent from the sidebar (`menu: false`): this is the Intake card's report, not a
// top-level view, and it is reached from that card. The route and `label` still exist — `label` is
// what fills the browser tab and the breadcrumb once you are here.
export const meta = {
  label: "Client Engagement",
  icon: "Handshake",
  menu: false,
  description: "AI Ticket Intake — who is actually using it, how far along they are, and what is overdue.",
};

type Client = IntakeReport["tracks"][number]["clients"][number];

const T = {
  en: {
    title: "Client engagement — AI Ticket Intake",
    subtitle: "Who is actually using it, and how far along they are. The evidence behind the Intake scorecard rows.",
    backToCards: "Product Cards",
    refresh: "Refresh",
    expandAll: "Expand all",
    collapseAll: "Collapse all",
    asOf: (d: string) => `as of ${d}`,
    window: (a: string, b: string) => `${a} — ${b} · UTC`,
    snapshot: "Curated snapshot",
    snapshotWhy:
      "The pipeline rung is assigned by hand from meeting notes and email — there is no dataset that knows it. Numbers below are frozen at the snapshot date, not live.",
    stale: (n: number) =>
      `This snapshot is ${n} days old. Re-run scripts/build-intake-snapshot.mjs before quoting it at the L10.`,
    source: "Source",
    avgProgress: "Average progress",
    avgHint: "live deals only — lost excluded",
    deep: "At self-test or beyond",
    deepHint: "doing real work in the product",
    lost: "Closed Lost",
    lostHint: "explicitly declined",
    inProd: "In production",
    inProdHint: "taking real caller traffic",

    secRoles: "Follow-ups by role",
    secRolesMeta: (n: number, who: string) => `${n} items · ${who}`,
    secLadder: "The pipeline ladder",
    secLadderMeta: (n: number) => `${n} rungs · defined by real usage`,
    secTrackMeta: (n: number, avg: string) => `${n} clients · ${avg} met per week`,
    secLost: (n: number) => `Closed Lost · ${n}`,
    secLostMeta: (mail: number, call: number) => `${mail} by email · ${call} on a call`,
    secMethod: "Sources, method & open questions",
    secMethodMeta: (s: number, n: number, q: number) => `${s} sources · ${n} stated limits · ${q} open questions`,

    ladderSub: "Rungs are defined by real usage behaviour, not by sales stage.",
    heldRate: (h: number, p: number, r: string) => `${h} of ${p} scheduled sessions held · ${r}%`,
    reach: (avg: string) => `${avg} clients met per week`,
    reachHint: (weeks: number, peak: number, zero: number) =>
      `averaged over the ${weeks} weeks that have elapsed · best week ${peak} · ${zero} weeks with nobody`,
    missingInvites: (n: number) => `${n} invites never sent`,
    noMeetings: "No sessions inside the window.",
    clientHint: "Click any client for the evidence behind its rung.",
    clientDetail: "Why this rung",
    nextAction: "Next action",
    cadence: "Cadence",
    lostReason: "Why it was lost",
    rejection: "How they said no",
    lostSub: "Every lost deal carries its rejection channel and the customer's own words.",
    lastMet: (d: string, n: number) => `last met ${d} · ${n} days ago`,
    neverMet: "never met",
    sessions: (h: number, p: number) => `${h}/${p} held`,
    sessionsHeld: "Sessions held",
    why: "Why",
    doThis: "Do this",
    upstream: "Upstream files",
    caveats: "Method & caveats",
    questions: "Open questions",
    notInV1: "Not in this view yet",
    notInV1Body:
      "The per-client ticket table and the 'was the client told?' column need tickets.json from the ATI docs repo, which this snapshot does not carry. Ask before wiring it in — it roughly triples the payload.",
  },
  zh: {
    title: "客户互动 — AI Ticket Intake",
    subtitle: "谁在真用，谁走到了哪一步。Intake 记分卡行背后的证据。",
    backToCards: "产品卡片",
    refresh: "刷新",
    expandAll: "全部展开",
    collapseAll: "全部收起",
    asOf: (d: string) => `截至 ${d}`,
    window: (a: string, b: string) => `${a} — ${b} · UTC`,
    snapshot: "人工快照",
    snapshotWhy:
      "阶段是按会议纪要和邮件人工判定的——没有任何数据集知道这个值。下面的数字冻结在快照日期，不是实时数据。",
    stale: (n: number) => `这份快照已经 ${n} 天了。在 L10 上引用之前请重跑 scripts/build-intake-snapshot.mjs。`,
    source: "来源",
    avgProgress: "平均进度",
    avgHint: "仅在跑的商机——已剔除失败",
    deep: "到自测及以上",
    deepHint: "已在产品里做真实工作",
    lost: "商机失败",
    lostHint: "已明确拒绝",
    inProd: "进入生产",
    inProdHint: "已接入真实来电",

    secRoles: "按角色的跟进清单",
    secRolesMeta: (n: number, who: string) => `${n} 项 · ${who}`,
    secLadder: "商机阶梯",
    secLadderMeta: (n: number) => `${n} 档 · 按真实使用行为定义`,
    secTrackMeta: (n: number, avg: string) => `${n} 家 · 平均每周见 ${avg} 家`,
    secLost: (n: number) => `商机失败 · ${n} 家`,
    secLostMeta: (mail: number, call: number) => `${mail} 家邮件拒绝 · ${call} 家会议拒绝`,
    secMethod: "数据来源、口径与存疑",
    secMethodMeta: (s: number, n: number, q: number) => `${s} 个数据源 · ${n} 条口径限制 · ${q} 条存疑`,

    ladderSub: "阶段按真实使用行为定义，不按销售阶段。",
    heldRate: (h: number, p: number, r: string) => `已排 ${p} 场，开了 ${h} 场 · ${r}%`,
    reach: (avg: string) => `平均每周见 ${avg} 家`,
    reachHint: (weeks: number, peak: number, zero: number) =>
      `分母是已经过去的 ${weeks} 周 · 最多的一周 ${peak} 家 · ${zero} 周没见任何人`,
    missingInvites: (n: number) => `${n} 场应排未排`,
    noMeetings: "窗口内没有场次。",
    clientHint: "点任意客户可以看到该档位的判定证据。",
    clientDetail: "凭什么判到这一档",
    nextAction: "下一步",
    cadence: "节奏",
    lostReason: "失败原因",
    rejection: "怎么拒绝的",
    lostSub: "每一条商机失败都标了拒绝渠道和客户原话。",
    lastMet: (d: string, n: number) => `最近一次 ${d} · ${n} 天前`,
    neverMet: "从未见过",
    sessions: (h: number, p: number) => `已开 ${h}/${p}`,
    sessionsHeld: "已开场次",
    why: "为什么",
    doThis: "要做什么",
    upstream: "上游文件",
    caveats: "口径与说明",
    questions: "存疑问题",
    notInV1: "这一版还没有的部分",
    notInV1Body:
      "逐客户的工单表和「已回告客户?」那一列需要 ATI 文档仓库里的 tickets.json，这份快照没有带。要接之前先说一声——payload 大约会变成三倍。",
  },
};

/** Priority → badge treatment. Keyed on the Chinese value, which is the stable one upstream. */
const PRIORITY_TONE: Record<string, string> = {
  急: "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400",
  P0: "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400",
  超时: "border-red-500/40 bg-red-500/[0.07] text-red-700 dark:text-red-400",
  风险: "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  回告: "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  定价: "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  P1: "border-amber-500/40 bg-amber-500/[0.07] text-amber-700 dark:text-amber-400",
};

const MONTH_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Month bands over the week columns, so 19 undated squares stay readable. */
function monthBands(weeks: string[], lang: "en" | "zh"): { label: string; span: number }[] {
  const out: { label: string; span: number }[] = [];
  for (const week of weeks) {
    const month = Number(week.slice(5, 7));
    const label = lang === "zh" ? `${month} 月` : MONTH_EN[month - 1];
    const last = out[out.length - 1];
    if (last && last.label === label) last.span++;
    else out.push({ label, span: 1 });
  }
  return out;
}

/* ── collapsible section ── */

/**
 * Fully controlled `<details>`: `open` comes from page state and the summary's default toggle is
 * suppressed, so "expand all" and a click on one header cannot disagree about what is open.
 */
function Section({
  title,
  meta,
  open,
  onToggle,
  children,
}: {
  title: string;
  meta: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <details open={open}>
        <summary
          onClick={(e) => {
            e.preventDefault();
            onToggle();
          }}
          className={cn(
            "flex cursor-pointer list-none flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-3 transition-colors hover:bg-muted/40",
            open && "border-b",
          )}
        >
          {open ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 translate-y-0.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 translate-y-0.5 text-muted-foreground" />
          )}
          <span className="text-base font-semibold tracking-tight">{title}</span>
          <span className="font-mono text-[11px] text-muted-foreground tabular-nums">{meta}</span>
        </summary>
        <CardContent className="space-y-3 px-4 pb-4 pt-4">{children}</CardContent>
      </details>
    </Card>
  );
}

/* ── snapshot provenance ── */

function SnapshotBanner({ report, lang }: { report: IntakeReport; lang: "en" | "zh" }) {
  const t = T[lang];
  // 14 days is one L10 cycle plus slack: past that the "next action" dates in the report have all
  // come and gone, so quoting it without a refresh would mislead the meeting.
  const stale = report.ageDays > 14;
  return (
    <Card className={cn(stale && "border-amber-500/40")}>
      <CardContent className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-xs">
        <Badge variant="outline" className="h-5 shrink-0 gap-1 px-1.5 font-normal">
          <CalendarClock className="h-3 w-3" />
          {t.snapshot}
        </Badge>
        <span className="font-mono tabular-nums">{t.asOf(report.asOf)}</span>
        <span className="font-mono text-muted-foreground tabular-nums">
          {t.window(report.window.from, report.window.to)}
        </span>
        <span className="text-muted-foreground">
          {t.source}: <span className="font-mono">{report.source}</span>
        </span>
        <p className="w-full text-[11px] leading-relaxed text-muted-foreground">{t.snapshotWhy}</p>
        {stale && (
          <p className="w-full text-[11px] font-medium text-amber-700 dark:text-amber-400">{t.stale(report.ageDays)}</p>
        )}
      </CardContent>
    </Card>
  );
}

/* ── the ladder ── */

function Ladder({ report, lang }: { report: IntakeReport; lang: "en" | "zh" }) {
  const t = T[lang];
  const max = Math.max(...report.ladder.map((r) => r.count), 1);
  return (
    <>
      <p className="text-xs text-muted-foreground">{t.ladderSub}</p>
      <div>
        {report.ladder.map((rung) => {
          const tone = STAGE_TONE[rung.key] ?? STAGE_TONE.interest;
          return (
            <div key={rung.key} className="grid grid-cols-[46px_minmax(0,150px)_1fr_28px] items-center gap-3 py-1.5">
              <span className={cn("font-mono text-[15px] font-semibold tabular-nums", tone.text)}>{rung.pct}%</span>
              <span className="truncate text-[13px] font-medium">{rung.label[lang]}</span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-muted">
                  <div className={cn("h-full rounded-full", tone.rail)} style={{ width: `${(rung.count / max) * 100}%` }} />
                </div>
                <span className="truncate text-[11px] text-muted-foreground">{rung.desc[lang]}</span>
              </div>
              <span
                className={cn(
                  "text-right font-mono text-[13px] tabular-nums",
                  rung.count === 0 ? "text-muted-foreground/50" : "font-semibold",
                )}
              >
                {rung.count || "—"}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ── meeting matrix ── */

function MeetingMatrix({
  track,
  report,
  lang,
  onSelect,
}: {
  track: IntakeReport["tracks"][number];
  report: IntakeReport;
  lang: "en" | "zh";
  onSelect: (client: Client) => void;
}) {
  const t = T[lang];
  const bands = useMemo(() => monthBands(report.weeks, lang), [report.weeks, lang]);
  const rate = track.planned ? ((track.held / track.planned) * 100).toFixed(0) : "0";
  const missing = track.clients.reduce((n, c) => n + c.missingInvites, 0);

  return (
    <>
      <p className="text-xs text-muted-foreground">
        {track.desc[lang]} · {t.heldRate(track.held, track.planned, rate)}
      </p>

      {/* reach — the number the report leads with */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border bg-muted/30 px-3 py-2">
        <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="text-[13px] font-semibold tabular-nums">{t.reach(track.reach.avg.toFixed(1))}</span>
        <span className="text-[11px] text-muted-foreground">
          {t.reachHint(track.reach.weeks, track.reach.peak, track.reach.zero)}
        </span>
        {missing > 0 && (
          <Badge
            variant="outline"
            className="h-5 border-amber-500/50 px-1.5 text-[10px] font-normal text-amber-700 dark:text-amber-400"
          >
            {t.missingInvites(missing)}
          </Badge>
        )}
      </div>

      {track.clients.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t.noMeetings}</p>
      ) : (
        <div className="-mx-4 overflow-x-auto px-4">
          <table className="w-full border-separate border-spacing-0 text-[13px]">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-card" />
                {bands.map((band, i) => (
                  <th
                    key={`${band.label}-${i}`}
                    colSpan={band.span}
                    className="border-b px-1 pb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    {band.label}
                  </th>
                ))}
                <th className="border-b pb-1 pl-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {lang === "zh" ? "开/排" : "held"}
                </th>
              </tr>
            </thead>
            <tbody>
              {track.clients.map((client) => {
                const tone = STAGE_TONE[client.stage] ?? STAGE_TONE.interest;
                return (
                  <tr key={client.slug} className="group">
                    <th
                      scope="row"
                      onClick={() => onSelect(client)}
                      className="sticky left-0 z-10 min-w-[210px] max-w-[210px] cursor-pointer border-b bg-card py-1.5 pr-3 text-left align-middle font-normal transition-colors group-hover:bg-muted/40"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "w-8 shrink-0 text-right font-mono text-[13px] font-semibold tabular-nums",
                            tone.text,
                          )}
                        >
                          {client.pct}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-medium">{client.name}</span>
                          <span className="block truncate text-[10px] text-muted-foreground">
                            {client.stageLabel[lang]}
                            {client.daysSinceMet != null && ` · ${client.daysSinceMet}d`}
                          </span>
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                      </div>
                    </th>

                    {client.cells.map((cell, i) => {
                      const event = cell[0];
                      const label = event
                        ? [
                            `${event.date}${event.time ? ` ${event.time}` : ""}`,
                            event.silent
                              ? lang === "zh"
                                ? "⚠ 日历上已消失，且无取消记录"
                                : "⚠ Gone from the calendar with no cancellation on record"
                              : (report.states[event.state]?.label[lang] ?? event.state),
                            event.title ?? "",
                            event.reason ? `${lang === "zh" ? "原因：" : "Reason: "}${event.reason[lang]}` : "",
                            event.note ? `${lang === "zh" ? "注：" : "Note: "}${event.note[lang]}` : "",
                          ]
                            .filter(Boolean)
                            .join(" · ")
                        : undefined;
                      const inner = (
                        <span
                          className={cn(
                            "mx-auto block h-[17px] w-[17px] rounded-[3px] border transition-transform",
                            STATE_CELL[event?.state ?? ""] ?? "",
                            event && "hover:scale-125",
                            event?.silent && "ring-1 ring-amber-500",
                          )}
                        />
                      );
                      return (
                        <td key={i} className="border-b px-[2px] py-1.5 text-center align-middle">
                          {!event ? (
                            <span className="mx-auto block h-[3px] w-[3px] rounded-full bg-muted-foreground/20" />
                          ) : event.href ? (
                            <a href={event.href} target="_blank" rel="noopener noreferrer" title={label} className="block">
                              {inner}
                            </a>
                          ) : (
                            <span title={label} tabIndex={0} className="block">
                              {inner}
                            </span>
                          )}
                          {cell.length > 1 && (
                            <span className="block text-[9px] leading-none text-muted-foreground">+{cell.length - 1}</span>
                          )}
                        </td>
                      );
                    })}

                    <td className="border-b pl-2 text-right align-middle font-mono text-[11px] tabular-nums">
                      <span className="font-semibold">{client.held}</span>
                      <span className="text-muted-foreground">/{client.planned}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {Object.entries(report.states).map(([key, state]) => (
          <span key={key} className="flex items-center gap-1.5 text-[11px] text-muted-foreground" title={state.desc[lang]}>
            <span className={cn("h-3 w-3 shrink-0 rounded-[3px] border", STATE_CELL[key] ?? "border-muted")} />
            {state.label[lang]}
          </span>
        ))}
        <span className="text-[11px] text-muted-foreground/70">· {t.clientHint}</span>
      </div>
    </>
  );
}

/* ── closed lost ── */

function LostDeals({ clients, lang }: { clients: Client[]; lang: "en" | "zh" }) {
  const t = T[lang];
  return (
    <>
      <p className="text-xs text-muted-foreground">{t.lostSub}</p>
      <div className="grid gap-3 xl:grid-cols-2">
        {clients.map((client) => {
          const rejection = client.rejection;
          const byEmail = rejection?.channel === "email";
          return (
            <div key={client.slug} className="rounded-lg border border-l-2 border-l-muted-foreground/40 bg-card p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[13px] font-semibold">{client.name}</span>
                {rejection?.channel && (
                  <Badge variant="outline" className="h-5 gap-1 px-1.5 text-[10px] font-normal">
                    {byEmail ? <Mail className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />}
                    {rejection.channel}
                  </Badge>
                )}
                {rejection?.date && (
                  <span className="font-mono text-[10px] text-muted-foreground tabular-nums">{rejection.date}</span>
                )}
              </div>
              {rejection?.who && <div className="mt-1 text-[11px] text-muted-foreground">{rejection.who[lang]}</div>}
              {rejection?.quote && (
                <blockquote className="mt-2 border-l-2 pl-3 text-[12px] italic leading-relaxed text-muted-foreground">
                  {rejection.quote[lang]}
                </blockquote>
              )}
              {client.lostReason && (
                <p className="mt-2 text-[11px] leading-relaxed">
                  <span className="font-medium uppercase tracking-wide text-muted-foreground">{t.why}: </span>
                  {client.lostReason[lang]}
                </p>
              )}
              {rejection?.ref && (
                <div className="mt-1.5 font-mono text-[10px] text-muted-foreground/70">{rejection.ref[lang]}</div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ── per-client evidence ── */

function ClientDialog({ client, lang, onClose }: { client: Client | null; lang: "en" | "zh"; onClose: () => void }) {
  const t = T[lang];
  if (!client) return null;
  const tone = STAGE_TONE[client.stage] ?? STAGE_TONE.interest;
  const held = client.cells.flat().filter((e) => e.state === "held");

  const Block = ({ label, body }: { label: string; body: string }) => (
    <div>
      <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <p className="whitespace-pre-line text-[13px] leading-relaxed">{body}</p>
    </div>
  );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent container={root()} className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span className={cn("font-mono font-semibold tabular-nums", tone.text)}>{client.pct}%</span>
            <span>{client.stageLabel[lang]}</span>
            {client.contact && <span>· {client.contact}</span>}
            <span>· {client.lastMet ? t.lastMet(client.lastMet, client.daysSinceMet ?? 0) : t.neverMet}</span>
          </div>
          <DialogTitle className="text-base leading-snug">{client.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-normal">
              {t.sessions(client.held, client.planned)}
            </Badge>
            {client.missingInvites > 0 && (
              <Badge
                variant="outline"
                className="h-5 border-amber-500/50 px-1.5 text-[10px] font-normal text-amber-700 dark:text-amber-400"
              >
                {t.missingInvites(client.missingInvites)}
              </Badge>
            )}
            {client.status && (
              <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-normal">
                {client.status}
              </Badge>
            )}
          </div>

          {client.cadence && <Block label={t.cadence} body={client.cadence[lang]} />}
          {client.stageEvidence && <Block label={t.clientDetail} body={client.stageEvidence[lang]} />}
          {client.nextAction && (
            <>
              <Separator />
              <Block label={t.nextAction} body={client.nextAction[lang]} />
            </>
          )}
          {client.lostReason && (
            <>
              <Separator />
              <Block label={t.lostReason} body={client.lostReason[lang]} />
            </>
          )}

          {client.rejection && (
            <div className="rounded-md border border-l-2 border-l-red-500/60 bg-muted/30 p-3">
              <div className="mb-1.5 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                <span className="font-medium">{t.rejection}</span>
                {client.rejection.channel && (
                  <Badge variant="outline" className="h-[18px] px-1.5 text-[10px] font-normal">
                    {client.rejection.channel}
                  </Badge>
                )}
                {client.rejection.date && <span className="font-mono tabular-nums">{client.rejection.date}</span>}
                {client.rejection.who && <span className="normal-case">{client.rejection.who[lang]}</span>}
              </div>
              {client.rejection.quote && (
                <blockquote className="border-l-2 pl-3 text-[12px] italic leading-relaxed text-muted-foreground">
                  {client.rejection.quote[lang]}
                </blockquote>
              )}
              {client.rejection.ref && (
                <div className="mt-1.5 font-mono text-[10px] text-muted-foreground/70">{client.rejection.ref[lang]}</div>
              )}
            </div>
          )}

          {client.note && <Block label="Note" body={client.note[lang]} />}

          {held.length > 0 && (
            <>
              <Separator />
              <div>
                <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {t.sessionsHeld}
                </div>
                <ul className="space-y-1">
                  {held.map((event) => (
                    <li key={`${event.date}-${event.time ?? ""}`} className="flex gap-3 text-[12px]">
                      <span className="w-20 shrink-0 font-mono text-muted-foreground tabular-nums">{event.date}</span>
                      <span className="min-w-0 flex-1">
                        {event.href ? (
                          <a
                            href={event.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-baseline gap-1 hover:underline"
                          >
                            <span>{event.title ?? event.date}</span>
                            <ExternalLink className="h-3 w-3 shrink-0 translate-y-0.5" />
                          </a>
                        ) : (
                          (event.title ?? event.date)
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── follow-ups ── */

function RoleActions({ report, lang }: { report: IntakeReport; lang: "en" | "zh" }) {
  const t = T[lang];
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {report.roleActions.map((role) => (
        <div key={role.role} className="space-y-2.5">
          <div className="flex items-center justify-between gap-2 border-b pb-2">
            <div className="min-w-0">
              <div className="text-[13px] font-semibold">{role.role}</div>
              <p className="truncate text-[11px] text-muted-foreground">{role.subtitle[lang]}</p>
            </div>
            <Badge variant="outline" className="h-5 shrink-0 px-1.5 text-[10px] font-normal">
              {role.items.length}
            </Badge>
          </div>
          {role.items.map((item, i) => (
            <div key={i} className="rounded-md border bg-card p-2.5">
              <Badge
                variant="outline"
                className={cn("h-[18px] px-1.5 text-[10px] font-medium", PRIORITY_TONE[item.priority.zh])}
              >
                {item.priority[lang]}
              </Badge>
              <div className="mt-1.5 text-[13px] font-medium leading-snug">{item.title[lang]}</div>
              {item.why && (
                <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                  <span className="font-medium uppercase tracking-wide">{t.why}: </span>
                  {item.why[lang]}
                </p>
              )}
              {item.action && (
                <p className="mt-1.5 text-[11px] leading-relaxed">
                  <span className="font-medium uppercase tracking-wide text-muted-foreground">{t.doThis}: </span>
                  {item.action[lang]}
                </p>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── method ── */

function Method({ report, lang }: { report: IntakeReport; lang: "en" | "zh" }) {
  const t = T[lang];
  const { sources, extraSources, notes, openQuestions } = report.method;
  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        {sources.map((s, i) => (
          <div key={i} className="rounded-md border bg-muted/20 p-3">
            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{s.layer[lang]}</div>
            <div className="mt-0.5 text-[13px] font-medium">{s.source[lang]}</div>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{s.detail[lang]}</p>
          </div>
        ))}
      </div>

      {extraSources.length > 0 && (
        <div>
          <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{t.upstream}</div>
          <ul className="space-y-1">
            {extraSources.map((s, i) => (
              <li key={i} className="font-mono text-[11px] leading-relaxed text-muted-foreground">
                {s[lang]}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{t.caveats}</div>
        <ul className="space-y-2">
          {notes.map((n, i) => (
            <li key={i} className="text-[12px] leading-relaxed text-muted-foreground">
              {n[lang]}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {t.questions} <span className="font-mono">{openQuestions.length}</span>
        </div>
        <ol className="space-y-2">
          {openQuestions.map((q, i) => (
            <li key={i} className="flex gap-3 text-[12px] leading-relaxed">
              <span className="shrink-0 font-mono text-[10px] font-bold text-amber-700 dark:text-amber-400">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-muted-foreground">{q[lang]}</span>
            </li>
          ))}
        </ol>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <span className="font-medium">{t.notInV1}. </span>
          {t.notInV1Body}
        </AlertDescription>
      </Alert>
    </div>
  );
}

/* ── page ── */

export default function ClientEngagement() {
  const { data, error, loading, reload } = useIntake();
  const lang = useLang();
  const t = T[lang];
  const [selected, setSelected] = useState<Client | null>(null);
  // Sections start closed, matching the published report. The set holds only what the reader opened.
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const sectionIds = useMemo(
    () => (data ? ["roles", "ladder", ...data.tracks.map((tr) => `track:${tr.id}`), "lost", "method"] : []),
    [data],
  );
  const allOpen = sectionIds.length > 0 && sectionIds.every((id) => openSections.has(id));

  const lostClients = useMemo(
    () =>
      data
        ? data.tracks
            .flatMap((tr) => tr.clients)
            .filter((c) => c.pct === 0)
            .sort((a, b) => (b.rejection?.date ?? "").localeCompare(a.rejection?.date ?? ""))
        : [],
    [data],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <Link to="/products" className="text-[11px] text-muted-foreground hover:underline">
            ← {t.backToCards}
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{t.title}</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {data && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpenSections(allOpen ? new Set() : new Set(sectionIds))}
            >
              {allOpen ? t.collapseAll : t.expandAll}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={reload} disabled={loading}>
            <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", loading && "animate-spin")} />
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

      {loading && !data && (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          <Skeleton className="h-52 w-full" />
        </div>
      )}

      {data && (
        <>
          <SnapshotBanner report={data} lang={lang} />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatTile label={t.avgProgress} value={`${data.summary.avgProgress.toFixed(0)}%`} hint={t.avgHint} />
            <StatTile label={t.deep} value={data.summary.deep} hint={t.deepHint} tone="green" />
            <StatTile label={t.lost} value={data.summary.lost} hint={t.lostHint} tone="red" />
            <StatTile label={t.inProd} value={data.summary.inProduction} hint={t.inProdHint} tone="red" />
          </div>

          <Section
            title={t.secRoles}
            meta={t.secRolesMeta(
              data.roleActions.reduce((n, r) => n + r.items.length, 0),
              data.roleActions.map((r) => r.role).join(" / "),
            )}
            open={openSections.has("roles")}
            onToggle={() => toggle("roles")}
          >
            <RoleActions report={data} lang={lang} />
          </Section>

          <Section
            title={t.secLadder}
            meta={t.secLadderMeta(data.ladder.length)}
            open={openSections.has("ladder")}
            onToggle={() => toggle("ladder")}
          >
            <Ladder report={data} lang={lang} />
          </Section>

          {data.tracks.map((track) => (
            <Section
              key={track.id}
              title={track.label[lang]}
              meta={t.secTrackMeta(track.clients.length, track.reach.avg.toFixed(1))}
              open={openSections.has(`track:${track.id}`)}
              onToggle={() => toggle(`track:${track.id}`)}
            >
              <MeetingMatrix track={track} report={data} lang={lang} onSelect={setSelected} />
            </Section>
          ))}

          <Section
            title={t.secLost(lostClients.length)}
            meta={t.secLostMeta(
              lostClients.filter((c) => c.rejection?.channel === "email").length,
              lostClients.filter((c) => c.rejection?.channel && c.rejection.channel !== "email").length,
            )}
            open={openSections.has("lost")}
            onToggle={() => toggle("lost")}
          >
            <LostDeals clients={lostClients} lang={lang} />
          </Section>

          <Section
            title={t.secMethod}
            meta={t.secMethodMeta(data.method.sources.length, data.method.notes.length, data.method.openQuestions.length)}
            open={openSections.has("method")}
            onToggle={() => toggle("method")}
          >
            <Method report={data} lang={lang} />
          </Section>

          <ClientDialog client={selected} lang={lang} onClose={() => setSelected(null)} />
        </>
      )}
    </div>
  );
}
