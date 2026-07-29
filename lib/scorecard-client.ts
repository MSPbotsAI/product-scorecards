import { useCallback, useEffect, useState } from "react";

export type RowStatus = "green" | "yellow" | "red" | "display" | "nodata";

export interface ScorecardRow {
  id: string;
  name: string;
  owner: string | null;
  group: string;
  kind: "computed" | "pending" | "unsourced" | "manual";
  value: number | null;
  previous: number | null;
  status: RowStatus;
  target: number | null;
  targetText: string;
  unit?: "percent" | "count" | "score" | "ratio" | "days";
  names?: string[];
  note?: string;
  reason?: string;
  anchor?: string;
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

/** The report API needs the tenant alongside the token; the runtime carries it on the token payload. */
function tenantCodeOf(payload: Record<string, unknown> | undefined): string {
  for (const key of ["tenantCode", "tenant_code", "tenantId", "tenant"]) {
    const v = payload?.[key];
    if (v != null && String(v).length > 0) return String(v);
  }
  return "";
}

export function useScorecard() {
  const [data, setData] = useState<ScorecardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const access = useAccess() as { tokenPayload?: Record<string, unknown> };
  const tenantCode = tenantCodeOf(access?.tokenPayload);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await $fetch(`/api/scorecard${tenantCode ? `?tenantCode=${encodeURIComponent(tenantCode)}` : ""}`, {
        headers: tenantCode ? { tenantCode } : undefined,
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? `request failed (${res.status})`);
      setData(body as ScorecardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to load the scorecard");
    } finally {
      setLoading(false);
    }
  }, [tenantCode]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, error, loading, reload: load };
}
