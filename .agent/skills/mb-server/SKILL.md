---
name: mb-server
description: Write the backend of an MSPBots app in service/server.ts (Hono on Node). Use when adding API endpoints, REST resources, JSON handlers, Server-Sent Events streams, or WebSocket routes, reading the request body/query/headers, or wiring production behavior. Covers native Hono route patterns, the BASE_URL basePath, the dev proxy, env, app identity, and where capability skills (mb-database, mb-auth, mb-ai, mb-report, mb-logs) plug in.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# Server (`service/server.ts`, Hono on Node)

The backend is a single Hono app in `service/server.ts`. In dev it runs under
`tsx watch` (Vite proxies `/api`, `/ws`, `/sse` to it); in production it's bundled by
tsup and also serves the built frontend. You add routes; the bootstrap (serve, WS inject,
static serving, graceful shutdown) is already in the template — keep it.

## Hard rules

- **All backend code lives under `service/`**, entry `service/server.ts`. Use **native Hono routes** (`app.get/post/...`). ESM + TypeScript, 2-space indent.
- **Mount API routes under `/api`, SSE under `/sse`, WebSocket under `/ws`** — those are the prefixes Vite proxies in dev and the globally-injected `$fetch` / `$sse` / `$ws` target.
- **Respect `BASE_URL`.** The app is created with `new Hono().basePath(BASE_URL)` already — register routes with plain paths (`/api/...`); don't add the prefix yourself.
- **Resolve files via `import.meta.url`**, never assume `__dirname`.
- **Secrets stay on the backend** (LLM keys, DB creds, Azure keys). Never ship them to the client or hardcode them — read from `process.env` (`.env.local` locally; injected in prod).
- Keep the existing `bootstrap()` / production static-serving / `shutdown()` block. If you add a buffered client (logs), flush it in `shutdown()`.

## Route patterns

Group a resource in its own `Hono()` and mount it:

```ts
const resources = new Hono()
resources.get('/', (c) => c.json({ items: [...store.values()] }))
resources.post('/', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  // ...
  return c.json(created, 201)
})
resources.get('/:id', (c) => {
  const r = store.get(c.req.param('id'))
  return r ? c.json(r) : c.json({ error: 'Not Found' }, 404)
})
app.route('/api/resources', resources)
```

Read inputs from the context: `c.req.query('q')`, `c.req.param('id')`,
`await c.req.json()`, `c.req.header('authorization')`. Return with `c.json(data, status)`
/ `c.text(...)` / `c.body(null, 204)`.

### SSE (named events)

```ts
import { streamSSE } from 'hono/streaming'

app.get('/sse/demo', (c) =>
  streamSSE(c, async (stream) => {
    await stream.writeSSE({ event: 'greeting', data: JSON.stringify({ message: 'hi' }) })
    for (let id = 0; !stream.aborted; id++) {
      await stream.writeSSE({ event: 'tick', id: String(id), data: JSON.stringify({ time: new Date().toISOString() }) })
      await stream.sleep(1000)
    }
  }),
)
```

### WebSocket (`@hono/node-ws`)

`upgradeWebSocket` is created in the bootstrap and exported — use it:

```ts
app.get('/ws/demo', upgradeWebSocket((c) => {
  const query = c.req.query()
  return {
    onOpen(_e, ws) { ws.send(JSON.stringify({ type: 'open', query })) },
    onMessage(e, ws) { ws.send(JSON.stringify({ type: 'echo', data: String(e.data) })) },
    onClose() {},
  }
}))
```

A compact REST + SSE + WS reference is in [`reference/server.example.ts`](reference/server.example.ts).

## Auth, DB, AI, logging, report data

Don't reinvent these — each is its own skill with copy-in reference code:

- **Protect a route / read the user** → `mb-auth` skill (`requireRolesMw`, `getUser`). Always enforce on the server, not just the UI.
- **Persist/query data** → `mb-database` skill (Drizzle + Postgres, `service/schema.ts`).
- **Call an LLM** → `mb-ai` skill (LangChain + MSPBots AI Gateway).
- **Read MSPBots datasets/widgets** → `mb-report` skill.
- **Centralized logging** → `mb-logs` skill (Azure Monitor — DCR or shared-key mode).

## Environment & identity

- `PORT` (dev: auto; prod: required), `NODE_ENV` (`production` enables static serving), `BASE_URL` (mount prefix) — injected by mspack/the gateway. Don't set the injected metadata by hand.
- `APP_ID` / `APP_NAME` / `APP_VERSION` are injected and available via `process.env`.
- **Never change the top-level `id` in `package.json`** — it's the platform's stable identity.

## Validate

```bash
pnpm exec tsc --noEmit   # type check
pnpm build               # vite + tsup bundle
pnpm dev                 # run backend (tsx watch) + frontend
```

## Common issues

- **Frontend gets 404** → route not under `/api` (or `/ws`,`/sse`), or you re-added the BASE_URL prefix manually.
- **`Cannot find name 'Deno'`** → this is a Node backend; use `process.env`, `node:fs`, etc. (see MIGRATE.md if migrating).
- **WS route never connects** → it must be registered with the exported `upgradeWebSocket`, and the client must use `$ws`.
- **Secret leaked** → move it to `process.env`/`.env.local`; never inline keys or expose them to the client.
