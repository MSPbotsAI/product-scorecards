import { useMemo } from "react";
import {
  Alert,
  AlertDescription,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
  cn,
} from "@mspbots/ui";
import { AlertTriangle } from "lucide-react";
import { STATUS_STYLE, formatValue, useScorecard, type ScorecardRow } from "../../lib/scorecard-client";

export const meta = {
  label: "By Owner",
  icon: "Users",
  order: 2,
  menu: true,
  description: "Each person's rows — one owner per number, 3–7 numbers per owner.",
};

/** Frank carries the whole sustain portfolio, so his card is expected to aggregate. */
const EXPECTED_RANGE = { min: 3, max: 7 };

function OwnerCard({ owner, rows, groups }: { owner: string; rows: ScorecardRow[]; groups: Record<string, string> }) {
  const reds = rows.filter((r) => r.status === "red").length;
  const accountable = rows.filter((r) => r.status !== "display");
  const overloaded = accountable.length > EXPECTED_RANGE.max;

  return (
    <Card className={reds > 0 ? "border-destructive/40" : undefined}>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{owner}</CardTitle>
          <div className="flex items-center gap-1.5">
            {reds > 0 && <Badge variant="destructive">{reds} red</Badge>}
            <Badge variant="outline">{accountable.length} accountable</Badge>
          </div>
        </div>
        <CardDescription>
          {overloaded
            ? `${accountable.length} accountable rows — above the 3–7 the workshop agreed per owner. Consider aggregating.`
            : `Within the agreed 3–7 rows per owner.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {rows.map((row) => {
          const s = STATUS_STYLE[row.status];
          return (
            <div key={row.id} className="flex items-center gap-2 rounded-md border bg-card px-3 py-2">
              <Badge variant={s.variant} className={cn("w-[86px] shrink-0 justify-center", s.className)}>
                {s.label}
              </Badge>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm">{row.name}</div>
                <div className="text-xs text-muted-foreground">
                  {row.id} · {groups[row.group] ?? row.group} · target {row.targetText}
                </div>
              </div>
              <div className="shrink-0 font-mono text-sm tabular-nums">{formatValue(row)}</div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default function ByOwner() {
  const { data, error, loading } = useScorecard();

  const byOwner = useMemo(() => {
    if (!data) return null;
    const map = new Map<string, ScorecardRow[]>();
    for (const row of data.rows) {
      const key = row.owner ?? "Unowned — escalates to L10 IDS";
      const list = map.get(key);
      if (list) list.push(row);
      else map.set(key, [row]);
    }
    // People first, the unowned monitoring bucket last.
    return [...map.entries()].sort(([a], [b]) =>
      a.startsWith("Unowned") ? 1 : b.startsWith("Unowned") ? -1 : a.localeCompare(b),
    );
  }, [data]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">By owner</h1>
        <p className="text-sm text-muted-foreground">
          One owner per number. Asset rows are deliberately unowned — a red there goes to IDS for on-the-spot
          assignment rather than to a person.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && !data && (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full" />
          ))}
        </div>
      )}

      {byOwner && (
        <div className="grid gap-4 lg:grid-cols-2">
          {byOwner.map(([owner, rows]) => (
            <OwnerCard key={owner} owner={owner} rows={rows} groups={data!.groups} />
          ))}
        </div>
      )}
    </div>
  );
}
