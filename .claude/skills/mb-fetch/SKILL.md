---
name: mb-fetch
description: Call the backend or open a stream from an MSPBots app frontend using the globally-injected client networking helpers. Use whenever the client needs data from service/server.ts — GET/POST/PUT/PATCH/DELETE, JSON APIs, file upload, Server-Sent Events (SSE), or WebSockets. Provides globally-available $fetch / $sse / $ws (no import) which auto-apply BASE_URL and the Bearer auth token. Always use these; never raw fetch / EventSource / WebSocket, and never hardcode /apps/<name>/ paths.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# Fetch (globally-injected client networking)

All client→server communication goes through the globally-injected helpers `$fetch` / `$sse` /
`$ws` (mounted on `window` by the app runtime — no import needed). These do two
things native `fetch`/`EventSource`/`WebSocket` can't: they prefix the app's `BASE_URL`
(so the same code works at `/` in dev and `/apps/<name>/` in production) and they attach
the Bearer auth token from `localStorage`.

## Hard rules

- **Always use `$fetch` / `$sse` / `$ws`.** Never raw `fetch()`, `new EventSource()`, or `new WebSocket()` — they skip BASE_URL and auth, and break in production.
- **Never hardcode `/apps/<name>/...`.** Write `/api/...` (or `/ws/...`, `/sse/...`); the helper adds the prefix.
- `$fetch` returns a **raw `Response`** — you call `.json()` / `.text()` yourself, and it does **not** throw on 4xx/5xx (check `res.ok` / the body `code`).

## API

```ts
// $fetch / $sse / $ws are globally injected (mounted on window by the runtime) — no import, call directly

$fetch(input, init?, options?): Promise<Response>   // like fetch(), + BASE_URL + Bearer token
$sse(url, options?): EventSource                     // + BASE_URL, withCredentials: true
$ws(url, options?): WebSocket                         // + BASE_URL (ws:// / wss:// auto)
```

`options` (`AuthOptions`): `{ headerName = 'Authorization', tokenPropKeys = ['token','authToken','accessToken'], formatToken }`.
Token is read from `localStorage` (those keys) and sent as `Bearer <token>` unless already prefixed.

## URL resolution

| You write | dev (`BASE_URL=/`) | prod (`BASE_URL=/apps/app/`) |
|---|---|---|
| `/api/users` | `/api/users` | `/apps/app/api/users` |
| `/users` | `/api/users` | `/apps/app/api/users` |
| `./api/x` | `/api/x` | `/apps/app/api/x` |
| `/ws/demo` | `/ws/demo` | `/apps/app/ws/demo` |
| `/sse/demo` | `/sse/demo` | `/apps/app/sse/demo` |
| `https://other.com/x` | unchanged | unchanged |

> A bare path (no `/api`,`/ws`,`/sse` prefix) is treated as an API call and gets `/api` added.

## Patterns

```ts
// GET
const res = await $fetch('/api/users')
const body = await res.json()

// POST JSON
await $fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Jane' }),
})

// SSE — server emits NAMED events; subscribe by name (onmessage won't fire for named events)
const es = $sse('/sse/demo')
es.addEventListener('tick', (e) => console.log(JSON.parse(e.data)))
es.onerror = () => es.close()

// WebSocket — no custom headers possible; pass auth via query and/or a first message
const ws = $ws(`/ws/demo?userId=${id}`)
ws.onopen = () => ws.send('hello')
ws.onmessage = (e) => console.log(String(e.data))
```

## Response convention

Backends commonly return `{ code, data?, message? }` (`code`: 200 ok, 401 unauthenticated,
403 forbidden, 500 error). Handle it explicitly:

```ts
const res = await $fetch('/api/thing')
if (!res.ok) throw new Error(`HTTP ${res.status}`)
const body = await res.json()
if (body.code === 401) { /* token missing/expired — system handles login redirect */ }
if (body.code && body.code !== 200) throw new Error(body.message)
const data = body.data ?? body
```

(SSE/WS auth: `EventSource`/`WebSocket` can't send headers; `$sse` sets `withCredentials`,
and for `$ws` pass identifiers via the query string — see the backend `mb-server` skill for the
matching route.)

## Checklist

- [ ] all client calls use `$fetch` / `$sse` / `$ws`
- [ ] paths are `/api/...` (or `/ws`, `/sse`) — no `/apps/...` hardcoded
- [ ] `$fetch` results: check `res.ok` / body `code` and parse `.json()` yourself
- [ ] SSE subscribes to named events; WS passes auth via query

## Common issues

- **404 in production, works in dev** → you used raw `fetch` or hardcoded a path; switch to `$fetch` with `/api/...`.
- **401 even when logged in** → token isn't in `localStorage` under a known key, or you bypassed `$fetch`.
- **SSE handler never fires** → server sends *named* events; use `addEventListener('<name>')`, not `onmessage`.
