# Data map — verified sources behind `metrics.yaml`

> Captured 2026-07-29 from the live platform (`app.mspbots.ai`) via each widget's **SQL Inspector**.
> **We deliberately do not store the captured SQL in this repo.** Queries that the scorecard needs
> live as platform **datasets** (below); this file records *where the numbers come from* and the
> field names the app reads. Re-capture from SQL Inspector if a definition is in doubt.

## Internal datasets (Cross Tenant Dataset → Internal Datasets)

Entry point: `https://app.mspbots.ai/CrossTenantDataset` (list + **New**).
Only four internal datasets exist as of capture:

| Dataset | Id | Status | Serves |
|---|---|---|---|
| **Paying AI Credit Consumption** | `1985255723050872834` | In-Dev | AI products: T1/T4/T5, SM1–SM3, TR1–TR3, I2–I4 |
| Paying Clients Contract info | *(id not read)* | Requested | Subscription / MRR context |
| **MSPbots Custom Asset Inventory** | `2082117976089296897` | Requested — **empty, no columns yet** | Intended for asset rows B1–B5; not yet delivered |
| Intake Data Details | *(id not read)* | Published (created 2026-07-28) | Intake detail rows |

Outside the internal list, referenced by the Asset dashboard and already populated:

| Dataset | Id | Serves |
|---|---|---|
| **Asset usage by MSP size** | `1879106462136016897` | B1 / B3 / B5 (see below) |

The AI Credits Dashboard (`dashboard-1985164400759279618`) queries
`t_dataset_1985255723050872834` — i.e. its widgets sit on **Paying AI Credit Consumption**, so the
scorecard should read that dataset rather than rebuild the Chargebee logic.

## `Paying AI Credit Consumption` (id `1985255723050872834`)

Grain: **one row per paying tenant** (~55 data columns). Directly usable fields:

- Identity / plan: `tenant_code`, `tenant_name`, `plan`, `credits_amount`, `ai_billing_status`,
  `first_billing_start`, `next_billing_time`
- Consumption, total and per product: `total_consumed`, `total_consumed_sentiment_max`,
  `total_consumed_ai_triage`
- **Rolling 7-day, per product** — `l7d_consumed`, `l7d_consumed_sentiment_max`,
  `l7d_consumed_ai_triage`, `l7d_consumed_ticketqa`, `l7d_consumed_intake`
- **Prior 7-day (WoW baseline)** — `p7d_consumed`, `p7d_consumed_sentiment_max`,
  `p7d_consumed_ai_triage`; weekly variants `l1w_consumed*`
- Billing cycle / quota: `package_quota`, `quota`, `current_cycle_used`,
  `current_cycle_used_sentiment`, `current_cycle_used_triage`, `current_cycle_used_ticketqa`,
  `current_cycle_used_intake`, `billing_start_time`, `billing_end_time`
- Subscription: `subscription_id`, `subscription_status`, `billing_frequency`, `customer_id`,
  `subscription_mrr`, `MRR`, `Sentiment_MRR`, `contract_length`, `coupon`,
  `subscription_current_term_start_time` / `_end_time`, `subscription_started_at_time`,
  `item_date_from` / `_to`, `changed_item`
- Ownership (for red-row routing): `deal_owner`, `csm`, `account_executive`
- Intake extra: `phone_number`

Mapping to the spec:

| metrics.yaml row | Computation on this dataset |
|---|---|
| T1 / SM1 / TR1 / I2 active tenants | `count(*) where l7d_consumed_<product> > 0` |
| "no WoW net decrease" | compare `l7d_consumed_<product>` vs `p7d_consumed_<product>` — **no history table needed** |
| T4 / SM2 / TR2 / I3 silent paid | `ai_billing_status = 'active paid'` **and** `l7d_consumed_<product> = 0` (14-day rule needs the daily fact table, below) |
| T5 / SM3 / TR3 / I4 ROI numerator | consumption × credit price, or the `MRR` / `Sentiment_MRR` columns |
| Silent-tenant outreach owner | `csm` / `account_executive` |

## Product dimension — correction to `metrics.yaml`

The spec assumed products are split by `ai_business_type` on dataset `1984154266658537473`.
**The live dashboards split by `app_id`, and each product has one app per PSA:**

| Product | Autotask `app_id` | ConnectWise `app_id` |
|---|---|---|
| AI Triage | `1953014248305201152` | `1955629426247077888` |
| AI Sentiment Max | `1996037407123845122` | `1996037742932406273` |
| TicketQA | `2052651573141700610` | — |
| Ticket Intake | `2052660054250897410` | — |

Consequence: a per-product number is the **sum of its app_ids**; a per-PSA breakdown is available
for free. `psa` is derived by the same CASE (`'Autotask'` / `'ConnectWise'`).

## Paid vs trial — TBD closed

There is **no `is_trial` / `paid` flag anywhere** in these queries. Paid is expressed structurally:

- **Paid = a row in `tenant_payment_credit`** (`tier_type` → `plan`, `credits_amount` → plan
  credits, plus `subscription_id`, `next_billing_time`); additional credits are a self-join sum on
  the same table. The query labels these `'active paid' as ai_billing_status`.
- Tenant ↔ Chargebee link: `sys_tenant_setting` where `type = 'CHARGEBEE-MSPBOTS-MAPPING'`
  (`value` = Chargebee `customer_id`).
- **AI-specific revenue** is isolated by `chargebee_invoices_lineitems.entity_id ~* 'AI-Credit-'`,
  `ai_mrr = round(amount / 100.0, 2)`. A tenant's plan is current when
  `chargebee_subscriptions.subscription_subscription_items::text ~* 'AI-Credit-'` — **AI plan
  cancelled** = has AI-Credit invoice history but no current AI-Credit item.
- Chargebee rows live under the MSPbots tenant (`tenant_code = 1285403951449878530`).

So "trial" = consuming credits with **no** `tenant_payment_credit` row — confirm the exact trial
grant path before wiring T-rows that must exclude trials.

## Warehouse fact tables

- `dw.dws_ai_trace_stat_day_di_view` — **daily** AI credit stats (`tenant_code`, `app_id`,
  `stat_day`, `credits`). The per-product CASE above is applied here; this is the table for the
  14-day silent-tenant window and any daily series.
- `dw.dws_ai_trace_stat_hour_mi_view` — hourly equivalent
- `dwd_ai_trace_logs_view` — raw trace logs
- Credit/billing: `tenant_payment_credit`, `sys_ai_credit_ledger`, `ai_invoice` (CTE over
  `chargebee_invoices_lineitems`)
- Chargebee: `chargebee_subscriptions` (MRR via `subscription_mrr` + `subscription_items` JSONB —
  `item_price_id`, `amount/100`), `chargebee_coupons`, `chargebee_invoices_lineitems`,
  `chargebee_subscriptions_scheduled_changes`
- Platform: `sys_tenant`, `sys_tenant_setting`, `tenant_app`, `tenant_app_setting`,
  `tenant_app_resource`, `sys_bot`
- HubSpot (sales context, Glenn's G1–G4): `hubspot_companies`, `hubspot_deals`,
  `hubspot_deals_associations`, `hubspot_owners`, `hubspot_pipelines`, `hubspot_pipelines_stages`
- Intake: `ai_ticket_intake_tenant_phone_numbers`

## Subscription products (BI / Bot / NT / Attendance / Platform) — one shared model

The five per-product usage dashboards are **not five models** — they are one model parameterised per
product. All of them resolve to the same dataset and the same DWS tables, and the product-specific
part is only a column prefix (`bi` / `bot` / `nt` / `at`). Build the scorecard against the dataset;
do not re-derive any of this.

### `Product Metric Dataset` — id `1793541682307964929`

**Grain: tenant × user × week** (`tenant_code`, `tenant_name`, `user_id`, `job_title`,
`weeks_date`). 155 columns, in these families:

- **Raw activity counts** (the engagement-score inputs): `login`, `viewing_a_widget`,
  `use_a_nt_command`, `modifying_adding_a_nt_rule`, `test_nt_rule`, `assign_a_nt_filter_rule`,
  `reject_a_nt_command`, `create_a_nt_filter`, `recording_attendance`, `create_or_update_a_bot`,
  `create_or_update_a_dataset`, `create_or_update_a_widget`, `creating_or_updating_a_bi_dashboard`,
  `read_a_bot_message`, `receive_bot_message`, `client_portal_login`, `schedule_report_triggered`
- **Engagement scores, already weighted and aggregated** — per user
  (`user_bi_score`, `user_bot_score`, `user_nt_score`, `user_at_score`, `user_score`, `sum_user_*`)
  and per tenant (`client_score`, `client_bi_score`, `client_bot_score`, `client_nt_score`,
  `client_at_score`), plus a per-activity decomposition (`client_login_score`,
  `client_view_widget_score`, `client_use_nt_score`, `client_recording_attendance_score`,
  `client_create_update_bot_score`, `client_read_bot_message_score`, … ~19 components)
- **Active flags** — tenant level `active_client_flag`, `active_bi_client_flag`,
  `active_bot_client_flag`, `active_nt_client_flag`, `active_at_client_flag`; user level
  `active_user_flag`, `active_bi_user_flag`, `active_bot_user_flag`, `active_nt_user_flag`,
  `active_at_user_flag`; plus `active_users`
- **Commercial**: `mrr`, `subscription`, **`users_limit`** (licensed seats per tenant)
- **Cohort**: `created_weeks`, `cohort_id`, `onboarding_weeks`, `rnk`

This means design rule 7 ("engagement per the existing weighted engagement-score model") needs **no
implementation** — the scores are columns. Read them; don't re-weight.

### Mapping to the spec

| metrics.yaml row | Computation |
|---|---|
| BI2 / BO2 / N2 / A2 active-paying ratio | `active_<p>_client_flag` over paying tenants (`subscription` / `dws_paying_client_subscription`) |
| **N4 license utilization — TBD closed** | `active_users / users_limit` per tenant. Independently, the dashboards' "X Paid User" denominator is `sum(quantity)` from dataset layer `1831149609855102977` per week — the subscription seat quantity. There is **no separate license table**. |
| N5 per-user NT frequency | the `use_a_nt_command` / NT event counts ÷ `active_users`, per tenant per week |
| A2 Attendance usage | `recording_attendance`, `active_at_client_flag` |
| BO2 Bot delivered/triggered | `read_a_bot_message`, `receive_bot_message`, `create_or_update_a_bot` |
| BI2 BI views | `viewing_a_widget`, `creating_or_updating_a_bi_dashboard` |
| Weekly cadence | `weeks_date` is already week-truncated — the WoW rows need no snapshot table |

Active-user definition as used by the dashboards: `user_<p>_score > 0 AND access_<p>_client = true`.

### Supporting tables (all five dashboards)

- `dws_paying_client_subscription` — canonical paying-tenant/subscription source
- `dws_paying_client_engagement_score` — engagement score at the DWS layer
- `client_health_data`, `client_health_usage_report` — client health / usage reporting
- **Churn**: `canceled_customers`, `sys_paying_user_log` — feeds the ">=2 churned in a week" reds
  (A1/N1/BI1/BO1) and the churn ledger
- Identity / seats: `sys_user`, `sys_role_user`, `sys_role`, `sys_user_mapping`, `teams_user`
- Date scaffolding: `t_time_constant`, `statistic_date`, `tenant_weeks`
- Dataset layers seen: `1831149609855102977` (seat quantity/week), `1928019073413812225`,
  `2013201163188568066`, `2013859844716625922`

## Subscription products (BI / Bot) — paying-tenant counts

From the Asset Management dashboard's BI/Bot "Paying Clients / Paying MRR by Subscription and PSA"
widgets. **Billing runs through two channels, not one** — a paying-tenant count that only reads
Chargebee undercounts:

- Chargebee: `chargebee_subscriptions`, `chargebee_item_prices`, `chargebee_invoices`
- **Pax8 (marketplace)**: `pax8_tenant`, `pax8_order_records`, `pax8_order_mapping`
- Pricing / tiering: `price_list`, `tier_price`, `tenant_payment`
- Context: `sys_tenant`, `sys_tenant_setting`, `tenant_app`, `sys_integration`,
  `client_config_status`, `psa_info`, `hubspot_companies`

Applies to BI1 / BO1 (and by extension N1 / A1) — "paying tenant retention" must union both channels.
Per-PSA breakdown is available on the same widgets.

## Asset rows (B1–B5) — partially sourced, lineage still open

`Asset usage by MSP size` (`1879106462136016897`) — grain: one row per asset, per MSP size band:

| Field | Use |
|---|---|
| `asset_name`, `asset_type` | asset identity + kind |
| `used_tenant` | tenant count using the asset → **B3** dead inventory = zero-usage items |
| `used_tenant_list` | the named tenants → feeds B2's named-tenant requirement |
| `percentage` | share of tenants → **B1** coverage, **B5** consumption share |
| `total_rnk`, `type_rnk` | ranking within all assets / within type |
| `msp_size` | MSP size segmentation |

### Template lineage — TBD closed (from the existing scorecard, not the Asset dashboard)

The answer was on the **`Weekly Active Client % Of Core Assets`** row of the existing scorecard, not
on the Asset dashboard. Two mechanisms work together — the spec's `original_id` assumption was right
but incomplete:

**1. The template catalog** — `business_type = 'Template'`:

```sql
asset_list as (
  select sr.id, sr.name,
    case when sd.layout_type = 'report_layout'      then 'Dashboard'
         when sd.layout_type = 'report_layout_page' then 'Report'
         when sd.layout_type = 'scorecard_layout'   then 'Scorecard' end as asset_type
  from sys_report sr
  inner join sys_dashboard sd on sd.business_id = sr.id::varchar
  where sr.business_type = 'Template'
  union select id, name, 'Bot' as asset_type from sys_bot     where business_type = 'Template'
  union select id, name, 'App' as asset_type from tenant_app  where type = 1 …
)
```

So the top-layer taxonomy is `sys_dashboard.layout_type` → Dashboard / Report / Scorecard, plus Bot
(`sys_bot`) and App (`tenant_app.type = 1`). Note this is **broader than the workshop's
`asset_library` scope** (dashboard / report / scorecard only) — decide whether Bot and App belong.

**2. Clone lineage — two hops, not one:**

```sql
sr.original_id,
sro.original_id as p_original_id
left join sys_report sro on sro.id = sr.original_id
…
) src on rlist.assets_id = src.original_id
      or rlist.assets_id = src.p_original_id
```

A tenant asset points at its parent via `original_id`; that parent may itself be a clone, so its
`original_id` is carried as `p_original_id` and the template match accepts **either** hop.
`metrics.yaml`'s "null = original, else cloned" is true but insufficient — **matching a single hop
undercounts clones-of-clones.**

Supporting datasets: `t_dataset_1906984466644082690` (the `asset_list` CTE, declared
`as not materialized`), `t_dataset_1830927587392749569`.

Still not sourced: the **view/usage event** side keyed to these assets (B1's per-tenant usage, B2's
banding). `MSPbots Custom Asset Inventory` (`2082117976089296897`) — the dataset that would carry it
— is **Requested and empty**: no data, no columns. And the Asset dashboard (`1907368777088110593`)
mounts only 4 of 41 widgets, so bulk capture there is unreliable (caveat 3).

## Existing `Platform Product Usage Scorecard` (`1815299047968346113`)

43 rows, each rendered as *name / current value / target* — the platform has a native scorecard
object, so **the L10 board does not need to be built from scratch**; this is the pattern to follow.

### Row shape — every product metric has two denominators

Each product (BI / Bot / NT / AT) carries four activity rows, weekly **and** monthly:

- `<P> - Weekly Active Tenants % (Product-level Paying Client Base)` — paying for *that product*
- `<P> - Weekly Active Tenants % (Full Paying Client Base)` — *all* paying tenants
- the same two for Active Users %
- plus `<P> - Tenant Level Engagement Score` (weekly and monthly)

Targets differ substantially between the two bases (BI weekly active tenants: 95% product-level vs
89.69% full). **`metrics.yaml`'s "active/paying ratio ≥80%" (A2/N2/BI2/BO2) does not say which
denominator** — that needs a decision, and the existing targets are the calibration baseline:

| | BI | Bot | NT | AT |
|---|---|---|---|---|
| Engagement score target (weekly) | — | 90 | 15 | 5 |
| WA Tenants % (prod) | 95% | 72% | 65% | 40% |
| WA Users % (prod) | 32% | 50% | 25% | 25% |
| WA Tenants % (full) | 89.69% | 65.7% | 50% | 30% |
| WA Users % (full) | 25% | 30% | 15% | 15% |

Asset rows already exist here too: `Weekly Active Client % Of Core Assets` (51% vs ≥44%),
`Engagement score of Bot core assets` (11.67 vs ≥12), `Engagement score of BI core assets`
(1.81 vs ≥10).

### The snapshot mechanism — it is **not** a Sunday snapshot

The handoff and README both say "weekly Sunday snapshots". The live SQL says otherwise:

1. **There is no snapshot or history table at all** (no `snapshot` / `hist` identifier anywhere in
   the 21k–40k-char row queries). Every weekly series is recomputed on read from a **week spine**:
   `generate_series('2022-08-29'::date, date_trunc('week', current_date), interval '1 week')`,
   left-joined to `payment` / `dws_paying_client_subscription`, with a running
   `sum(client) over (order by week_list)` for cumulative paying clients.
2. Weekly sampling of the **daily** `client_health_usage_report` is done with
   `WHERE statistic_date >= current_date - interval '366 days' AND EXTRACT(DOW FROM statistic_date) = 1`.
   In PostgreSQL `EXTRACT(DOW)` is 0 = Sunday, so **`= 1` is Monday**.
3. Weeks are Monday-based throughout: `date_trunc('week', …)` is Monday-start in Postgres, and the
   spine is seeded on `2022-08-29`, itself a Monday.

Three independent signals agree: **the week boundary is Monday, and the weekly sample is the Monday
row.** Consequences for us: we do not need to build a snapshot table either (this matches
`Product Metric Dataset.weeks_date` already being week-truncated), and H1 ("scorecard data
completeness at L10 time") must be judged against a Monday boundary — a scorecard read on Tuesday
shows the week that began the previous day.

### Inherited data-quality defects — do not copy blindly

- **8 of the "(Full Paying Client Base)" monthly rows read `0.00%` against non-zero targets**
  (BI/Bot/NT/AT × Tenants/Users). Under our design rules that is a permanently red row, which is
  exactly the kind of dead red that teaches people to ignore reds. The full-base monthly calculation
  is broken or unpopulated — and per the handoff's own warning, **empty must not be read as zero**.
- `BI - Monthly Active Tenants % (Product-level)` reads **101.80%** — over 100%, so numerator and
  denominator are on mismatched bases (likely a paying-base timing lag).

Both must be fixed or excluded before any of these definitions are reused.

### Extra dimensions worth keeping

- **Client size banding** (from `client_health_usage_report.USR`): `>=1000` Mega, `>=100` Large,
  `>=25` Medium, `>=10` Small, `<10` Micro — the same `msp_size` used by the asset dataset.
- **Per-PSA user identity**: `task_autotask_user`, `connectwise_user`, `halo_agent`,
  `kaseya_bms_users` — needed for any user-count denominator across PSAs.

## Capture status by dashboard

| Dashboard | Id | Widgets (mounted / captured) | State |
|---|---|---|---|
| AI Credits | `1985164400759279618` | 13 / 13 | **done** |
| Per-product usage: NT | `1796388005714911233` | 19 of 26 / 9 | **done** — closed the N4 license TBD |
| Per-product usage: BI | `1796382716256718850` | 16 of 21 / 8 | **done** |
| Per-product usage: Bot | `1796384999498539009` | 12 of 22 / 2 | **done** — same model confirmed |
| Per-product usage: Attendance | `1796389551526338561` | 19 of 23 / 2 | **done** — same model + churn tables |
| Per-product usage: Platform | `1795279517164638210` | 5 of 43 / 3 | **done** — same model confirmed |
| Asset Management: Usage | `1907368777088110593` | 4 of 41 / 4 | partial — asset *usage events* still unsourced |
| **Existing Product Usage Scorecard** | `1815299047968346113` | 43 rows / 3 queries | **done** — closed the template-lineage TBD; corrected the "Sunday snapshot" claim |

Coverage note: on the four confirming dashboards we captured only the lead widgets on purpose. Once
BI and NT proved the shared model (identical tables, identical dataset ids), further widgets on
Bot/Attendance/Platform would restate the same sources. The Platform board mounts only 5 of 43
widgets, so anything unique further down it is **not** covered — revisit if a Platform-specific row
appears in the spec.

## ROI labor side — `Timesheet Project` enum (TBD closed)

Pulled live from the ClickUp **workspace-level** custom field `Timesheet Project`
(`83a718c8-aa8e-494f-bcb8-1513caf32af8`, dropdown, 23 options) on 2026-07-29. Product mapping:

| Card | Timesheet Project option(s) |
|---|---|
| tqa | **`AI Ticket QA - Alpha` + `AI Ticket QA - Beta`** — two options, so TQA labor is their sum |
| sentiment_max | `AI Sentiment` |
| triage | `AI Ticket Triage` |
| ticket_intake | `AI intake` |
| bi / bot / next_ticket / attendance | `BI` / `Bot` / `NT` / `Attendance` |
| sap | `SAP - SOP Agent Platform` (also `SOP use case`, `Agent Platform` — confirm scope) |
| mpd | `Evolve MPD` |

Not obviously mapped, needs Micus/Kevin: **`asset_library`** has no option of its own (closest are
`Client Customization` / `Product Team - General`), and **`csm_internal_tool`** has none (`Trellis`?
`AI RevOps`?). Non-product options to exclude from product ROI: `Admin`,
`Product Team - General`, `Leadership Team - General`, `Recruitment`, `SRE`, `Integration`,
`App Platform`, `Agent Platform`, `Client Customization`.

Design rule 8 ("direct hours only, no allocation of generic tasks") has a concrete implementation:
the sibling field **`Timesheet Category`** (`abc86eb2-…`) carries `Meeting`, `Management`,
`Recruitment`, `Agile Practice`, `Department Rock`, `Operation`, `Feature`, `Bug`, `KB`, `Security`,
`Client Engagement` — exclude the non-delivery categories rather than trying to filter by task name.
`Timesheet Client` (`cf2b4d16-…`) is free short text, so it cannot be relied on as an enum.

## Capture caveats (bit us once — don't repeat)

1. **SQL Inspector shows the *execution-time* query**, not the widget's stored definition: it
   carries the pagination wrapper (`select count(*) over() as mb_total_cnt … limit 50 offset 0`),
   the widget's own filters (e.g. `where "subscription_status" = 'active'`), its sort, and a
   `t_query_<id>` CTE that materializes relative date ranges. Strip the wrapper before reusing.
2. **Never scrape the SQL out of the Monaco DOM.** It is virtualized — a 16,434-char query rendered
   only 1,498 chars of `.view-lines`, i.e. 9%, with no visible truncation. Read the editor
   component's own `value` instead.
3. **Widgets are lazily mounted and `.widget` DOM order ≠ visual order.** An unmounted widget has
   zero action icons and an empty action menu; scrolling it into view helps but is not reliable on a
   41-widget board. Verify the captured widget's own title rather than trusting an index.
4. A dataset row in the list can be a *request*, not a source: check for real data columns before
   planning against it (`MSPbots Custom Asset Inventory` looks legitimate in the list and is empty).
