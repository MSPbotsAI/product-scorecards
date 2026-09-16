// App-wide language switch: a module-level store shared by every page root (no provider needed),
// persisted to localStorage. English is canonical (the server speaks it); zh is a display layer.

import { useSyncExternalStore } from "react";

export type Lang = "en" | "zh";

const KEY = "product-scorecards.lang";

function initial(): Lang {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "en" || saved === "zh") return saved;
    return navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
  } catch {
    return "en";
  }
}

let lang: Lang = initial();
const listeners = new Set<() => void>();

export function setLang(next: Lang) {
  lang = next;
  try {
    localStorage.setItem(KEY, next);
  } catch {
    // Private mode etc. — the choice just won't survive a reload.
  }
  listeners.forEach((fn) => fn());
}

export function useLang(): Lang {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => lang,
    () => "en",
  );
}

/* ── UI strings ── */

const EN = {
    boardTitle: "Product Team Scorecard",
    boardSubtitle: "Weekly operating pulse for the Product-Platform L10.",
    weekOf: (w: string) => `Week of ${w} · weeks start Monday`,
    refresh: "Refresh",
    actNow: "Needs a decision this week",
    actNowSub:
      "Reds and yellows, named. A red with no owner escalates to IDS on the spot; every row here must produce an action whose effect is visible next week.",
    actNowEmpty: "Nothing red or yellow this week.",
    onTrack: "On track",
    onTrackEmpty: "No green rows yet.",
    trends: "Trends — display only",
    trendsSub: "Never judged red or green by design: observation-period and wrong-denominator rows are not accountability numbers.",
    gaps: (n: number) => `Not measured yet — ${n} rows`,
    gapsSub: "Shown deliberately rather than rendered as zero. A missing source is a gap to close, not a failing number.",
    metric: "Metric",
    owner: "Owner",
    value: "Value",
    lastWeek: "Last wk",
    target: "Target",
    status: "Status",
    unowned: "unowned → IDS",
    redsTile: "Reds to act on",
    redsTileHint: "each carries named tenants",
    greensTile: "On track",
    coverageTile: "Rows measured",
    coverageHint: "of judged rows have a source",
    onTrackTile: "Team on-track share",
    onTrackHint: "display only — never a target",
    sources: "Sources",
    rows: "rows",
    failed: "failed",
    // by-owner page
    ownerTitle: "By owner",
    ownerSubtitle:
      "One owner per number — the EOS rule the 2026-07-30 L10 applied to every row. Asset rows sit with an interim custodian who answers for red disposition at L10, not for doing the work.",
    accountable: "accountable",
    red: "red",
    loadBand: (n: number) => `${n} accountable rows — the workshop agreed 3–7 per owner`,
    loadOver: "above the 3–7 band, consider aggregating",
    loadOk: "within the 3–7 band",
    unownedBucket: "Unowned — escalates to L10 IDS",
    // product cards page
    productsTitle: "Product cards",
    productsSubtitle:
      "Twelve products on two axes — business stage (Explore / Grow / Sustain / Sunset) and release stage, plus Evolve MPD, Kevin's manually-logged delivery card.",
    firstLine: "first line",
    noSourceRows: (n: number, total: number) => `${n} of ${total} rows have no source yet`,
    monitoringOnly: "monitoring only",
    // row detail dialog
    detailHistory: "Weekly history",
    detailNames: "Named tenants",
    detailNotes: "Definition & notes",
    detailSource: "Source dataset",
    detailAnchor: "SOP anchor",
    weekCol: "Week",
    changeCol: "Δ vs prior",
    noHistory: "No history yet — this row currently has a single reading.",
    noSourceYet: "No data source wired yet.",
    updatedAt: (time: string) => `data as of ${time}`,
    // manual weekly entry (edit dialog)
    manualEditTitle: "Weekly entries",
    manualEditHint: "Enter each week's number — the dot recolors from the thresholds as you type.",
    manualSave: "Save",
    manualSaved: "Saved",
    manualSaveError: "Couldn't save",
    manuallyEntered: "Manually entered",
    manualSignInRequired: "Sign in to edit weekly values.",
    // runtime-editable threshold (row detail dialog)
    thresholdEditTitle: "Threshold",
    thresholdGreenLabel: "Green at",
    thresholdYellowLabel: "Yellow at",
    thresholdSave: "Save threshold",
    thresholdSaved: "Saved",
    thresholdSaveError: "Couldn't save",
};

/** Widen EN's literal strings so the zh table type-checks against the same shape. */
export type UIStrings = { [K in keyof typeof EN]: (typeof EN)[K] extends string ? string : (typeof EN)[K] };

const ZH: UIStrings = {
    boardTitle: "产品团队记分卡",
    boardSubtitle: "Product-Platform L10 的每周运营脉搏。",
    weekOf: (w: string) => `${w} 起的一周 · 周一为界`,
    refresh: "刷新",
    actNow: "本周需要决策",
    actNowSub: "红黄灯，全部具名。无主红灯当场升级 IDS；这里每一行都必须产生下周能看到效果的行动。",
    actNowEmpty: "本周没有红灯或黄灯。",
    onTrack: "达标",
    onTrackEmpty: "还没有绿灯行。",
    trends: "趋势 — 仅展示",
    trendsSub: "设计上不判红绿：观察期指标和分母未对齐的行不是问责数字。",
    gaps: (n: number) => `尚未测量 — ${n} 行`,
    gapsSub: "有意展示而非渲染成零。缺数据源是要关闭的缺口，不是不及格的数字。",
    metric: "指标",
    owner: "负责人",
    value: "本周",
    lastWeek: "上周",
    target: "目标",
    status: "状态",
    unowned: "无主 → IDS",
    redsTile: "待处置红灯",
    redsTileHint: "每行都带具名租户",
    greensTile: "达标",
    coverageTile: "已测量行",
    coverageHint: "判定行中有数据源的占比",
    onTrackTile: "团队达标占比",
    onTrackHint: "仅展示 — 永不设为目标",
    sources: "数据源",
    rows: "行",
    failed: "失败",
    ownerTitle: "按负责人",
    ownerSubtitle: "一数一主——2026-07-30 L10 对所有行统一适用的 EOS 规则。资产行挂在临时代管人名下，他负责红灯的处置闭环，而非亲自做资产工作。",
    accountable: "问责行",
    red: "红",
    loadBand: (n: number) => `${n} 行问责 — workshop 约定每人 3–7 行`,
    loadOver: "超出 3–7 区间，考虑聚合",
    loadOk: "在 3–7 区间内",
    unownedBucket: "无主 — 升级至 L10 IDS",
    productsTitle: "产品卡",
    productsSubtitle:
      "12 个产品按双轴定位——业务轴（Explore / Grow / Sustain / Sunset）与发布轴，另加 Evolve MPD——Kevin 手动记录的交付卡。",
    firstLine: "一线",
    noSourceRows: (n: number, total: number) => `${total} 行中 ${n} 行暂无数据源`,
    monitoringOnly: "仅监控",
    detailHistory: "周历史",
    detailNames: "具名租户",
    detailNotes: "口径与备注",
    detailSource: "来源数据集",
    detailAnchor: "制度锚点",
    weekCol: "周",
    changeCol: "环比",
    noHistory: "暂无历史——该行目前只有单点读数。",
    noSourceYet: "尚未接入数据源。",
    updatedAt: (time: string) => `数据截至 ${time}`,
    manualEditTitle: "每周填报",
    manualEditHint: "逐周填写数字——圆点会按阈值实时变色。",
    manualSave: "保存",
    manualSaved: "已保存",
    manualSaveError: "保存失败",
    manuallyEntered: "人工填报",
    manualSignInRequired: "请登录后再编辑每周数值。",
    thresholdEditTitle: "阈值",
    thresholdGreenLabel: "绿灯起点",
    thresholdYellowLabel: "黄灯起点",
    thresholdSave: "保存阈值",
    thresholdSaved: "已保存",
    thresholdSaveError: "保存失败",
};

const UI: Record<Lang, UIStrings> = { en: EN, zh: ZH };

export function useT(): UIStrings {
  const l = useLang();
  return UI[l];
}

/* ── status labels ── */

export const STATUS_LABEL: Record<Lang, Record<string, string>> = {
  en: { red: "Red", yellow: "Yellow", green: "Green", display: "Trend", nodata: "No source" },
  zh: { red: "红", yellow: "黄", green: "绿", display: "趋势", nodata: "无源" },
};

/* ── row-level translations, keyed by row id (English canon lives in service/lib/rows.ts) ── */

const ROW_NAME_ZH: Record<string, string> = {
  T1: "TicketQA — 活跃租户（本周 credit > 0）",
  T4: "TicketQA — 沉默付费租户（未处置）",
  T5: "TicketQA — ROI（滚动4周收入 ÷ 工时）",
  SM1: "Sentiment Max — 活跃租户（本周 credit > 0）",
  SM2: "Sentiment Max — 沉默付费租户（未处置）",
  SM3: "Sentiment Max — ROI（滚动4周收入 ÷ 工时）",
  TR1: "AI Triage — 活跃租户（本周 credit > 0）",
  TR2: "AI Triage — 沉默付费租户（未处置）",
  TR3: "AI Triage — ROI（滚动4周收入 ÷ 工时）",
  I2: "Ticket Intake — 活跃租户（本周 credit > 0）",
  I3: "Ticket Intake — 沉默付费租户（未处置）",
  I4: "Ticket Intake — ROI（滚动4周收入 ÷ 工时）",
  BI1: "BI — 付费租户",
  BI2: "BI — 活跃/付费租户比（7天）",
  BI3: "BI — ROI（滚动4周 MRR ÷ 工时）",
  BO1: "Bot — 付费租户",
  BO2: "Bot — 活跃/付费租户比（7天）",
  BO3: "Bot — ROI（滚动4周 MRR ÷ 工时）",
  N1: "NextTicket — 付费租户",
  N2: "NextTicket — 活跃/付费租户比（7天）",
  N3: "NextTicket — ROI（滚动4周 MRR ÷ 工时）",
  N4: "NextTicket — 座席利用率（活跃用户 ÷ 席位）",
  N5: "NextTicket — 人均日使用频次",
  A1: "Attendance — 付费租户",
  A2: "Attendance — 活跃/付费租户比（7天）",
  A3: "Attendance — ROI（滚动4周 MRR ÷ 工时）",
  "BI-ENG": "BI — 租户 engagement 分",
  "BOT-ENG": "Bot — 租户 engagement 分",
  "NEXT_TICKET-ENG": "NextTicket — 租户 engagement 分",
  "ATTENDANCE-ENG": "Attendance — 租户 engagement 分",
  B1: "资产 — 模板血缘依赖覆盖",
  B2: "资产 — 依赖降档租户",
  B3: "资产 — 死模板库存",
  SM4: "Sentiment — 负面告警 7 天内查看率",
  TR4: "AI Triage — 未被人工改判的分类占比（4周）",
  H1: "L10 时记分卡数据完整性",
  H2: "红灯处置闭环（上周）",
  H3: "团队达标占比",
  P1: "合格 alpha 候选客户（具名，在谈）",
  P2: "客户探索/演示通话（本周）",
  P3: "管道新鲜度 — 7 天内更新过的在谈客户占比",
  P4: "Gate-1 证据项关闭数（本周）",
  P5: "阻塞开发的问题 24 小时内答复率",
  P6: "交付物一次通过率（U1）",
  P7: "冻结后每个 story 的 AC 变更数（M-SPEC）",
  P8: "可开发储备（周）",
};

const TARGET_ZH: Record<string, string> = {
  T1: "周环比不净减",
  SM1: "周环比不净减",
  TR1: "周环比不净减",
  I2: "周环比不净减",
  T4: "0",
  SM2: "0",
  TR2: "0",
  I3: "0",
  T5: "观察期；季度 EOS 定阈值",
  SM3: "观察期；季度 EOS 定阈值",
  TR3: "观察期；季度 EOS 定阈值",
  I4: "观察期；季度 EOS 定阈值",
  BI1: "周环比不减；单周流失 ≥2 家即红",
  BO1: "周环比不减；单周流失 ≥2 家即红",
  N1: "周环比不减；单周流失 ≥2 家即红",
  A1: "周环比不减；单周流失 ≥2 家即红",
  BI2: ">=80%",
  BO2: ">=80%",
  N2: ">=80%",
  A2: ">=80%",
  BI3: "观察期；季度 EOS 定阈值",
  BO3: "观察期；季度 EOS 定阈值",
  N3: "观察期；季度 EOS 定阈值",
  A3: "观察期；季度 EOS 定阈值",
  "BI-ENG": "趋势；现有目标：BI —、Bot 90、NT 15、AT 5",
  "BOT-ENG": "趋势；现有目标：BI —、Bot 90、NT 15、AT 5",
  "NEXT_TICKET-ENG": "趋势；现有目标：BI —、Bot 90、NT 15、AT 5",
  "ATTENDANCE-ENG": "趋势；现有目标：BI —、Bot 90、NT 15、AT 5",
  N4: "中位数 >=60%（待校准）",
  N5: "中位数持平或上升",
  B1: "-5pp 趋势即红",
  B2: "≥1 家（具名，进 IDS）即红",
  B3: "仅展示趋势",
  SM4: "待定",
  TR4: "-5pp 黄 / -10pp 红",
  H1: "100%",
  H2: "100%",
  H3: "仅展示趋势（永不问责）",
  P1: "爬升到 10 家（Client Engagement SOP §1 标准）",
  P2: ">=3（先导指标，不参与评价）",
  P3: "100%",
  P4: ">=1 项/周；连续两周零进展转黄",
  P5: "100%",
  P6: ">=80%（Q1 仅观察）",
  P7: "<=1",
};

const NOTE_ZH: Record<string, string> = {
  T4: "当前按「付费且该产品 7 天零消耗」计算。约定口径是 14 天零消耗且上榜超一周未处置——14 天窗口需要日粒度事实表，处置状态本应用尚未存储。",
  SM2: "同 T4：14 天窗口与处置状态尚未接入。",
  TR2: "同 T4：14 天窗口与处置状态尚未接入。",
  I3: "同 T4：14 天窗口与处置状态尚未接入。",
  T5: "工时来自 ClickUp 时间条目（Timesheet Project = AI Ticket QA - Alpha + Beta 两项之和）；收入侧需要 credit 单价。",
  SM3: "工时按 Timesheet Project = AI Sentiment；收入侧需要 credit 单价。",
  TR3: "工时按 Timesheet Project = AI Ticket Triage；收入侧需要 credit 单价。",
  I4: "工时按 Timesheet Project = AI intake；收入侧需要 credit 单价。",
  BI1: "流失确认在 canceled_customers / sys_paying_user_log——尚未接线。",
  BO1: "同 BI1。",
  N1: "同 BI1。",
  A1: "同 BI1。",
  BI2: "分母口径待定：现有平台 scorecard 同时按「产品级付费基数」和「全量付费基数」各设目标。数据集补上 access_* 列后此行自动按产品级基数判色。",
  BO2: "同 BI2。",
  N2: "同 BI2。",
  A2: "同 BI2。",
  B1: "模板目录与两跳克隆血缘已知（business_type='Template'；original_id + 父级 original_id）。缺的是按租户的资产使用事件：本应承载它的数据集仍是 Requested 且为空。",
  B2: "需要按周的租户资产数——使用事件源尚缺。",
  B3: "可由「Asset usage by MSP size」（1879106462136016897）取数：used_tenant = 0 的条目。",
  SM4: "遥测债：告警查看/处理事件不存在（SOP Action 14）。",
  TR4: "待 Grace 确认：人工改判事件遥测是否存在。",
  H1: "周边界为周一（见 data-map.md）；现有 scorecard 并非周日快照。",
  H2: "需要落库的处置状态；本应用尚未持久化。",
  P1: "在 HubSpot 里数的 ICP 匹配、在谈候选客户。口径判的是「有没有往上走」而不是「到没到 10 家」——10 是目标位，所以周环比下降才是红。规范里「连续两周持平转黄」需要两周回看，本应用不按此判色。",
  P2: "本周开的 SAP 相关客户通话，录音在 Fathom。设计规则 2：先导活动量指标永不判红绿。",
  P3: "在谈候选客户里，7 天内更新过阶段/下一步的占比（HubSpot）。",
  P4: "Prototype->Alpha 清单上本周关闭的证据项，记录在 ClickUp gate records。本应用按单周判色，规范里「连续两周零进展」的升级没有编码——零进展的一周在这里直接判红。",
  P5: "取自 SAP story 上的 ClickUp 评论时间戳。",
  P6: "取自 AI reviewer 日志。Q1 内仅观察——universal layer 把 P6 列为其唯一「可行动」例外，观察期结束后把 compare 改成 gte。",
  P7: "冻结点 = 状态变为「5c - ready for dev」；数据来自 ClickUp 状态历史 ＋ AC 修改历史。规范规定 SAP 进入 story 流程后此行才启用，在那之前它还不是问责数字。",
  P8: "停在「5b - ready for groom」/「5c - ready for dev」且未开工的 story 数，除以滚动 4 周的开发消耗。低于 1 周时，L10 的 IDS 议题是 Grace 在 Intake 与 SAP 之间的分配。",
};

/** Short row names for dense card lists: [en, zh]. Full names stay in tooltips. */
const ROW_SHORT: Record<string, [string, string]> = {
  T1: ["Active tenants", "活跃租户"],
  SM1: ["Active tenants", "活跃租户"],
  TR1: ["Active tenants", "活跃租户"],
  I2: ["Active tenants", "活跃租户"],
  T4: ["Silent paid tenants", "沉默付费租户"],
  SM2: ["Silent paid tenants", "沉默付费租户"],
  TR2: ["Silent paid tenants", "沉默付费租户"],
  I3: ["Silent paid tenants", "沉默付费租户"],
  T5: ["ROI", "ROI"],
  SM3: ["ROI", "ROI"],
  TR3: ["ROI", "ROI"],
  I4: ["ROI", "ROI"],
  BI1: ["Paying tenants", "付费租户"],
  BO1: ["Paying tenants", "付费租户"],
  N1: ["Paying tenants", "付费租户"],
  A1: ["Paying tenants", "付费租户"],
  BI2: ["Active / paying", "活跃占比"],
  BO2: ["Active / paying", "活跃占比"],
  N2: ["Active / paying", "活跃占比"],
  A2: ["Active / paying", "活跃占比"],
  BI3: ["ROI", "ROI"],
  BO3: ["ROI", "ROI"],
  N3: ["ROI", "ROI"],
  A3: ["ROI", "ROI"],
  "BI-ENG": ["Engagement score", "Engagement 分"],
  "BOT-ENG": ["Engagement score", "Engagement 分"],
  "NEXT_TICKET-ENG": ["Engagement score", "Engagement 分"],
  "ATTENDANCE-ENG": ["Engagement score", "Engagement 分"],
  N4: ["License utilization", "座席利用率"],
  N5: ["Per-user frequency", "人均使用频次"],
  B1: ["Template coverage", "模板血缘覆盖"],
  B2: ["Dependency drops", "依赖降档租户"],
  B3: ["Dead templates", "死模板库存"],
  SM4: ["Alert view rate", "告警查看率"],
  TR4: ["AI adoption", "AI 采纳率"],
  H1: ["Data completeness", "数据完整性"],
  H2: ["Red-light closure", "红灯处置闭环"],
  H3: ["On-track share", "达标占比"],
  P1: ["Alpha candidates", "Alpha 候选客户"],
  P2: ["Discovery calls", "客户通话"],
  P3: ["Pipeline freshness", "管道新鲜度"],
  P4: ["Gate-1 evidence", "Gate-1 证据"],
  P5: ["Blocker answers <=24h", "阻塞问题 24h 答复"],
  P6: ["First-pass rate", "一次通过率"],
  P7: ["Post-freeze AC changes", "冻结后 AC 变更"],
  P8: ["Dev-ready runway", "可开发储备"],
};

export function rowShort(id: string, fallback: string, l: Lang): string {
  const hit = ROW_SHORT[id];
  if (!hit) return fallback;
  return l === "zh" ? hit[1] : hit[0];
}

export function rowName(id: string, fallback: string, l: Lang): string {
  return l === "zh" ? (ROW_NAME_ZH[id] ?? fallback) : fallback;
}
export function rowTarget(id: string, fallback: string, l: Lang): string {
  return l === "zh" ? (TARGET_ZH[id] ?? fallback) : fallback;
}
export function rowNote(id: string, fallback: string | undefined, l: Lang): string | undefined {
  return l === "zh" ? (NOTE_ZH[id] ?? fallback) : fallback;
}

/* ── SOP Agent funnel page ──
   Kept as its own dictionary rather than folded into UIStrings: these strings belong to one
   screen, and the shared dict is already read by five. */

const FUNNEL_EN = {
  title: "SOP Agent funnel",
  subtitle:
    "The Agent Platform engagement funnel, computed from the engagement store — the same markdown repo the ClickUp client-engagement board mirrors, refreshed every 5 minutes. Nothing on this page is typed in by hand.",
  refresh: "Refresh",
  staleStore: (why: string) => `Showing the last good copy of the store — the latest pull failed: ${why}`,
  tileClients: "Clients in the store",
  tileClientsHint: "every profile, all rungs",
  tileQualified: "Qualified (qualifying+)",
  tileQualifiedHint: "wants to continue — P1 on the scorecard",
  tileCalls: "SOP Agent calls this week",
  tileCallsHint: (all: number) => `of ${all} held external calls — P2`,
  tileFresh: "Pipeline freshness",
  tileFreshHint: (fresh: number, active: number) => `${fresh}/${active} active clients touched in 7d — P3`,
  tileStalled: "Stalled at Met",
  tileStalledHint: (d: number) => `no movement in ${d}+ days`,
  ladderTitle: "The ladder",
  ladderSub:
    "One rung per client-engagement stage, straight off `stage:` in each profile — the field the ClickUp board mirrors, so these counts and that board's columns are one measurement. The percentage is the step down from the rung above.",
  exits: "Exits:",
  committedTag: "committed tag",
  meetingsTitle: "Client calls held",
  meetingsSub: (held: number, relevant: number, clients: number) =>
    `${held} external calls held, ${relevant} judged SOP-Agent-relevant, across ${clients} clients. Relevance is the sync routine's own judgement per call — the nearest thing the store has to "substantively pitched", and not identical to it.`,
  legendRelevant: "SOP Agent relevant",
  legendOther: "other client calls",
  handoffTitle: "Handoff-note gate (qualifying → acquisition)",
  handoffSub: (gate: number, started: number) =>
    `${gate} of ${started} started notes have all seven required fields — the documented exit test for moving a card into Acquisition.`,
  handoffEmpty: "No handoff note has any field filled yet.",
  colClient: "Client",
  colStage: "Stage",
  colRequired: "Required (7)",
  colAll: "All (13)",
  colDomain: "Domain",
  colIdle: "Idle",
  stalledTitle: (d: number) => `Stalled at Met — ${d}+ days`,
  stalledSub:
    "Clients we have talked to whose newest movement date is stale. On the board these share one column with everyone else at Met, which is what makes them easy to lose.",
  stalledEmpty: "Nothing stalled.",
  never: "no date",
  days: (n: number) => `${n}d`,
  andMore: (n: number) => `+${n} more`,
  mailTitle: "Outreach batches",
  mailSub: (accounts: number) => `${accounts} distinct accounts on the send ledger.`,
  sent: (n: number) => `${n} sent`,
  gapsTitle: "Not measured yet",
  gapsSub:
    "Layers the 2026-09-09 dual-funnel analysis produced by hand. Each is a judgement about a conversation, so it needs a field the sync routine writes — listed here rather than approximated.",
  needs: "Needs:",
  footer: (mode: string, when: string) => `Store read in ${mode} mode · last refreshed ${when}`,
  footerLocal: "a local checkout (not pulled)",
};

const FUNNEL_ZH: typeof FUNNEL_EN = {
  title: "SOP Agent 漏斗",
  subtitle:
    "Agent Platform 的客户漏斗，从 engagement store 现算——就是 ClickUp 客户看板所镜像的那个 markdown 仓库，每 5 分钟拉一次。本页没有任何一个数字是手填的。",
  refresh: "刷新",
  staleStore: (why: string) => `显示的是上一次成功拉到的副本——最近一次 pull 失败：${why}`,
  tileClients: "库里的客户数",
  tileClientsHint: "全部 profile，不分档位",
  tileQualified: "已合格（qualifying 及以上）",
  tileQualifiedHint: "愿意继续推进——记分卡 P1",
  tileCalls: "本周 SOP Agent 通话",
  tileCallsHint: (all: number) => `本周共开了 ${all} 个外部会——P2`,
  tileFresh: "管道新鲜度",
  tileFreshHint: (fresh: number, active: number) => `${active} 个在谈客户中 ${fresh} 个 7 天内有动作——P3`,
  tileStalled: "卡在 Met",
  tileStalledHint: (d: number) => `${d} 天以上没有动静`,
  ladderTitle: "阶段阶梯",
  ladderSub:
    "每一档就是一个客户阶段，直接取自各 profile 的 `stage:`——ClickUp 看板镜像的正是这个字段，所以这里的数和看板的列是同一次测量。百分比是相对上一档的转化。",
  exits: "出口：",
  committedTag: "committed 标签",
  meetingsTitle: "已开的客户会",
  meetingsSub: (held: number, relevant: number, clients: number) =>
    `已开外部会 ${held} 个，其中 ${relevant} 个被判为与 SOP Agent 相关，覆盖 ${clients} 家客户。relevance 是同步例程自己对每个会的判断——是库里最接近「实质性推介」的字段，但不等同于它。`,
  legendRelevant: "SOP Agent 相关",
  legendOther: "其它客户会",
  handoffTitle: "Handoff note 闸门（qualifying → acquisition）",
  handoffSub: (gate: number, started: number) =>
    `已开始填写的 ${started} 份 note 中，${gate} 份七个必填项齐了——这是卡片进入 Acquisition 的明文准入条件。`,
  handoffEmpty: "还没有任何一份 handoff note 填了内容。",
  colClient: "客户",
  colStage: "阶段",
  colRequired: "必填（7）",
  colAll: "全部（13）",
  colDomain: "域名",
  colIdle: "闲置",
  stalledTitle: (d: number) => `卡在 Met — 超过 ${d} 天`,
  stalledSub:
    "已经谈过、但最近一次有动作的日期已经旧了的客户。在看板上他们和其他所有 Met 的客户挤在同一列里——这正是他们容易被丢掉的原因。",
  stalledEmpty: "没有卡住的。",
  never: "无日期",
  days: (n: number) => `${n} 天`,
  andMore: (n: number) => `另有 ${n} 家`,
  mailTitle: "外呼批次",
  mailSub: (accounts: number) => `发送台账上共 ${accounts} 个不重复账户。`,
  sent: (n: number) => `发出 ${n} 封`,
  gapsTitle: "还测不到的层",
  gapsSub:
    "这些是 2026-09-09 那份双漏斗分析靠人工判出来的层。每一层判的都是「一次对话」，所以需要同步例程写一个字段——列在这里，而不是拿相近的东西凑一个数。",
  needs: "需要：",
  footer: (mode: string, when: string) => `store 读取方式：${mode} · 最近刷新 ${when}`,
  footerLocal: "本地 checkout（不拉取）",
};

const FUNNEL: Record<Lang, typeof FUNNEL_EN> = { en: FUNNEL_EN, zh: FUNNEL_ZH };

export function useFunnelT(): typeof FUNNEL_EN {
  return FUNNEL[useLang()];
}

/* ── group labels (server sends English) ── */

const GROUP_ZH: Record<string, string> = {
  sap: "SOP Agent Platform",
  tqa: "TicketQA",
  sentiment_max: "Sentiment Max",
  triage: "AI Triage",
  ticket_intake: "Ticket Intake",
  bi: "BI",
  bot: "Bot",
  next_ticket: "NextTicket",
  attendance: "Attendance",
  asset_library: "资产库",
  micus_hop: "产品负责人（HoP）",
};

export function groupLabel(key: string, fallback: string, l: Lang): string {
  return l === "zh" ? (GROUP_ZH[key] ?? fallback) : fallback;
}
