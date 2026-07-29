---
name: mb-logs
description: Send and query application logs in Azure Monitor / Log Analytics from an MSPBots Node app (KQL supported). Use when the user wants centralized/structured logging, to ship logs to Azure, audit/observability, or to query historical logs. Two ingestion modes — (A, preferred) managed identity (DefaultAzureCredential) + a Data Collection Rule, no secrets in code, via AzureLogService; (B, fallback) a workspace shared key (HMAC) + an AAD service principal when no DCR/managed identity is available, via AzureMonitorClient. Both buffer and batch-upload.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# Logs (Azure Monitor / Log Analytics)

Centralized logging to Azure Log Analytics from the Node backend, with KQL queries. Logs
are buffered and uploaded in batches. There are **two ingestion modes** — pick one; don't
wire up both for the same logs:

| Mode | Auth | Use when | Entry |
|---|---|---|---|
| **A — DCR (preferred)** | Managed identity (`DefaultAzureCredential`) + a Data Collection Rule — **passwordless** | You have a DCR + managed identity (the normal platform setup) | `AzureLogService` |
| **B — shared key (fallback)** | Workspace **shared key** (HMAC) for writes + an AAD **service principal** for queries | You only have a workspace ID + shared key, no DCR/managed identity | `AzureMonitorClient` |

> **Prefer Mode A on the platform** — no secrets in code (`DefaultAzureCredential` uses the
> managed identity in production and your `az login` / service principal locally). Use Mode B
> only when a DCR/managed identity isn't available.

## When to use

Structured, centralized logs that outlive a single process — observability, audit trails,
cross-instance log search.

---

## Mode A — managed identity + DCR (preferred)

### 1. Install the Azure SDKs

```bash
pnpm add @azure/identity @azure/monitor-ingestion @azure/monitor-query-logs
```

### 2. Add the service

Copy [`reference/azure-log-service.ts`](reference/azure-log-service.ts) to
`service/lib/azure-log-service.ts`.

### 3. Configure env

```env
AZURE_LOG_INGESTION_ENDPOINT="https://<region>.ingest.monitor.azure.com"
AZURE_DCR_IMMUTABLE_ID="dcr-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
AZURE_LOG_WORKSPACE_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
# Optional: AZURE_LOG_STREAM_NAME (default "Custom-AppLogs")
# Local-only service principal (managed identity is used on the platform):
# AZURE_TENANT_ID / AZURE_CLIENT_ID / AZURE_CLIENT_SECRET
```

### 4. Log and query

Create one shared logger and reuse it (`log()` is non-blocking):

```typescript
import { AzureLogService } from './lib/azure-log-service.ts'

const appLog = AzureLogService.fromEnv({ batchSize: 100, flushIntervalMs: 5000 })

app.post('/api/order', async (c) => {
  appLog.log({ level: 'INFO', service: 'orders', message: 'order created', userId: 'u-123' })
  return c.json({ ok: true })
})

// Extra fields must match the DCR's columns.
app.get('/api/logs/errors', async (c) => {
  const result = await appLog.query(
    `AppLogs_CL | where level == 'ERROR' | where TimeGenerated > ago(1h) | project TimeGenerated, message, service | take 50`,
    { duration: 'PT1H' },
  )
  return c.json(result.tables?.[0]?.rows ?? [])
})
```

---

## Mode B — shared key + HMAC (fallback)

Azure Log Analytics via the **legacy HTTP Data Collector API**: ingestion is authenticated
with the workspace **shared key** (HMAC-signed), and KQL queries use an **AAD service
principal**. Choose this only when you have a workspace ID + shared key but no DCR or managed
identity.

### 1. Install the Azure SDKs

```bash
pnpm add @azure/identity @azure/monitor-query
```

### 2. Add the client

Copy all three files into `service/lib/`:
[`reference/azure-monitor-client.ts`](reference/azure-monitor-client.ts),
[`reference/log-ingester.ts`](reference/log-ingester.ts),
[`reference/log-queryer.ts`](reference/log-queryer.ts).

### 3. Configure env & construct

```env
AZURE_WORKSPACE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_SHARED_KEY=...                 # enables writes
AZURE_TENANT_ID=...                  # the trio below enables queries
AZURE_CLIENT_ID=...
AZURE_CLIENT_SECRET=...
```

```typescript
import { createTool } from './lib/azure-monitor-client.ts'

const monitor = createTool({
  workspaceId: process.env.AZURE_WORKSPACE_ID,
  sharedKey: process.env.AZURE_SHARED_KEY,
  tenantId: process.env.AZURE_TENANT_ID,
  clientId: process.env.AZURE_CLIENT_ID,
  clientSecret: process.env.AZURE_CLIENT_SECRET,
  defaultTable: 'AppLog',
})
```

### 4. Write & query

Writes need only `workspaceId` + `sharedKey`; queries need the SP trio:

```typescript
await monitor.log({ level: 'info', message: 'user login', userId: 'u-123' }, { table: 'UserActivity' })

// Azure appends "_CL" to custom tables — query with the suffix:
const result = await monitor.query('UserActivity_CL | order by TimeGenerated desc | take 10')
console.log(result.data, result.pagination)
```

**Behavior:** writes buffer per table and auto-flush at `batchSize` (default 50) or every
`flushInterval` (default 10 min); a failed batch is re-queued rather than dropped.

---

## Flush on shutdown (both modes)

`service/server.ts` already has a `shutdown()` handler for SIGTERM/SIGINT. Flush the buffer
there so in-flight logs aren't lost on deploy/restart:

```typescript
const shutdown = () => {
  if (closing) return
  closing = true
  // Mode A: appLog.flush()  ·  Mode B: monitor.close()
  appLog.flush().finally(() => server.close(() => process.exit(0)))
  setTimeout(() => process.exit(0), 8000).unref()
}
```

## Checklist

**Mode A (DCR):**
- [ ] `pnpm add @azure/identity @azure/monitor-ingestion @azure/monitor-query-logs`
- [ ] `service/lib/azure-log-service.ts` copied
- [ ] `AZURE_LOG_*` env set
- [ ] one shared `AzureLogService` instance reused; `flush()` from the shutdown handler

**Mode B (shared key):**
- [ ] `pnpm add @azure/identity @azure/monitor-query`
- [ ] all three `reference/*.ts` copied into `service/lib/`
- [ ] `AZURE_*` env set (shared key for writes; SP trio for queries)
- [ ] one shared client reused; `close()` from the shutdown handler

## Common issues

**Mode A (DCR):**
- **Missing env error** → set all three `AZURE_LOG_*` vars.
- **`AuthenticationError`** → locally run `az login` or set the `AZURE_*` service-principal vars; on the platform confirm the managed identity has the DCR's *Monitoring Metrics Publisher* role.
- **Upload 4xx (schema mismatch)** → log fields must match the DCR stream's columns.

**Mode B (shared key):**
- **`Shared key not configured`** → set `AZURE_WORKSPACE_ID` + `AZURE_SHARED_KEY`.
- **`Service principal credentials not configured`** → set `AZURE_TENANT_ID`/`AZURE_CLIENT_ID`/`AZURE_CLIENT_SECRET` to query.
- **403 on ingest** → wrong shared key or workspace ID.

**Both:** custom tables get a `_CL` suffix (e.g. `AppLogs_CL`) — query with it; ingested rows take a few minutes to appear.
