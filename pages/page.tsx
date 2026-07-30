import { useMemo, useState } from "react";
import { Alert, AlertDescription, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Separator, Skeleton, cn } from "@mspbots/ui";
import { AlertTriangle, CircleHelp, RefreshCw } from "lucide-react";
import { Delta, LangToggle, NoteHint, STATUS_META, Sparkline, StatTile, StatusChip } from "../lib/board";
import { RowDetailDialog } from "../lib/row-dialog";
import { groupLabel, rowName, rowNote, rowTarget, useLang, useT } from "../lib/i18n";
import { formatValue, useScorecard, type ScorecardRow } from "../lib/scorecard-client";

export const meta = {
  label: "L10 Board",
  icon: "Gauge",
  order: 1,
  menu: true,
  description: "Weekly product scorecard for the Product-Platform L10 — reds first, each with named tenants.",
};

function Rows({ rows, groups, onSelect }: { rows: ScorecardRow[]; groups: Record<string, string>; onSelect: (row: ScorecardRow) => void }) {
  const t = useT();
  const lang = useLang();
  return (
    <div>
      {/* column header */}
      <div className="grid grid-cols-[88px_1fr_92px_150px_72px_88px] items-center gap-3 border-b px-5 pb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground max-lg:hidden">
        <div>{t.status}</div>
        <div>{t.metric}</div>
        <div>{t.owner}</div>
        <div className="text-right">{`${t.value} / ${t.lastWeek}`}</div>
        <div />
        <div>{t.target}</div>
      </div>
      {rows.map((row) => {
        const note = rowNote(row.id, row.note, lang);
        const reason = row.status === "nodata" ? rowNote(row.id, row.reason, lang) ?? row.reason : row.reason;
        return (
          <div
            key={row.id}
            onClick={() => onSelect(row)}
            className={cn(
              "grid cursor-pointer grid-cols-[88px_1fr_92px_150px_72px_88px] items-center gap-3 border-b border-l-2 px-5 py-2.5 transition-colors last:border-b-0 hover:bg-muted/40 max-lg:grid-cols-[80px_1fr_100px]",
              STATUS_META[row.status].row,
              row.status === "red" && "bg-red-500/[0.04] hover:bg-red-500/[0.08]",
            )}
          >
            <StatusChip status={row.status} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-medium">{rowName(row.id, row.name, lang)}</span>
                {note && (
                  <NoteHint note={note}>
                    <CircleHelp className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                  </NoteHint>
                )}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {row.id} · {groupLabel(row.group, groups[row.group] ?? row.group, lang)}
              </div>
              {row.names && row.names.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {row.names.map((n) => (
                    <Badge key={n} variant="outline" className="h-5 px-1.5 text-[11px] font-normal text-muted-foreground">
                      {n}
                    </Badge>
                  ))}
                </div>
              )}
              {reason && row.status !== "red" && (
                <div className="mt-1 max-w-2xl text-[11px] italic leading-relaxed text-muted-foreground/80">{reason}</div>
              )}
            </div>
            <div className="text-xs text-muted-foreground max-lg:text-right">
              {row.owner ?? <span className="italic">{t.unowned}</span>}
            </div>
            <div className="flex items-baseline justify-end gap-2 max-lg:hidden">
              <span className="font-mono text-sm font-semibold tabular-nums">{formatValue(row)}</span>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {row.previous == null ? "—" : formatValue({ ...row, value: row.previous })}
              </span>
              <Delta row={row} />
            </div>
            <div className="max-lg:hidden">
              <Sparkline row={row} />
            </div>
            <div className="text-[11px] leading-tight text-muted-foreground max-lg:hidden">
              {rowTarget(row.id, row.targetText, lang)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Section({
  title,
  sub,
  rows,
  groups,
  tone,
  empty,
  onSelect,
}: {
  title: string;
  sub?: string;
  rows: ScorecardRow[];
  groups: Record<string, string>;
  tone?: "red" | "dashed";
  empty?: string;
  onSelect: (row: ScorecardRow) => void;
}) {
  return (
    <Card className={cn(tone === "red" && "border-red-500/30", tone === "dashed" && "border-dashed")}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        {sub && <CardDescription className="text-xs">{sub}</CardDescription>}
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {rows.length ? (
          <Rows rows={rows} groups={groups} onSelect={onSelect} />
        ) : (
          <p className="px-5 pb-4 text-sm text-muted-foreground">{empty}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function L10Board() {
  const { data, error, loading, reload, fetchedAt } = useScorecard();
  const t = useT();
  const [selected, setSelected] = useState<ScorecardRow | null>(null);

  const view = useMemo(() => {
    if (!data) return null;
    const rows = data.rows;
    const judged = rows.filter((r) => r.status !== "display");
    return {
      act: rows.filter((r) => r.status === "red" || r.status === "yellow"),
      ok: rows.filter((r) => r.status === "green"),
      trend: rows.filter((r) => r.status === "display"),
      gaps: rows.filter((r) => r.status === "nodata"),
      reds: rows.filter((r) => r.status === "red").length,
      greens: rows.filter((r) => r.status === "green").length,
      coverage: judged.length
        ? Math.round(((judged.length - rows.filter((r) => r.status === "nodata").length) / judged.length) * 100)
        : null,
      onTrack: rows.find((r) => r.id === "H3")?.value ?? null,
    };
  }, [data]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t.boardTitle}</h1>
          <p className="text-sm text-muted-foreground">
            {t.boardSubtitle}
            {data?.week && <span className="ml-1 text-muted-foreground/80">{t.weekOf(data.week)}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {fetchedAt != null && (
            <span className="text-[11px] text-muted-foreground">
              {t.updatedAt(new Date(fetchedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))}
            </span>
          )}
          <LangToggle />
          <Button variant="outline" size="sm" onClick={reload} disabled={loading}>
            <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", loading && "animate-spin")} />
            {t.refresh}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && !data && (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[86px] w-full" />
            ))}
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {view && data && (
        <>
          {/* KPI row — stat tiles, not charts */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile label={t.redsTile} value={view.reds} tone={view.reds > 0 ? "red" : "green"} hint={t.redsTileHint} />
            <StatTile label={t.greensTile} value={view.greens} tone="green" />
            <StatTile label={t.coverageTile} value={view.coverage != null ? `${view.coverage}%` : "—"} hint={t.coverageHint} />
            <StatTile label={t.onTrackTile} value={view.onTrack != null ? `${view.onTrack}%` : "—"} hint={t.onTrackHint} />
          </div>

          <Section title={t.actNow} sub={t.actNowSub} rows={view.act} groups={data.groups} tone="red" empty={t.actNowEmpty} onSelect={setSelected} />
          <Section title={t.onTrack} rows={view.ok} groups={data.groups} empty={t.onTrackEmpty} onSelect={setSelected} />
          <Section title={t.trends} sub={t.trendsSub} rows={view.trend} groups={data.groups} onSelect={setSelected} />
          <Section title={t.gaps(view.gaps.length)} sub={t.gapsSub} rows={view.gaps} groups={data.groups} tone="dashed" onSelect={setSelected} />

          <RowDetailDialog row={selected} groups={data.groups} onClose={() => setSelected(null)} />

          {data.sources.length > 0 && (
            <>
              <Separator />
              <div className="space-y-1 pb-2 text-[11px] text-muted-foreground">
                {data.sources.map((s) => (
                  <div key={s.dataset} className="font-mono">
                    {t.sources}: {s.dataset} — {s.ok ? `${s.rows} ${t.rows}` : `${t.failed}: ${s.error}`}
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
