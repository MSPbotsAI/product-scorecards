// The per-row detail dialog: full definition, weekly history as a table (the chart's table view),
// named tenants, and which dataset the number came from. Opened by clicking any row.

import { useEffect, useState } from "react";
import { Badge, Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Input, Separator, cn, root } from "@mspbots/ui";
import { CheckCircle2, Save } from "lucide-react";
import { Delta, Sparkline, StatusChip, STATUS_META } from "./board";
import { groupLabel, rowName, rowNote, rowTarget, useLang, useT } from "./i18n";
import { recentThursdays } from "./manual-weeks";
import { bandStatus, formatValue, upIsGood, type ScorecardRow } from "./scorecard-client";

/** Which dataset feeds which rows (see scorecard/data-map.md). Client-side map for display only. */
const SOURCES: { ids: string[]; dataset: string; label: string }[] = [
  { ids: ["T1", "SM1", "TR1", "I2"], dataset: "2082481324433739777", label: "Product Scorecard AI Weekly" },
  { ids: ["T4", "SM2", "TR2", "I3"], dataset: "1985255723050872834", label: "Paying AI Credit Consumption" },
  {
    ids: ["BI1", "BI2", "BO1", "BO2", "N1", "N2", "N4", "A1", "A2", "BI-ENG", "BOT-ENG", "NEXT_TICKET-ENG", "ATTENDANCE-ENG"],
    dataset: "2082466110929776641",
    label: "Product Scorecard Weekly Metrics",
  },
];

function sourceOf(id: string) {
  return SOURCES.find((s) => s.ids.includes(id)) ?? null;
}

export function RowDetailDialog({
  row,
  groups,
  onClose,
  onSaved,
}: {
  row: ScorecardRow | null;
  groups: Record<string, string>;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const t = useT();
  const lang = useLang();
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [thresholdDraft, setThresholdDraft] = useState({ target: "", yellowMin: "" });
  const [thresholdSaving, setThresholdSaving] = useState(false);
  const [thresholdSaveError, setThresholdSaveError] = useState<string | null>(null);
  const [thresholdSaved, setThresholdSaved] = useState(false);

  // Reset the edit draft whenever a different row is opened.
  useEffect(() => {
    setDraft({});
    setSaving(false);
    setSaveError(null);
    setSaved(false);
    setThresholdDraft({ target: String(row?.target ?? ""), yellowMin: String(row?.yellowMin ?? "") });
    setThresholdSaving(false);
    setThresholdSaveError(null);
    setThresholdSaved(false);
  }, [row?.id]);

  if (!row) return null;

  const note = rowNote(row.id, row.note, lang);
  const reason = row.reason && row.reason !== note ? row.reason : null;
  const source = sourceOf(row.id);
  const history = row.history ?? [];
  // Newest first for scanning; Δ computed against the chronologically prior point.
  const table = [...history]
    .map((p, i) => ({ ...p, diff: i > 0 ? p.value - history[i - 1].value : null }))
    .reverse();

  // Manual rows (Kevin's Evolve MPD card, today): every Thursday since last week, plus any older
  // recorded week so nothing already logged ever disappears from view.
  const manualWeeks =
    row.kind === "manual"
      ? [...new Set([...recentThursdays(14), ...history.map((p) => p.week)])].sort().reverse()
      : [];
  const valueFor = (week: string) => draft[week] ?? String(history.find((p) => p.week === week)?.value ?? "");

  const saveManual = async () => {
    const values = manualWeeks
      .map((week) => ({ week, value: valueFor(week).trim() }))
      .filter((v) => v.value !== "")
      .map((v) => ({ week: v.week, value: Number(v.value) }));
    if (!values.length) return;
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      const res = await $fetch(`/api/manual-metrics/${row.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? `save failed (${res.status})`);
      setDraft({});
      setSaved(true);
      onSaved?.();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "failed to save");
    } finally {
      setSaving(false);
    }
  };

  const saveThreshold = async () => {
    const target = Number(thresholdDraft.target.trim());
    const yellowMinRaw = thresholdDraft.yellowMin.trim();
    if (!Number.isInteger(target) || target < 0) {
      setThresholdSaveError("target must be a whole number, 0 or higher");
      return;
    }
    const yellowMin = yellowMinRaw === "" ? null : Number(yellowMinRaw);
    setThresholdSaving(true);
    setThresholdSaveError(null);
    setThresholdSaved(false);
    try {
      const res = await $fetch(`/api/metric-thresholds/${row.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, yellowMin }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? `save failed (${res.status})`);
      setThresholdSaved(true);
      onSaved?.();
    } catch (err) {
      setThresholdSaveError(err instanceof Error ? err.message : "failed to save");
    } finally {
      setThresholdSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent container={root()} className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <StatusChip status={row.status} />
            <span className="text-[11px] text-muted-foreground">
              {row.id} · {groupLabel(row.group, groups[row.group] ?? row.group, lang)}
              {row.owner ? ` · ${row.owner}` : ""}
            </span>
          </div>
          <DialogTitle className="text-base leading-snug">{rowName(row.id, row.name, lang)}</DialogTitle>
          <DialogDescription className="text-xs">
            {t.target}: {rowTarget(row.id, row.targetText, lang)}
          </DialogDescription>
        </DialogHeader>

        {/* current reading */}
        <div className="flex items-end justify-between gap-4 rounded-lg border bg-muted/30 px-4 py-3">
          <div>
            <div className="text-[11px] text-muted-foreground">
              {t.value} / {t.lastWeek}
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span
                className={cn(
                  "text-3xl font-semibold leading-none tracking-tight tabular-nums",
                  row.status === "red" && "text-red-700 dark:text-red-400",
                  row.status === "green" && "text-emerald-700 dark:text-emerald-400",
                )}
              >
                {formatValue(row)}
              </span>
              <span className="font-mono text-sm tabular-nums text-muted-foreground">
                {row.previous == null ? "—" : formatValue({ ...row, value: row.previous })}
              </span>
              <Delta row={row} />
            </div>
          </div>
          <Sparkline row={row} width={150} height={44} />
        </div>

        {/* weekly history / manual entry */}
        {row.kind === "manual" ? (
          <div>
            {row.thresholdEditable && (
              <div className="mb-3 rounded-md border bg-muted/30 p-3">
                <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t.thresholdEditTitle}</div>
                <div className="flex flex-wrap items-end gap-3">
                  <label className="flex flex-col gap-1 text-[11px] text-muted-foreground">
                    {t.thresholdGreenLabel}
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={thresholdDraft.target}
                      onChange={(e) => setThresholdDraft((d) => ({ ...d, target: e.target.value }))}
                      className="h-7 w-20"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-[11px] text-muted-foreground">
                    {t.thresholdYellowLabel}
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={thresholdDraft.yellowMin}
                      onChange={(e) => setThresholdDraft((d) => ({ ...d, yellowMin: e.target.value }))}
                      className="h-7 w-20"
                    />
                  </label>
                  <Button size="sm" variant="outline" onClick={saveThreshold} disabled={thresholdSaving}>
                    <Save className={cn("mr-1.5 h-3.5 w-3.5", thresholdSaving && "animate-pulse")} />
                    {t.thresholdSave}
                  </Button>
                  {thresholdSaved && !thresholdSaveError && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {t.thresholdSaved}
                    </span>
                  )}
                  {thresholdSaveError && (
                    <span className="text-xs text-red-700 dark:text-red-400">
                      {t.thresholdSaveError}: {thresholdSaveError}
                    </span>
                  )}
                </div>
              </div>
            )}
            <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t.manualEditTitle}</div>
            <p className="mb-1.5 text-[11px] text-muted-foreground">{t.manualEditHint}</p>
            <div className="max-h-52 overflow-y-auto rounded-md border">
              <table className="w-full text-xs tabular-nums">
                <thead className="sticky top-0 bg-muted/80 text-muted-foreground backdrop-blur">
                  <tr>
                    <th className="px-3 py-1.5 text-left font-medium">{t.weekCol}</th>
                    <th className="px-3 py-1.5 text-right font-medium">{t.value}</th>
                    <th className="w-8 px-3 py-1.5" />
                  </tr>
                </thead>
                <tbody>
                  {manualWeeks.map((week) => {
                    const current = valueFor(week);
                    const status = bandStatus(current.trim() === "" ? null : Number(current), row);
                    return (
                      <tr key={week} className="border-t">
                        <td className="px-3 py-1.5 text-muted-foreground">{week}</td>
                        <td className="px-3 py-1.5 text-right">
                          <Input
                            type="number"
                            min={0}
                            step={1}
                            value={current}
                            onChange={(e) => setDraft((d) => ({ ...d, [week]: e.target.value }))}
                            className="ml-auto h-7 w-20 text-right"
                          />
                        </td>
                        <td className="px-3 py-1.5">
                          <span className={cn("mx-auto block h-2 w-2 rounded-full", STATUS_META[status].dot)} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <Button size="sm" onClick={saveManual} disabled={saving}>
                <Save className={cn("mr-1.5 h-3.5 w-3.5", saving && "animate-pulse")} />
                {t.manualSave}
              </Button>
              {saved && !saveError && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {t.manualSaved}
                </span>
              )}
              {saveError && (
                <span className="text-xs text-red-700 dark:text-red-400">
                  {t.manualSaveError}: {saveError}
                </span>
              )}
            </div>
          </div>
        ) : (
        <div>
          <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t.detailHistory}</div>
          {table.length ? (
            <div className="max-h-52 overflow-y-auto rounded-md border">
              <table className="w-full text-xs tabular-nums">
                <thead className="sticky top-0 bg-muted/80 text-muted-foreground backdrop-blur">
                  <tr>
                    <th className="px-3 py-1.5 text-left font-medium">{t.weekCol}</th>
                    <th className="px-3 py-1.5 text-right font-medium">{t.value}</th>
                    <th className="px-3 py-1.5 text-right font-medium">{t.changeCol}</th>
                  </tr>
                </thead>
                <tbody>
                  {table.map((p) => (
                    <tr key={p.week} className="border-t">
                      <td className="px-3 py-1.5 text-muted-foreground">{p.week}</td>
                      <td className="px-3 py-1.5 text-right font-medium">
                        {p.value}
                        {row.unit === "percent" ? "%" : ""}
                      </td>
                      <td
                        className={cn(
                          "px-3 py-1.5 text-right",
                          p.diff == null || p.diff === 0
                            ? "text-muted-foreground/60"
                            : (p.diff > 0) === upIsGood(row)
                              ? "text-emerald-700 dark:text-emerald-400"
                              : "text-red-700 dark:text-red-400",
                        )}
                      >
                        {p.diff == null ? "—" : `${p.diff > 0 ? "+" : ""}${Math.round(p.diff * 10) / 10}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs italic text-muted-foreground">{t.noHistory}</p>
          )}
        </div>
        )}

        {/* named tenants */}
        {row.names && row.names.length > 0 && (
          <div>
            <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t.detailNames}</div>
            <div className="flex flex-wrap gap-1">
              {row.names.map((n) => (
                <Badge key={n} variant="outline" className="h-5 px-1.5 text-[11px] font-normal text-muted-foreground">
                  {n}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* definition & notes */}
        {(note || reason) && (
          <div>
            <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t.detailNotes}</div>
            {note && <p className="text-xs leading-relaxed text-muted-foreground">{note}</p>}
            {reason && <p className="mt-1 text-xs italic leading-relaxed text-muted-foreground/80">{reason}</p>}
          </div>
        )}

        <Separator />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          <span>
            {t.detailSource}:{" "}
            {row.kind === "manual" ? (
              <span className="italic">{t.manuallyEntered}</span>
            ) : source ? (
              <span className="font-mono">
                {source.label} ({source.dataset})
              </span>
            ) : (
              <span className="italic">{t.noSourceYet}</span>
            )}
          </span>
          {row.anchor && (
            <span>
              {t.detailAnchor}: <span className="font-mono">{row.anchor}</span>
            </span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
