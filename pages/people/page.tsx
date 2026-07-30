import { useMemo, useState } from "react";
import { Alert, AlertDescription, Avatar, AvatarFallback, Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton, cn } from "@mspbots/ui";
import { AlertTriangle } from "lucide-react";
import { Delta, LangToggle, LoadMeter, Sparkline, StatusIcon } from "../../lib/board";
import { groupLabel, rowName, rowTarget, useLang, useT } from "../../lib/i18n";
import { RowDetailDialog } from "../../lib/row-dialog";
import { formatValue, useScorecard, type ScorecardRow } from "../../lib/scorecard-client";

export const meta = {
  label: "By Owner",
  icon: "Users",
  order: 2,
  menu: true,
  description: "Each person's rows — one owner per number, 3–7 numbers per owner.",
};

function OwnerCard({ owner, rows, groups, onSelect }: { owner: string; rows: ScorecardRow[]; groups: Record<string, string>; onSelect: (row: ScorecardRow) => void }) {
  const t = useT();
  const lang = useLang();
  const reds = rows.filter((r) => r.status === "red").length;
  const accountable = rows.filter((r) => r.status !== "display").length;
  const over = accountable > 7;
  const isBucket = owner.startsWith("Unowned") || owner.startsWith("无主");

  return (
    <Card className={cn(reds > 0 && "border-red-500/30")}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
              {isBucket ? "!" : owner.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="truncate text-base">{owner}</CardTitle>
              <div className="flex shrink-0 items-center gap-1.5">
                {reds > 0 && (
                  <Badge variant="destructive" className="h-5 px-1.5 text-[11px]">
                    {reds} {t.red}
                  </Badge>
                )}
                <Badge variant="outline" className="h-5 px-1.5 text-[11px]">
                  {accountable} {t.accountable}
                </Badge>
              </div>
            </div>
            <CardDescription className="text-xs">
              {t.loadBand(accountable)} · {over ? t.loadOver : t.loadOk}
            </CardDescription>
          </div>
        </div>
        {!isBucket && <LoadMeter count={accountable} />}
      </CardHeader>
      <CardContent className="space-y-1">
        {rows.map((row) => (
          <div
            key={row.id}
            onClick={() => onSelect(row)}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-md border border-l-2 bg-card px-3 py-2 transition-colors hover:bg-muted/40",
              row.status === "red" ? "border-l-red-500 bg-red-500/[0.04] hover:bg-red-500/[0.08]" : "border-l-transparent",
            )}
          >
            <StatusIcon status={row.status} className="w-5 justify-center" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm">{rowName(row.id, row.name, lang)}</div>
              <div className="text-[11px] text-muted-foreground">
                {row.id} · {groupLabel(row.group, groups[row.group] ?? row.group, lang)} · {rowTarget(row.id, row.targetText, lang)}
              </div>
            </div>
            <Sparkline row={row} width={56} height={18} />
            <div className="flex shrink-0 items-baseline gap-1.5">
              <span className="font-mono text-sm font-semibold tabular-nums">{formatValue(row)}</span>
              <Delta row={row} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function ByOwner() {
  const { data, error, loading } = useScorecard();
  const t = useT();
  const [selected, setSelected] = useState<ScorecardRow | null>(null);

  const byOwner = useMemo(() => {
    if (!data) return null;
    const map = new Map<string, ScorecardRow[]>();
    for (const row of data.rows) {
      const key = row.owner ?? t.unownedBucket;
      const list = map.get(key);
      if (list) list.push(row);
      else map.set(key, [row]);
    }
    // People first, the unowned monitoring bucket last.
    return [...map.entries()].sort(([a], [b]) => {
      const aBucket = a === t.unownedBucket;
      const bBucket = b === t.unownedBucket;
      return aBucket === bBucket ? a.localeCompare(b) : aBucket ? 1 : -1;
    });
  }, [data, t]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t.ownerTitle}</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">{t.ownerSubtitle}</p>
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
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full" />
          ))}
        </div>
      )}

      {byOwner && data && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            {byOwner.map(([owner, rows]) => (
              <OwnerCard key={owner} owner={owner} rows={rows} groups={data.groups} onSelect={setSelected} />
            ))}
          </div>
          <RowDetailDialog row={selected} groups={data.groups} onClose={() => setSelected(null)} />
        </>
      )}
    </div>
  );
}
