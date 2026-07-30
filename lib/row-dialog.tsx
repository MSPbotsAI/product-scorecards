// The per-row detail dialog: full definition, weekly history as a table (the chart's table view),
// named tenants, and which dataset the number came from. Opened by clicking any row.

import { Badge, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Separator, cn, root } from "@mspbots/ui";
import { Delta, Sparkline, StatusChip } from "./board";
import { groupLabel, rowName, rowNote, rowTarget, useLang, useT } from "./i18n";
import { formatValue, upIsGood, type ScorecardRow } from "./scorecard-client";

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
}: {
  row: ScorecardRow | null;
  groups: Record<string, string>;
  onClose: () => void;
}) {
  const t = useT();
  const lang = useLang();
  if (!row) return null;

  const note = rowNote(row.id, row.note, lang);
  const reason = row.reason && row.reason !== note ? row.reason : null;
  const source = sourceOf(row.id);
  const history = row.history ?? [];
  // Newest first for scanning; Δ computed against the chronologically prior point.
  const table = [...history]
    .map((p, i) => ({ ...p, diff: i > 0 ? p.value - history[i - 1].value : null }))
    .reverse();

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

        {/* weekly history */}
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
            {source ? (
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
