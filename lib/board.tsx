// Shared presentation pieces for the scorecard pages. Follows the dataviz skill's rules for a
// status board: status = dot + text (never color alone), stat-tile contract for the KPI row,
// tabular figures in columns, delta color = direction × whether up is good.

import type { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger, cn } from "@mspbots/ui";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { STATUS_LABEL, setLang, useLang } from "./i18n";
import { upIsGood, type RowStatus, type ScorecardRow } from "./scorecard-client";

/* ── status: reserved traffic-light styles, always dot + label ── */

export const STATUS_META: Record<RowStatus, { dot: string; text: string; row?: string }> = {
  red: { dot: "bg-red-500", text: "text-red-700 dark:text-red-400", row: "border-l-red-500" },
  yellow: { dot: "bg-amber-500", text: "text-amber-700 dark:text-amber-400", row: "border-l-amber-500" },
  green: { dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400", row: "border-l-emerald-500" },
  display: { dot: "bg-muted-foreground/50", text: "text-muted-foreground", row: "border-l-transparent" },
  nodata: { dot: "border border-dashed border-muted-foreground/60 bg-transparent", text: "text-muted-foreground/80", row: "border-l-transparent" },
};

export function StatusChip({ status, className }: { status: RowStatus; className?: string }) {
  const lang = useLang();
  const m = STATUS_META[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium", m.text, className)}>
      <span className={cn("h-2 w-2 shrink-0 rounded-full", m.dot)} />
      {STATUS_LABEL[lang][status]}
    </span>
  );
}

/* ── delta: signed, vs last week; color = direction × whether up is good ── */

export function Delta({ row }: { row: ScorecardRow }) {
  if (row.value == null || row.previous == null) return null;
  const diff = row.value - row.previous;
  if (diff === 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" />
      </span>
    );
  // For these rows "up" is good except for the silent/undispositioned counts (lte-0 rows).
  const good = diff > 0 === upIsGood(row);
  const Icon = diff > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium tabular-nums",
        good ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400",
      )}
    >
      <Icon className="h-3 w-3" />
      {diff > 0 ? "+" : ""}
      {Math.round(diff * 10) / 10}
    </span>
  );
}

/* ── stat tile: label · value (semibold, compact) · hint / delta ── */

export function StatTile({
  label,
  value,
  hint,
  tone,
  extra,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "red" | "green" | "neutral";
  extra?: ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-1 text-2xl font-semibold leading-none tracking-tight tabular-nums",
          tone === "red" && "text-red-700 dark:text-red-400",
          tone === "green" && "text-emerald-700 dark:text-emerald-400",
        )}
      >
        {value}
      </div>
      <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
        {hint}
        {extra}
      </div>
    </div>
  );
}

/* ── language toggle: EN / 中 segmented, persisted ── */

export function LangToggle({ className }: { className?: string }) {
  const lang = useLang();
  const seg = (value: "en" | "zh", label: string) => (
    <button
      type="button"
      onClick={() => setLang(value)}
      aria-pressed={lang === value}
      className={cn(
        "rounded px-2 py-0.5 text-xs font-medium transition-colors",
        lang === value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
  return (
    <div className={cn("inline-flex items-center gap-0.5 rounded-md border bg-muted p-0.5", className)}>
      {seg("en", "EN")}
      {seg("zh", "中")}
    </div>
  );
}

/* ── owner load meter: accountable rows against the agreed 3–7 band ── */

export function LoadMeter({ count }: { count: number }) {
  const MAX = 10; // scale cap for drawing; the band is 3–7
  const pct = Math.min(count, MAX) / MAX;
  const over = count > 7;
  return (
    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
      {/* the agreed band, as a lighter step of the same ramp */}
      <div className="absolute inset-y-0 bg-emerald-500/15" style={{ left: "30%", width: "40%" }} />
      <div
        className={cn("absolute inset-y-0 left-0 rounded-full", over ? "bg-amber-500" : "bg-emerald-500")}
        style={{ width: `${pct * 100}%` }}
      />
    </div>
  );
}

/* ── info hint with tooltip ── */

export function NoteHint({ note, children }: { note: string; children: ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent className="max-w-sm text-xs leading-relaxed">{note}</TooltipContent>
    </Tooltip>
  );
}

/* ── sparkline: 2px line in the de-emphasis hue, current point accented; hover = the table view ── */

export function Sparkline({ row, width = 72, height = 22 }: { row: ScorecardRow; width?: number; height?: number }) {
  const h = row.history;
  if (!h || h.length < 2) return <span className="inline-block" style={{ width }} />;

  const values = h.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = 3;
  const x = (i: number) => pad + (i * (width - pad * 2)) / (h.length - 1);
  const y = (v: number) => (max === min ? height / 2 : pad + ((max - v) * (height - pad * 2)) / (max - min));
  const path = h.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const last = h[h.length - 1];
  const good = h.length > 1 ? (last.value - h[h.length - 2].value > 0) === upIsGood(row) : true;
  const flat = last.value === h[h.length - 2].value;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <svg width={width} height={height} className="shrink-0 overflow-visible" role="img" aria-label={`${h.length} week history`}>
          <path d={path} fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-muted-foreground/40" />
          <circle
            cx={x(h.length - 1)}
            cy={y(last.value)}
            r="2.5"
            className={cn(
              flat ? "fill-muted-foreground" : good ? "fill-emerald-500" : "fill-red-500",
            )}
          />
        </svg>
      </TooltipTrigger>
      <TooltipContent className="p-2">
        <table className="text-xs tabular-nums">
          <tbody>
            {h.map((p) => (
              <tr key={p.week}>
                <td className="pr-3 text-muted-foreground">{p.week}</td>
                <td className="text-right font-medium">
                  {p.value}
                  {row.unit === "percent" ? "%" : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TooltipContent>
    </Tooltip>
  );
}
