---
name: mb-report
description: Read MSPBots dataset and widget data from an MSPBots Node app. Use when the user wants to fetch, query, list, or page through a dataset or widget from the MSPBots Report platform — e.g. show report data, pull dataset records, or call the MSPBots Public API. Provides createMspbotsReportClient() with token+tenantCode and public-API-key modes.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# Report (MSPBots dataset / widget client)

Fetch dataset/widget data from the MSPBots Report platform. Two modes:

- **Token mode** — `getDatasetData()` / `listDatasets()` using the caller's `token` and
  `tenantCode` (forward them from the incoming request). Default mode.
- **Public API mode** — `getPublicDatasetData()` / `getPublicWidgetData()` using a
  `public_api_key`.

No extra dependencies (global `fetch`). Backend only.

## When to use

Displaying or processing report data managed in MSPBots — datasets and widgets,
including paged reads.

## Integration steps

### 1. Add the client

Copy [`reference/mspbots-report.ts`](reference/mspbots-report.ts) to `service/lib/mspbots-report.ts`.

### 2. Token mode (datasets for the current user)

The frontend sends the user's auth token; pass it plus the tenant to the client:

```typescript
import { createMspbotsReportClient } from './lib/mspbots-report.ts'

const report = createMspbotsReportClient({
  mspbots_client_host: 'https://app.mspbots.ai/web/reports',
})

app.get('/api/report/:datasetId', async (c) => {
  const token = c.req.header('authorization')?.replace('Bearer ', '') ?? c.req.header('token') ?? ''
  const tenantCode = c.req.header('tenantCode') ?? ''
  const current = Number(c.req.query('current') ?? 1)
  const size = Number(c.req.query('size') ?? 50)

  const data = await report.getDatasetData(c.req.param('datasetId'), { current, size }, { token, tenantCode })
  return c.json(data)
})
```

Pagination: `current` is a 1-based integer (default 1); `size` must be `0 < size < 1000`
(default 50). Token-mode response shape:

```json
{ "code": 0, "msg": "success", "data": { "records": [], "total": 0, "size": 50, "current": 1, "pages": 0 } }
```

### 3. Public API mode (no user token)

```typescript
const report = createMspbotsReportClient({ public_api_key: process.env.PUBLIC_API_KEY })

const ds = await report.getPublicDatasetData('1889449566131073026', { current: 1, size: 20 })
const wg = await report.getPublicWidgetData('2001128158086168578', { filter: 'limit 10' })
```

Set the key/host via `.env.local` (or pass them in):

```env
PUBLIC_API_KEY=...
PUBLIC_API_HOST=https://api.mspbots.ai/
```

Public-API response shape:

```json
{ "code": 0, "msg": "success", "requestId": "…", "data": [ /* records */ ] }
```

## Checklist

- [ ] `service/lib/mspbots-report.ts` copied
- [ ] token mode: forward `token` + `tenantCode` from the request
- [ ] public mode: `PUBLIC_API_KEY` set (or passed in)
- [ ] `current`/`size` within bounds

## Common issues

- **`token is required` / `tenantCode is required`** → not forwarded from the request headers.
- **`public_api_key is required`** → using a `getPublic*` method without a key.
- **`size must be less than 1000`** → cap the page size.
- **401/403 from the API** → the user's token is missing/expired, or the tenant lacks access to that dataset.
