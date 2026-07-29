import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  cn,
} from "@mspbots/ui";
import { AlertTriangle, CircleHelp, RefreshCw } from "lucide-react";
import { STATUS_STYLE, formatValue, useScorecard, type ScorecardRow } from "../lib/scorecard-client";

export const meta = {
  label: "L10 Board",
  icon: "Gauge",
  order: 1,
  menu: true,
  description: "Weekly product scorecard for the Product-Platform L10 — reds first, each with named tenants.",
};

function StatusBadge({ row }: { row: ScorecardRow }) {
  const s = STATUS_STYLE[row.status];
  return (
    <Badge variant={s.variant} className={cn("shrink-0", s.className)}>
      {s.label}
    </Badge>
  );
}

function RowsTable({ rows, groups }: { rows: ScorecardRow[]; groups: Record<string, string> }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[92px]">Status</TableHead>
          <TableHead>Metric</TableHead>
          <TableHead className="w-[120px]">Owner</TableHead>
          <TableHead className="w-[110px] text-right">Value</TableHead>
          <TableHead className="w-[110px] text-right">Last week</TableHead>
          <TableHead className="w-[220px]">Target</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id} className={row.status === "red" ? "bg-destructive/5" : undefined}>
            <TableCell>
              <StatusBadge row={row} />
            </TableCell>
            <TableCell>
              <div className="flex items-start gap-1.5">
                <div>
                  <div className="font-medium">{row.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {row.id} · {groups[row.group] ?? row.group}
                  </div>
                  {row.names && row.names.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {row.names.map((n) => (
                        <Badge key={n} variant="outline" className="font-normal">
                          {n}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {row.reason && <div className="mt-1 max-w-xl text-xs text-muted-foreground italic">{row.reason}</div>}
                </div>
                {row.note && !row.reason && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CircleHelp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">{row.note}</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </TableCell>
            <TableCell>
              {row.owner ?? <span className="text-muted-foreground italic">unowned → IDS</span>}
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums">{formatValue(row)}</TableCell>
            <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
              {row.previous == null ? "—" : formatValue({ ...row, value: row.previous })}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">{row.targetText}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function L10Board() {
  const { data, error, loading, reload } = useScorecard();

  const sections = useMemo(() => {
    if (!data) return null;
    const rows = data.rows;
    return {
      act: rows.filter((r) => r.status === "red" || r.status === "yellow"),
      ok: rows.filter((r) => r.status === "green"),
      trend: rows.filter((r) => r.status === "display"),
      gaps: rows.filter((r) => r.status === "nodata"),
    };
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Product Team Scorecard</h1>
          <p className="text-sm text-muted-foreground">
            Weekly operating pulse for the Product-Platform L10.
            {data?.week && <> Week of {data.week} (weeks start Monday).</>}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={reload} disabled={loading}>
          <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && !data && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      )}

      {sections && (
        <>
          <Card className="border-destructive/40">
            <CardHeader>
              <CardTitle className="text-base">Needs a decision this week</CardTitle>
              <CardDescription>
                Reds and yellows, named. A red with no owner escalates to IDS on the spot. Every row here must
                produce an action whose effect is visible next week.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              {sections.act.length ? (
                <RowsTable rows={sections.act} groups={data!.groups} />
              ) : (
                <p className="px-6 text-sm text-muted-foreground">Nothing red or yellow this week.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">On track</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              {sections.ok.length ? (
                <RowsTable rows={sections.ok} groups={data!.groups} />
              ) : (
                <p className="px-6 text-sm text-muted-foreground">No green rows yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trends — display only</CardTitle>
              <CardDescription>
                Never red or green by design: on-track share and observation-period ROI rows are not
                accountability numbers.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <RowsTable rows={sections.trend} groups={data!.groups} />
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-base">Not measured yet — {sections.gaps.length} rows</CardTitle>
              <CardDescription>
                Shown deliberately rather than rendered as zero. A missing source is a gap to close, not a
                failing number.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <RowsTable rows={sections.gaps} groups={data!.groups} />
            </CardContent>
          </Card>

          {data!.sources.length > 0 && (
            <>
              <Separator />
              <div className="space-y-1 text-xs text-muted-foreground">
                {data!.sources.map((s) => (
                  <div key={s.dataset} className="font-mono">
                    dataset {s.dataset}: {s.ok ? `${s.rows} rows` : `failed — ${s.error}`}
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
