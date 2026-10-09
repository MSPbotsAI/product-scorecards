// Client for the Support Ticket Updates page.
//
// The payload type is the server's own return type, imported as a type only (erased at build, so no
// server code reaches the bundle). A field the server stops sending is a compile error here — not
// the word "undefined" on the page.

import { useCallback, useEffect, useState } from "react";
import type { SupportUpdatesPayload } from "../service/lib/pm/index.ts";

export type { SupportUpdatesPayload };
export type { CycleOutcome, EntryKind, EntryRow, OffClock, ResponseRow, Stat, WeekRow } from "../service/lib/pm/metrics.ts";

/** How often to re-read while a capture is running. A capture takes minutes; this is not a hot loop. */
const POLL_MS = 8000;

/** The server resolves the tenant from the platform token `$fetch` attaches; the request carries nothing else. */
export function useSupportUpdates() {
  const [data, setData] = useState<SupportUpdatesPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (refresh: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const res = await $fetch(`/api/support-ticket-updates${refresh ? "?refresh=1" : ""}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? `request failed (${res.status})`);
      setData(body as SupportUpdatesPayload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(false);
  }, [load]);

  // While a capture runs the log grows under the page; keep re-reading until it lands.
  useEffect(() => {
    if (!data?.capture.inFlight) return;
    const id = window.setTimeout(() => void load(false), POLL_MS);
    return () => window.clearTimeout(id);
  }, [data, load]);

  return { data, error, loading, reload: () => void load(false), refresh: () => void load(true) };
}

/** Send an exported event log to be merged into this tenant's log. */
export async function importLog(file: File): Promise<{ read: number; added: number; events: number }> {
  const res = await $fetch("/api/support-ticket-updates/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: await file.text(),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error ?? `import failed (${res.status})`);
  return body;
}
