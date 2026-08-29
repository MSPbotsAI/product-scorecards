// Client-side read of the intake client-engagement report.
//
// Cached at module level like the scorecard: the report is a weekly snapshot, so navigating away and
// back must not refetch ~350 KB. Only an explicit Refresh forces a new read.

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { IntakeReport } from "../service/lib/intake";

export type { IntakeReport };

/** Ladder colour per rung. Role scales only — the rung is a state, not decoration. */
export const STAGE_TONE: Record<string, { dot: string; text: string; rail: string }> = {
  lost: { dot: "bg-muted-foreground/40", text: "text-muted-foreground", rail: "bg-muted-foreground/40" },
  interest: { dot: "bg-slate-400", text: "text-slate-600 dark:text-slate-400", rail: "bg-slate-400" },
  onboarded: { dot: "bg-sky-500", text: "text-sky-700 dark:text-sky-400", rail: "bg-sky-500" },
  selftest: { dot: "bg-cyan-500", text: "text-cyan-700 dark:text-cyan-400", rail: "bg-cyan-500" },
  livecalls: { dot: "bg-teal-500", text: "text-teal-700 dark:text-teal-400", rail: "bg-teal-500" },
  pricing: { dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400", rail: "bg-emerald-500" },
  won: { dot: "bg-emerald-600", text: "text-emerald-800 dark:text-emerald-300", rail: "bg-emerald-600" },
};

/**
 * Meeting-cell appearance per state. Deliberately not all "colour": a cancelled session and a
 * session with no record are different failures, and `noinvite` (never scheduled at all) reads as an
 * outline because nothing happened to record.
 */
export const STATE_CELL: Record<string, string> = {
  held: "bg-emerald-500/80 border-emerald-500",
  cancelled: "bg-red-500/70 border-red-500",
  norecord: "border-dashed border-muted-foreground/60 bg-muted-foreground/10",
  upcoming: "border-primary bg-primary/15",
  noinvite: "border-dotted border-amber-500 bg-amber-500/10",
};

let cached: IntakeReport | null = null;
let inflight: Promise<IntakeReport> | null = null;
const subs = new Set<() => void>();
const emit = () => subs.forEach((fn) => fn());

export function invalidateIntake(): void {
  cached = null;
  emit();
}

async function fetchIntake(): Promise<IntakeReport> {
  const res = await $fetch("/api/intake");
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error ?? `request failed (${res.status})`);
  return body as IntakeReport;
}

export type IntakeSummary = Pick<IntakeReport, "asOf" | "ageDays" | "summary">;

let cachedSummary: IntakeSummary | null = null;
let summaryInflight: Promise<IntakeSummary> | null = null;

/**
 * Headline counts only, for the entry link on the Product Cards page.
 *
 * Separate from `useIntake` on purpose: the full report is ~350 KB, and a one-line label on a card
 * must not cost that. Prefers the full report when a visit to the report page has already cached it.
 */
export function useIntakeSummary(): IntakeSummary | null {
  const full = useSyncExternalStore(
    (fn) => {
      subs.add(fn);
      return () => subs.delete(fn);
    },
    () => cached,
    () => null,
  );
  const [summary, setSummary] = useState<IntakeSummary | null>(cachedSummary);

  useEffect(() => {
    if (full || cachedSummary) return;
    if (!summaryInflight) {
      summaryInflight = $fetch("/api/intake/summary")
        .then(async (res) => {
          const body = await res.json();
          if (!res.ok) throw new Error(body?.error ?? `request failed (${res.status})`);
          return body as IntakeSummary;
        })
        .finally(() => {
          summaryInflight = null;
        });
    }
    let live = true;
    summaryInflight
      .then((value) => {
        cachedSummary = value;
        if (live) setSummary(value);
      })
      // The card degrades to its static label; a failed count is not worth an error banner on a page
      // that is about something else.
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [full]);

  return full ? { asOf: full.asOf, ageDays: full.ageDays, summary: full.summary } : summary;
}

export function useIntake() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!cached);

  const data = useSyncExternalStore(
    (fn) => {
      subs.add(fn);
      return () => subs.delete(fn);
    },
    () => cached,
    () => null,
  );

  const load = useCallback(async (force: boolean) => {
    if (cached && !force) {
      setLoading(false);
      return;
    }
    if (!inflight) {
      inflight = fetchIntake().finally(() => {
        inflight = null;
      });
    }
    setLoading(true);
    setError(null);
    try {
      cached = await inflight;
      emit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to load the intake report");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(false);
  }, [load]);

  return { data, error, loading, reload: () => void load(true) };
}
