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

**Still open — the `original_id` lineage TBD.** Nothing captured so far distinguishes
*template-lineage* from *custom* assets (the `sys_model.original_id` / `sys_report.original_id`
expectation in `metrics.yaml`). Two facts about why:

1. `MSPbots Custom Asset Inventory` (`2082117976089296897`) — the dataset that would answer it —
   is **Requested and empty**: no data, no columns. It has been asked for but not delivered.
2. The Asset Management dashboard (`1907368777088110593`) has 41 widgets, but most are
   lazily mounted — an unmounted widget exposes no action menu at all, so bulk SQL capture across it
   is unreliable (see caveat 3).

Next step for this TBD: validate the lineage columns directly against the warehouse (Data CLI,
single-tenant is sufficient to confirm a column exists) rather than waiting on the dataset, or chase
the requested dataset. Until then B1's template-vs-custom split and B5 stay unsourced.

## Capture status by dashboard

| Dashboard | Id | State |
|---|---|---|
| AI Credits | `1985164400759279618` | **done** — 13/13 widgets, digested above |
| Asset Management: Usage | `1907368777088110593` | partial — BI/Bot billing widgets only (lazy mount) |
| Per-product usage: BI | `1796382716256718850` | not started |
| Per-product usage: Bot | `1796384999498539009` | not started |
| Per-product usage: NT | `1796388005714911233` | not started — also owns the N4 license-source TBD |
| Per-product usage: Attendance | `1796389551526338561` | not started |
| Per-product usage: Platform | `1795279517164638210` | not started |
| Existing Product Usage Scorecard | `scorecard-1815299047968346113` | not started — reuse its Sunday snapshot mechanism |

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
