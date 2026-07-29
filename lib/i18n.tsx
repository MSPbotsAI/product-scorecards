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
      "One owner per number. Asset rows are deliberately unowned — a red there goes to IDS for on-the-spot assignment rather than to a person.",
    accountable: "accountable",
    red: "red",
    loadBand: (n: number) => `${n} accountable rows — the workshop agreed 3–7 per owner`,
    loadOver: "above the 3–7 band, consider aggregating",
    loadOk: "within the 3–7 band",
    unownedBucket: "Unowned — escalates to L10 IDS",
    // product cards page
    productsTitle: "Product cards",
    productsSubtitle:
      "Twelve products on two axes — business stage (Explore / Grow / Sustain / Sunset) and release stage. Cards for MPD and the CSM internal tool are Kevin's to define and are not rendered yet.",
    firstLine: "first line",
    noSourceRows: (n: number, total: number) => `${n} of ${total} rows have no source yet`,
    monitoringOnly: "monitoring only",
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
    ownerSubtitle: "一数一主。资产行有意不设负责人——红灯直接进 IDS 现场指派，而不是压给某个人。",
    accountable: "问责行",
    red: "红",
    loadBand: (n: number) => `${n} 行问责 — workshop 约定每人 3–7 行`,
    loadOver: "超出 3–7 区间，考虑聚合",
    loadOk: "在 3–7 区间内",
    unownedBucket: "无主 — 升级至 L10 IDS",
    productsTitle: "产品卡",
    productsSubtitle:
      "12 个产品按双轴定位——业务轴（Explore / Grow / Sustain / Sunset）与发布轴。MPD 与 CSM 内部工具由 Kevin 自定，暂不渲染。",
    firstLine: "一线",
    noSourceRows: (n: number, total: number) => `${total} 行中 ${n} 行暂无数据源`,
    monitoringOnly: "仅监控",
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

/* ── group labels (server sends English) ── */

const GROUP_ZH: Record<string, string> = {
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
