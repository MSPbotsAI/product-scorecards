# Handoff — Product Team Scorecard Workshop → Build Phase (R4)

> For the next Claude session (desktop, with local-browser access via Chrome extension).
> Previous session: cloud (claude.ai/code), 2026-07-29. Repo has moved to `MSPbotsAI/product-scorecards`.
> Read `README.md` (decisions & data map) and `scorecard/metrics.yaml` (full metric spec) first — this
> file only adds what isn't in those two.

## Where the project stands

- **R1 done** — roster, portfolio, stage alignment (see README + metrics.yaml headers).
- **R2 done** — 12 product cards + non-product bucket walked through one by one with Micus and finalized.
  Cards `mpd` and `csm_internal_tool` are **delegated to Kevin** (drafts in metrics.yaml are his starting
  point). Card `triage` TR4 is **pending Grace review** (does human-override telemetry exist?).
- **R3 done to the limit of the cloud session** — spec written, ClickUp anchors verified live
  (statuses `5b - ready for groom` / `5c - ready for dev`, Timesheet Project/Category/Client custom
  fields), warehouse structures sampled (credit consumption dataset verified). **6 open TBDs** listed
  in `metrics.yaml → meta.open_tbds`.
- **R4 not started** — that's this session's job.

## People & review cadence (context not in README)

- Micus (acting HoP + SAP customer-side PM), Grace (Sr PM, R&D-side; Intake first-line permanently),
  Frank (<3mo, first-line for ALL sustain products), Glenn (client-engagement PM; owns Intake
  conversion funnel G1–G4 — his only scorecard rows so far), Kevin (MPD + CSM internal tool, self-defines).
- Asset library: deliberately **unowned, monitoring-only** (B1–B5); red rows go to L10 IDS for
  on-the-spot assignment. Micus said early understandings of Asset were wrong twice — treat the
  `asset_library` section of metrics.yaml as the settled truth (top-layer only, lineage via original_id).
- Weekly **Product-Platform L10**, Daniel attends. The dashboard must be ready before the meeting
  (H1 = data completeness at meeting time).

## R4 task list (in order)

1. **Study the framework**: reference repo `MSPbotsAI/tqa-gtm` — all previous app projects used this
   framework; the scorecard app should follow its structure and deploy the same way (on the MSPbots
   platform, per Micus).
2. **Capture SQL from existing dashboards** (needs the local browser — this is why the session moved
   to desktop). For each dashboard below, hover a widget header → "…" menu → **SQL Inspector**, copy SQL:
   - AI subscription / payment: `app.mspbots.ai/dashboard-1985164400759279618` → resolves TBD
     "paid-vs-trial credit distinction" + AI MRR source
   - Asset usage tracking: `dashboard-1907368777088110593` → resolves TBD "asset lineage tables"
     (expect `sys_model.original_id` / `sys_report.original_id`)
   - Per-product usage: BI `1796382716256718850`, Bot `1796384999498539009`, NT `1796388005714911233`,
     Attendance `1796389551526338561`, Platform `1795279517164638210`
   - Existing scorecard: `scorecard-1815299047968346113` (weekly Sunday snapshot mechanism — reuse it)
3. **Close remaining TBDs** (metrics.yaml meta): NT license source, Timesheet Project enum list
   (ClickUp custom field), Sentiment alert-view telemetry (may stay telemetry debt), TR4 (ask Grace).
4. **Data plane**: production reads go through the **MSPbots public API** (Micus provisions
   credentials). The single-tenant Data CLI MCP is validation-only. Relay trick if needed pre-API:
   write cross-tenant SQL into scratch dataset `temp-tqa` (id `2056552570192805889`) via the browser
   dataset editor, read rows back via Data CLI skill (works — verified).
5. **Build the scorecard app** on the framework: metrics.yaml is the contract — red/yellow/green per
   row, owner column, per-person view (3–7 rows each, aggregates for Frank), product cards view,
   L10 mode (reds first → IDS list), churn ledger, trial funnels as context views (sales/CSM section),
   weekly snapshot cadence aligned to the existing scorecard's Sunday snapshots.
6. **One-time Rocks** (tracked in metrics.yaml, owned by Micus, not code): gate-review-minute patch,
   SOP doc updates (TQA→Grow, freeze=5c, Attendance end-of-sale, M-FLOW 48h→7d), SAP G0 check,
   public API credentials.

## Gotchas carried over

- ClickUp status names (`ready for dev`) are reused by SRE/Data/QA teams (MB- lists) — **always scope
  queries by Product space / list IDs**.
- Warehouse: heavy scans time out and return empty — filter early; never read empty as zero.
  Paying-user history before 2024-09-18 unreliable.
- Data CLI quirks: `--integration` param broken (put source name in query), small pages (size≤5) +
  retry + dedupe, `order_by` unreliable.
- KPI Framework doc still says 48h feedback-to-backlog; workshop decision is **7d** — doc amendment
  is Micus's Rock, dashboard tracks actual latency distribution for a future re-tightening call.
- Engagement-score weights and active definitions: ClickUp doc `25kcy-108057` page `25kcy-288397`
  (Product Usage Dashboards); Features logs page `25kcy-341277` maps features → warehouse tables
  (incl. Canny tables: `canny_posts` / `canny_comments` / `canny_votes`; NT: `next_ticket_request_log`).
- Product Team SOP hub: ClickUp doc `25kcy-202237` (Lifecycle SOP, PM KPI Framework, Client
  Engagement PM SOP — the scorecard is deliberately anchored to these; every metric carries its
  SOP anchor in metrics.yaml).
