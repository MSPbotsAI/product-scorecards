import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

export type RowStatus = "green" | "yellow" | "red" | "display" | "nodata";

export interface ScorecardRow {
  id: string;
  name: string;
  owner: string | null;
  group: string;
  kind: "computed" | "pending" | "unsourced" | "manual";
  compare: "gte" | "lte" | "eq" | "no-decrease" | "display";
  value: number | null;
  previous: number | null;
  status: RowStatus;
  target: number | null;
  targetText: string;
  unit?: "percent" | "count" | "score" | "ratio" | "days";
  /** Weekly series, oldest → newest. AI rows carry two relative points (p7d/l7d) for now. */
  history?: { week: string; value: number }[];
  names?: string[];
  note?: string;
  reason?: string;
  anchor?: string;
}

/** For delta coloring: on lte-rows (silent counts, target 0) a rise is bad news. */
export function upIsGood(row: Pick<ScorecardRow, "compare">): boolean {
  return row.compare !== "lte";
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
 * The report API needs the tenant alongside the token. `tokenPayload` is typed as an open record,
 * so the claim name is not knowable statically — try the plausible ones.
 */
function tenantCodeOf(payload: Record<string, unknown> | null | undefined): string {
  for (const key of ["tenantCode", "tenant_code", "tenantId", "tenant_id", "tenant", "tid"]) {
    const v = payload?.[key];
    if (v != null && String(v).length > 0) return String(v);
  }
  return "";
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

async function fetchScorecard(tenantCode: string, payload: Record<string, unknown> | null | undefined): Promise<ScorecardData> {
  const res = await $fetch(`/api/scorecard${tenantCode ? `?tenantCode=${encodeURIComponent(tenantCode)}` : ""}`, {
    headers: tenantCode ? { tenantCode } : undefined,
  });
  const body = await res.json();
  if (!res.ok) {
    // A 400 means the server wanted a tenant it didn't get. The tenant claim's name isn't
    // knowable statically, so name the claims the token does carry (names only, never values).
    if (res.status === 400 && !tenantCode) {
      const keys = payload ? Object.keys(payload) : [];
      throw new Error(
        `${body?.error ?? "missing tenantCode"} — the token carries no tenant claim under a known name. ` +
          `Claims present: ${keys.join(", ") || "(none)"}. Add the right one to tenantCodeOf() in lib/scorecard-client.ts.`,
      );
    }
    throw new Error(body?.error ?? `request failed (${res.status})`);
  }
  return body as ScorecardData;
}

export function useScorecard() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!cached);
  const access = useAccess();
  const payload = access?.tokenPayload;
  const tenantCode = tenantCodeOf(payload);

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
        inflight = fetchScorecard(tenantCode, payload).finally(() => {
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
    [tenantCode, payload],
  );

  useEffect(() => {
    void load(false);
  }, [load]);

  return { data, error, loading, reload: () => void load(true), fetchedAt: cachedAt };
}
