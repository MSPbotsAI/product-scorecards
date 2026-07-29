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
  label: "Product Cards",
  icon: "LayoutGrid",
  order: 3,
  menu: true,
  description: "One card per product, positioned on the lifecycle axes agreed in the workshop.",
};

/** Stage per the Product Lifecycle SOP, as settled in the workshop (R1). */
const STAGE: Record<string, { business: string; release: string; firstLine: string }> = {
  tqa: { business: "Grow", release: "GA", firstLine: "Frank" },
  ticket_intake: { business: "Wrapping → Sustain", release: "Beta–GA", firstLine: "Grace" },
  sentiment_max: { business: "Sustain", release: "GA", firstLine: "Frank" },
  triage: { business: "Sustain", release: "GA", firstLine: "Frank" },
  next_ticket: { business: "Sustain", release: "GA", firstLine: "Frank" },
  bot: { business: "Sustain", release: "GA", firstLine: "Frank" },
  bi: { business: "Sustain", release: "GA", firstLine: "Frank" },
  attendance: { business: "Sustain — end of sale", release: "GA", firstLine: "Frank" },
  asset_library: { business: "Sustain", release: "GA", firstLine: "monitoring only" },
  micus_hop: { business: "—", release: "—", firstLine: "Micus" },
};

function ProductCard({ group, label, rows }: { group: string; label: string; rows: ScorecardRow[] }) {
  const stage = STAGE[group];
  const reds = rows.filter((r) => r.status === "red").length;
  const gaps = rows.filter((r) => r.status === "nodata").length;

  return (
    <Card className={reds > 0 ? "border-destructive/40" : undefined}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{label}</CardTitle>
          {reds > 0 && <Badge variant="destructive">{reds} red</Badge>}
        </div>
        <CardDescription>
          {stage ? (
            <span className="flex flex-wrap items-center gap-1.5">
              <Badge variant="outline">{stage.business}</Badge>
              <Badge variant="outline">{stage.release}</Badge>
              <span className="text-xs">first line: {stage.firstLine}</span>
            </span>
          ) : (
            "—"
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {rows.map((row) => {
          const s = STATUS_STYLE[row.status];
          return (
            <div key={row.id} className="flex items-center gap-2 text-sm">
              <Badge variant={s.variant} className={cn("w-[86px] shrink-0 justify-center", s.className)}>
                {s.label}
              </Badge>
              <span className="min-w-0 flex-1 truncate">{row.name.replace(`${label} — `, "")}</span>
              <span className="shrink-0 font-mono tabular-nums">{formatValue(row)}</span>
            </div>
          );
        })}
        {gaps > 0 && (
          <p className="pt-1 text-xs text-muted-foreground italic">
            {gaps} of {rows.length} rows have no source yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function ProductCards() {
  const { data, error, loading } = useScorecard();

  const cards = useMemo(() => {
    if (!data) return null;
    const map = new Map<string, ScorecardRow[]>();
    for (const row of data.rows) {
      const list = map.get(row.group);
      if (list) list.push(row);
      else map.set(row.group, [row]);
    }
    const order = Object.keys(STAGE);
    return [...map.entries()].sort(([a], [b]) => order.indexOf(a) - order.indexOf(b));
  }, [data]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Product cards</h1>
        <p className="text-sm text-muted-foreground">
          Twelve products on two axes — business stage (Explore / Grow / Sustain / Sunset) and release stage.
          Cards for MPD and the CSM internal tool are Kevin's to define and are not rendered yet.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && !data && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      )}

      {cards && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map(([group, rows]) => (
            <ProductCard key={group} group={group} label={data!.groups[group] ?? group} rows={rows} />
          ))}
        </div>
      )}
    </div>
  );
}
