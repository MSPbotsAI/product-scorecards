# Product Team Scorecards

EOS-style weekly scorecard for the MSPbots product team, produced from the team scorecard
workshop (Micus × Claude, 2026-07). This repo holds the **metric definitions** (`scorecard/metrics.yaml`),
the workshop decisions behind them, and (phase 4) the dashboard implementation.

## System of record

- **Scorecard = weekly operating pulse.** Reviewed in the weekly **Product-Platform L10** (Daniel attends).
  3–7 numbers per owner, one owner per number, red/yellow/green against explicit targets.
- **KPI Framework = monthly/quarterly evaluation.** The scorecard is its weekly data feed
  (U1/U2 + M-SPEC/M-CONV/M-FLOW/M-INT series), never a second system.
  Source: [PM KPI Framework](https://app.clickup.com/2280862/v/dc/25kcy-202237/25kcy-456537).
- Stage names follow the [Product Lifecycle SOP](https://app.clickup.com/2280862/v/dc/25kcy-202237/25kcy-454737):
  business axis `Explore / Grow / Sustain / Sunset` (gates G0–G3), release axis `Prototype → Alpha → Beta → GA`.

## Design rules (agreed in workshop)

1. **Action test**: every red/green metric must enable an action this week whose effect is visible
   next week. Metrics that fail the test are display-only trends or get cut.
2. **No activity-volume accountability** (KPI principle #1). Leading activity counts are marked
   `leading` and excluded from evaluation.
3. **Silent-tenant state machine**: paid tenant, 14 days zero consumption → enters list; exits by
   reactivation (auto) or churn confirmation with structured exit reason (manual → churn ledger).
   Red = on list >1 week with no disposition. Red punishes "nobody acted", not "customer left".
4. **Red without an owner** (Asset monitoring rows) auto-escalates to L10 IDS for on-the-spot assignment.
5. **On-track % is display-only** — the HoP is accountable for red-light disposition (H2), never for
   green-light share, so targets stay honest.
6. **AI products** (TQA / Intake / Sentiment / Triage): "active" = product-attributed credit consumption > 0;
   "paid" = purchased (non-trial) credits; revenue proxy = consumption × credit price.
7. **Subscription products** (BI / Bot / NT / Attendance): paying tenant = active subscription;
   engagement per the existing weighted engagement-score model
   ([Product Usage Dashboards](https://app.clickup.com/2280862/v/dc/25kcy-108057/25kcy-288397)).
8. **ROI rows**: rolling-4-week revenue (MRR or credit-consumption proxy) ÷ labor cost from ClickUp
   time entries grouped by the `Timesheet Project` custom field. Direct hours only, no allocation of
   generic tasks (1:1s, L10, all-hands). Observation period first; thresholds set at quarterly EOS.

## Workflow anchors (verified in ClickUp)

- Product space pipeline: `… → 5b - ready for groom → 5c - ready for dev → 6a - in dev → …`
  - **5b = evidence checkpoint** (priority-lane cards must carry named client + $ + evidence source)
  - **5c = spec freeze marker** (M-SPEC post-freeze boundary; also feeds the dev-runway numerator)
  - Status names are reused by other teams (MB- lists) — every query must scope by space/list.
- Time tracking: entries attach to tasks; product attribution via `Timesheet Project` /
  `Timesheet Category` / `Timesheet Client` custom fields.

## Data plane

- Cross-tenant product data lives in **internal datasets** (not exposed via the single-tenant Data CLI
  MCP). Production access will go through the **MSPbots public API** (credentials to be provisioned).
- Existing assets to reuse rather than rebuild:
  - Platform Product Usage Scorecard: `scorecard-1815299047968346113` (weekly Sunday snapshots)
  - Per-product usage dashboards (BI `1796382716256718850`, Bot `1796384999498539009`,
    NT `1796388005714911233`, Attendance `1796389551526338561`, Platform `1795279517164638210`)
  - Asset usage tracking dashboard `1907368777088110593` + dataset `1879106462136016897`
  - AI subscription / payment dashboard `1985164400759279618` (SQL to be captured via SQL Inspector)
  - Lineage field: `sys_model.original_id` / `sys_report.original_id` (null = original, else cloned)
  - Canny tables in warehouse: `canny_posts` / `canny_comments` / `canny_votes`
  - NT request log: `next_ticket_request_log` (`from_client` ∈ slack/team/web)
  - Daily AI Credit Consumption dataset `1984154266658537473` (`ai_business_type` = product dimension)
- Known data caveats: paying-user history before 2024-09-18 is unreliable (backfill limitation);
  heavy warehouse scans time out and return empty (filter early, never read empty as zero).

## Status

- R1 (roster / portfolio / stage alignment): **done**
- R2 (per-product metric cards): **done** — cards 11/12 delegated to Kevin
- R3 (metric spec + data source mapping): **this commit** — open TBDs listed inside `metrics.yaml`
- R4 (dashboard build): pending framework decision (existing MSPbots app framework, deploy on platform)
