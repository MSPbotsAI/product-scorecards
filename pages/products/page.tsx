import { useMemo } from "react";
import { Alert, AlertDescription, Badge, Card, CardContent, Skeleton, cn } from "@mspbots/ui";
import { AlertTriangle } from "lucide-react";
import { Delta, LangToggle, NoteHint, Sparkline, StatusIcon } from "../../lib/board";
import { groupLabel, rowName, rowShort, rowTarget, useLang, useT } from "../../lib/i18n";
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

/** The card leads with its activity metric — the first row that actually has a series. */
function pickHero(rows: ScorecardRow[]): ScorecardRow | null {
  return (
    rows.find((r) => r.value != null && r.history && r.history.length >= 2) ??
    rows.find((r) => r.value != null) ??
    null
  );
}

function Hero({ row }: { row: ScorecardRow }) {
  const lang = useLang();
  const judged = row.status === "red" || row.status === "yellow" || row.status === "green";
  return (
    <div className="flex items-end justify-between gap-3 border-y bg-muted/30 px-4 py-3 -mx-4">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {rowShort(row.id, row.name, lang)}
          {judged && <StatusIcon status={row.status} />}
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span
            className={cn(
              "text-[26px] font-semibold leading-none tracking-tight tabular-nums",
              row.status === "red" && "text-red-700 dark:text-red-400",
              row.status === "green" && "text-emerald-700 dark:text-emerald-400",
            )}
          >
            {formatValue(row)}
          </span>
          <Delta row={row} />
        </div>
        <div className="mt-1 truncate text-[11px] text-muted-foreground/80">{rowTarget(row.id, row.targetText, lang)}</div>
      </div>
      <Sparkline row={row} width={104} height={34} />
    </div>
  );
}

function CompactRow({ row }: { row: ScorecardRow }) {
  const lang = useLang();
  return (
    <NoteHint note={rowName(row.id, row.name, lang)}>
      <div
        className={cn(
          "flex h-8 items-center gap-2 rounded-md px-1.5 -mx-1.5",
          row.status === "red" && "bg-red-500/[0.06]",
        )}
      >
        <StatusIcon status={row.status} />
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-[13px]",
            row.status === "nodata" && "text-muted-foreground/70",
            row.status === "red" && "font-medium",
          )}
        >
          {rowShort(row.id, row.name, lang)}
        </span>
        <Sparkline row={row} width={44} height={14} />
        <span
          className={cn(
            "shrink-0 font-mono text-[13px] font-semibold tabular-nums",
            row.status === "nodata" && "font-normal text-muted-foreground/60",
            row.status === "red" && "text-red-700 dark:text-red-400",
          )}
        >
          {formatValue(row)}
        </span>
        <Delta row={row} />
      </div>
    </NoteHint>
  );
}

function ProductCard({ group, label, rows }: { group: string; label: string; rows: ScorecardRow[] }) {
  const t = useT();
  const stage = STAGE[group];
  const reds = rows.filter((r) => r.status === "red").length;
  const sourced = rows.filter((r) => r.status !== "nodata").length;
  const hero = pickHero(rows);
  const rest = hero ? rows.filter((r) => r !== hero) : rows;
  const firstLine = stage?.firstLine === "monitoring only" ? t.monitoringOnly : stage?.firstLine;

  return (
    <Card className={cn("flex flex-col overflow-hidden", reds > 0 && "border-red-500/40")}>
      <CardContent className="flex flex-1 flex-col px-4 pb-3 pt-4">
        {/* header */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-[15px] font-semibold tracking-tight">{label}</span>
              {reds > 0 && (
                <Badge variant="destructive" className="h-[18px] shrink-0 px-1.5 text-[10px]">
                  {reds} {t.red}
                </Badge>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {stage && (
                <>
                  {stage.business !== "—" && (
                    <Badge
                      variant="outline"
                      className={cn("h-[18px] px-1.5 text-[10px] font-normal", stage.accent && STAGE_BADGE[stage.accent])}
                    >
                      {stage.business}
                    </Badge>
                  )}
                  {stage.release !== "—" && (
                    <Badge variant="outline" className="h-[18px] px-1.5 text-[10px] font-normal">
                      {stage.release}
                    </Badge>
                  )}
                  <span className="text-[11px] text-muted-foreground">{firstLine}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* hero metric */}
        {hero && <Hero row={hero} />}

        {/* remaining rows */}
        <div className={cn("flex flex-1 flex-col gap-0.5", hero ? "pt-2.5" : "border-t pt-2.5")}>
          {rest.map((row) => (
            <CompactRow key={row.id} row={row} />
          ))}
        </div>

        {/* coverage footer */}
        <div className="mt-2.5 flex items-center gap-2 border-t pt-2.5">
          <div className="flex h-1 flex-1 gap-px overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-foreground/35" style={{ width: `${(sourced / rows.length) * 100}%` }} />
          </div>
          <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
            {sourced}/{rows.length}
          </span>
        </div>
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
            <Skeleton key={i} className="h-64 w-full" />
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
