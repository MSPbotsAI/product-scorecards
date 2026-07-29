import { useMemo } from "react";
import { Alert, AlertDescription, Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton, cn } from "@mspbots/ui";
import { AlertTriangle } from "lucide-react";
import { Delta, LangToggle, Sparkline, StatusChip } from "../../lib/board";
import { groupLabel, rowName, useLang, useT } from "../../lib/i18n";
import { formatValue, useScorecard, type ScorecardRow } from "../../lib/scorecard-client";

export const meta = {
  label: "Product Cards",
  icon: "LayoutGrid",
  order: 3,
  menu: true,
  description: "One card per product, positioned on the lifecycle axes agreed in the workshop.",
};

/** Stage per the Product Lifecycle SOP, as settled in the workshop (R1). Stage names stay English — they are SOP terms. */
const STAGE: Record<string, { business: string; release: string; firstLine: string; accent?: "grow" | "wrap" | "eos" }> = {
  tqa: { business: "Grow", release: "GA", firstLine: "Frank", accent: "grow" },
  ticket_intake: { business: "Wrapping → Sustain", release: "Beta–GA", firstLine: "Grace", accent: "wrap" },
  sentiment_max: { business: "Sustain", release: "GA", firstLine: "Frank" },
  triage: { business: "Sustain", release: "GA", firstLine: "Frank" },
  next_ticket: { business: "Sustain", release: "GA", firstLine: "Frank" },
  bot: { business: "Sustain", release: "GA", firstLine: "Frank" },
  bi: { business: "Sustain", release: "GA", firstLine: "Frank" },
  attendance: { business: "Sustain — end of sale", release: "GA", firstLine: "Frank", accent: "eos" },
  asset_library: { business: "Sustain", release: "GA", firstLine: "monitoring only" },
  micus_hop: { business: "—", release: "—", firstLine: "Micus" },
};

const STAGE_BADGE: Record<string, string> = {
  grow: "border-emerald-500/40 text-emerald-700 dark:text-emerald-400",
  wrap: "border-blue-500/40 text-blue-700 dark:text-blue-400",
  eos: "border-amber-500/40 text-amber-700 dark:text-amber-400",
};

function ProductCard({ group, label, rows }: { group: string; label: string; rows: ScorecardRow[] }) {
  const t = useT();
  const lang = useLang();
  const stage = STAGE[group];
  const reds = rows.filter((r) => r.status === "red").length;
  const gaps = rows.filter((r) => r.status === "nodata").length;
  const firstLine = stage?.firstLine === "monitoring only" ? t.monitoringOnly : stage?.firstLine;

  return (
    <Card className={cn("flex flex-col", reds > 0 && "border-red-500/30")}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{label}</CardTitle>
          {reds > 0 && (
            <Badge variant="destructive" className="h-5 px-1.5 text-[11px]">
              {reds} {t.red}
            </Badge>
          )}
        </div>
        {stage && (
          <CardDescription>
            <span className="flex flex-wrap items-center gap-1.5">
              <Badge variant="outline" className={cn("h-5 px-1.5 text-[11px] font-normal", stage.accent && STAGE_BADGE[stage.accent])}>
                {stage.business}
              </Badge>
              <Badge variant="outline" className="h-5 px-1.5 text-[11px] font-normal">
                {stage.release}
              </Badge>
              <span className="text-[11px]">
                {t.firstLine}: {firstLine}
              </span>
            </span>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-1">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center gap-2 text-sm">
            <StatusChip status={row.status} className="w-[60px] shrink-0" />
            <span className="min-w-0 flex-1 truncate text-[13px]">
              {rowName(row.id, row.name, lang).replace(/^[^—]+—\s*/, "")}
            </span>
            <Sparkline row={row} width={48} height={16} />
            <span className="shrink-0 font-mono text-[13px] font-medium tabular-nums">{formatValue(row)}</span>
            <Delta row={row} />
          </div>
        ))}
        {gaps > 0 && (
          <p className="mt-auto pt-2 text-[11px] italic text-muted-foreground">{t.noSourceRows(gaps, rows.length)}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function ProductCards() {
  const { data, error, loading } = useScorecard();
  const t = useT();
  const lang = useLang();

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
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t.productsTitle}</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">{t.productsSubtitle}</p>
        </div>
        <LangToggle />
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

      {cards && data && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map(([group, rows]) => (
            <ProductCard key={group} group={group} label={groupLabel(group, data.groups[group] ?? group, lang)} rows={rows} />
          ))}
        </div>
      )}
    </div>
  );
}
