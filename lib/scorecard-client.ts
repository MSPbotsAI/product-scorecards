import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

export type RowStatus = "green" | "yellow" | "red" | "display" | "nodata";

export interface ScorecardRow {
  id: string;
  name: string;
  owner: string | null;
  group: string;
  kind: "computed" | "pending" | "unsourced" | "manual";
  compare: "gte" | "lte" | "eq" | "no-decrease" | "display" | "band" | "band-hi";
  value: number | null;
  previous: number | null;
  status: RowStatus;
  target: number | null;
  /** Upper bound of the yellow band; only set when compare is 'band'. */
  yellowMax?: number;
  /** Lower bound of the yellow band; only set when compare is 'band-hi'. */
  yellowMin?: number;
  /** True when target/yellowMin can be edited from this row's dialog (PUT /api/metric-thresholds/:id). */
  thresholdEditable?: boolean;
  /** True for a deliberately-deferred row (e.g. "coming soon") — shown in Gaps but excluded from coverage denominators. */
  excludeFromCoverage?: boolean;
  targetText: string;
  unit?: "percent" | "count" | "score" | "ratio" | "days";
  /** Weekly series, oldest → newest. AI rows carry two relative points (p7d/l7d) for now. */
  history?: { week: string; value: number }[];
  names?: string[];
  note?: string;
  reason?: string;
  anchor?: string;
}

/** For delta coloring: on lte-rows (silent counts) and band-rows (Kevin's manual KPIs), a rise is bad news. */
export function upIsGood(row: Pick<ScorecardRow, "compare">): boolean {
  return row.compare !== "lte" && row.compare !== "band";
}

/**
 * Client-side mirror of judge(), for live coloring while a value is being typed into a manual
 * row's dialog. Manual rows aren't all 'band'/'band-hi' (e.g. H2 is 'gte'), so every case judge()
 * handles is mirrored here rather than assuming lower-is-better.
 */
export function bandStatus(
  value: number | null,
  row: Pick<ScorecardRow, "compare" | "target" | "yellowMax" | "yellowMin">,
): RowStatus {
  if (value == null || !Number.isFinite(value) || row.target == null) return "nodata";
  const { compare, target, yellowMax, yellowMin } = row;
  switch (compare) {
    case "gte":
      return value >= target ? "green" : value >= target * 0.9 ? "yellow" : "red";
    case "lte":
      return value <= target ? "green" : "red";
    case "eq":
      return value === target ? "green" : "red";
    case "band":
      return value <= target ? "green" : yellowMax != null && value <= yellowMax ? "yellow" : "red";
    case "band-hi":
      return value >= target ? "green" : yellowMin != null && value >= yellowMin ? "yellow" : "red";
    default:
      return "nodata";
  }
}

export interface ScorecardData {
  week: string;
  rows: ScorecardRow[];
  groups: Record<string, string>;
  sources: { dataset: string; rows: number; ok: boolean; error?: string }[];
}

export const STATUS_STYLE: Record<RowStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
  red: { label: "Red", variant: "destructive" },
  yellow: { label: "Yellow", variant: "secondary", className: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  green: { label: "Green", variant: "secondary", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
  display: { label: "Trend", variant: "outline" },
  nodata: { label: "No source", variant: "outline", className: "border-dashed text-muted-foreground" },
};

export function formatValue(row: Pick<ScorecardRow, "value" | "unit">): string {
  if (row.value == null) return "—";
  switch (row.unit) {
    case "percent":
      return `${row.value}%`;
    case "score":
    case "ratio":
      return row.value.toFixed(2);
    default:
      return String(row.value);
  }
}

/**
 * Module-level cache shared by all pages: the scorecard is a weekly number, so navigating between
 * views must not refetch it. One fetch fills every page; only the Refresh button forces a new read.
 */
let cached: ScorecardData | null = null;
let cachedAt: number | null = null;
let inflight: Promise<ScorecardData> | null = null;
const cacheSubs = new Set<() => void>();
const emitCache = () => cacheSubs.forEach((fn) => fn());

/** Drop the cached scorecard — used after Settings changes the key or a dataset id. */
export function invalidateScorecard(): void {
  cached = null;
  cachedAt = null;
  emitCache();
}

/**
 * The server resolves the tenant from the platform token that `$fetch` attaches, so the request
 * carries nothing else: no tenant header, no tenant query parameter.
 */
async function fetchScorecard(): Promise<ScorecardData> {
  const res = await $fetch("/api/scorecard");
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error ?? `request failed (${res.status})`);
  return body as ScorecardData;
}

export function useScorecard() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!cached);

  const data = useSyncExternalStore(
    (fn) => {
      cacheSubs.add(fn);
      return () => cacheSubs.delete(fn);
    },
    () => cached,
    () => null,
  );

  const load = useCallback(
    async (force: boolean) => {
      if (cached && !force) {
        setLoading(false);
        return;
      }
      // Deduplicate: several pages mounting at once must not issue parallel reads.
      if (!inflight) {
        inflight = fetchScorecard().finally(() => {
          inflight = null;
        });
      }
      setLoading(true);
      setError(null);
      try {
        const result = await inflight;
        cached = result;
        cachedAt = Date.now();
        emitCache();
      } catch (err) {
        setError(err instanceof Error ? err.message : "failed to load the scorecard");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void load(false);
  }, [load]);

  return { data, error, loading, reload: () => void load(true), fetchedAt: cachedAt };
}
