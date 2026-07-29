// Reference shape of service/server.ts (REST + SSE + WS).
// The template already ships this structure with the production static-serving and
// graceful-shutdown bootstrap — ADD your routes; don't rewrite the bootstrap.

import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { createNodeWebSocket } from '@hono/node-ws'
import { streamSSE } from 'hono/streaming'

const basePath = (process.env.BASE_URL ?? '/').replace(/\/+$/, '')
const app = basePath ? new Hono().basePath(basePath) : new Hono()
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app })

// ── REST: group a resource and mount under /api/* ──
interface Resource { id: string; name: string; value: number }
const store = new Map<string, Resource>([['1', { id: '1', name: 'Resource 1', value: 100 }]])
let nextId = 2

const resources = new Hono()
resources.get('/', (c) => {
  const search = c.req.query('search')?.toLowerCase()
  const items = [...store.values()].filter((r) => !search || r.name.toLowerCase().includes(search))
  return c.json({ items, total: items.length })
})
resources.post('/', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Partial<Resource>
  const id = String(nextId++)
  const r: Resource = { id, name: body.name ?? `Resource ${id}`, value: body.value ?? 0 }
  store.set(id, r)
  return c.json(r, 201)
})
resources.get('/:id', (c) => {
  const r = store.get(c.req.param('id'))
  return r ? c.json(r) : c.json({ error: 'Not Found' }, 404)
})
resources.delete('/:id', (c) => {
  store.delete(c.req.param('id')) // idempotent
  return c.body(null, 204)
})
app.route('/api/resources', resources)

// ── SSE: named events ──
app.get('/sse/demo', (c) =>
  streamSSE(c, async (stream) => {
    await stream.writeSSE({ event: 'greeting', data: JSON.stringify({ message: 'hello' }) })
    for (let id = 0; !stream.aborted; id++) {
      await stream.writeSSE({ event: 'tick', id: String(id), data: JSON.stringify({ time: new Date().toISOString() }) })
      await stream.sleep(1000)
    }
  }),
)

// ── WebSocket: echo ──
app.get('/ws/demo', upgradeWebSocket((c) => {
  const query = c.req.query()
  return {
    onOpen(_e, ws) { ws.send(JSON.stringify({ type: 'open', query })) },
    onMessage(e, ws) { ws.send(JSON.stringify({ type: 'echo', data: String(e.data) })) },
    onClose() {},
  }
}))

// ── bootstrap (template ships the full version incl. production static serving) ──
const server = serve({ fetch: app.fetch, port: Number(process.env.PORT) })
injectWebSocket(server)

let closing = false
const shutdown = () => {
  if (closing) return
  closing = true
  // If you use a buffered client (e.g. the mb-logs skill), flush it here before closing.
  server.close(() => process.exit(0))
  setTimeout(() => process.exit(0), 8000).unref()
}
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
