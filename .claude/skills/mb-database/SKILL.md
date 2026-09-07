---
name: mb-database
description: Add PostgreSQL persistence to an MSPBots Node app using Drizzle ORM and the multi-tenant SDK @mspbots/tenant-db. Use when the user wants to store, persist, query, or model data — create database tables, define a schema, run migrations, or read/write rows from a Hono API handler. Covers the service/schema.ts declaration that triggers `mspack migrate`, per-tenant connections through pg-proxy, the shared dev database for local work, and the DB_* / DB_PROXY_* environment variables.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# Database (Drizzle + PostgreSQL, multi-tenant)

Persistence for an MSPBots **Node** app. Every tenant (Logto organization) has its **own
Postgres database**; the app reaches it through `@mspbots/tenant-db`, which resolves the
tenant's connection from **pg-proxy** (tenant-mgr) by tenant id and pools it. Locally, all
apps share one **dev database** and connect to it directly. The template already ships
`drizzle-orm`, `drizzle-kit`, and a ready `drizzle.config.ts`; migrations are driven by
`mspack`. You add a schema, the connection helper, and queries.

## When to use

The app needs to store data across requests/restarts (records, settings, audit trails).
For ephemeral in-memory data you don't need this.

## How the pieces fit

| | Local development | Deployed |
|---|---|---|
| Connection | `getDirectDb()` → `DB_*` = the shared dev DB (`mb_dev` role) | `getDb(tenantId)` → pg-proxy (`DB_PROXY_BASE_URL` + `DB_PROXY_API_KEY`) |
| Migrations | `pnpm migrate` / `pnpm dev` (`drizzle-kit generate` + `migrate` on the dev DB) | **App Publish** runs the same `drizzle/` migrations on every tenant DB when the app is published/installed |
| Schema | one Postgres schema per app = `package.json` `id`, created by the migration itself | same |

The tenant id comes from the authenticated user (`AuthUser.tenantId`, → `mb-auth` skill).

## Integration steps

### 1. Install the runtime deps

```bash
pnpm add @mspbots/tenant-db postgres
```

(`drizzle-orm` is already a dependency; `drizzle-kit` is wired into `mspack migrate`.)

### 2. Declare the schema — `service/schema.ts`

Its **presence** is what makes `mspack` run migrations. The schema name **must equal your
app's `id`** in `package.json` — `drizzle.config.ts` filters on it (`schemaFilter`) and every
tenant DB gets one isolated schema per app id.

Copy [`reference/schema.example.ts`](reference/schema.example.ts) to `service/schema.ts` and
set the schema name to your `package.json` `id`. Minimal shape:

```typescript
import { pgSchema, varchar, text, timestamp } from 'drizzle-orm/pg-core'
import { randomUUID } from 'node:crypto'

const app = pgSchema('<your-app-id>') // === package.json "id"

export const users = app.table('users', {
  id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => randomUUID()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type User = typeof users.$inferSelect
```

> Multiple tables can also live in `service/schemas/*.ts` instead of a single file.

### 3. Add the connection helper — `service/lib/db.ts`

Copy [`reference/db.ts`](reference/db.ts) to `service/lib/db.ts`. It wraps
`createTenantDb({ schema })` and exports:

- `getDb(tenantId)` — per-tenant Drizzle client (pg-proxy, pooled per tenant)
- `getDirectDb()` — Drizzle client on `DB_*` (local dev / fallback)
- `getSql(tenantId)` — raw `postgres` client for DDL
- `closeAll()` — drain pools; call it from `shutdown()` in `service/server.ts`
- `db(tenantId?)` — convenience: pg-proxy when configured, else direct

### 4. Configure env — `.env.local`

Copy `.env.example` to `.env.local` and fill in the dev DB password (everything else is
pre-filled for the shared dev database):

```env
DB_HOST=20.241.40.252
DB_PORT=15432
DB_NAME=mb_app_agentint
DB_USER=mb_dev
DB_PASSWORD=<shared dev DB password>
```

The dev database is disposable and holds no sensitive data; `mb_dev` may create schemas, so
the migration creates your app's schema on first run — **there is no provisioning step**.
Deployed apps receive `DB_*` **and** `DB_PROXY_BASE_URL` / `DB_PROXY_API_KEY` from the
platform; never set those by hand.

### 5. Query from a Hono handler — `service/server.ts`

```typescript
import { db, closeAll } from './lib/db.ts'
import { users } from './schema.ts'
import { authenticate } from './lib/auth.ts' // mb-auth skill

app.get('/api/users', async (c) => {
  const me = await authenticate(c)
  if (!me) return c.json({ error: 'Unauthorized' }, 401)
  const rows = await (await db(me.tenantId)).select().from(users)
  return c.json({ items: rows, total: rows.length })
})

app.post('/api/users', async (c) => {
  const me = await authenticate(c)
  if (!me) return c.json({ error: 'Unauthorized' }, 401)
  const body = await c.req.json().catch(() => ({}))
  const [created] = await (await db(me.tenantId)).insert(users).values({ name: body.name, email: body.email }).returning()
  return c.json(created, 201)
})

// in shutdown():  await closeAll()
```

`db()` is async because a tenant's connection may have to be resolved from pg-proxy first.

### 5b. Anonymous access to tenant data (public links)

A shared form, a public report, a callback URL: the visitor has no login, so nothing tells you which tenant
database to open. **Put the tenant inside the link's token and sign it** — never a `?tenant=` parameter (it leaks
the tenant id and lets anyone point you at arbitrary tenant databases). `@mspbots/tenant-db` ships the helper;
the platform injects `PUBLIC_TOKEN_SECRET` (set any value in `.env.local`):

```typescript
import { signPublicToken, parsePublicToken } from '@mspbots/tenant-db'

// creating a share (signed-in handler): store `secret` in the tenant's share table, hand out `token`
const token = signPublicToken(me.tenantId)             // "<tenantId>.<secret>.<hmac>" (base64url parts)
const { secret } = parsePublicToken(token)!

// anonymous handler (/api/public/*): the token alone routes to the right database — no lookup, no leak
publicApi.get('/shares/:token', async (c) => {
  const t = parsePublicToken(c.req.param('token'))
  if (!t) return c.json({ error: 'Not Found' }, 404)  // malformed or forged → same answer as unknown
  const share = await (await db(t.tenantId)).query.shares.findFirst({ where: eq(shares.secret, t.secret) })
  if (!share || share.revokedAt || share.expiresAt < new Date()) return c.json({ error: 'Not Found' }, 404)
  return c.json(publicView(share))
})
```

The token proves only "this link belongs to tenant X". Everything else stays the app's responsibility: look the
secret up in that tenant's database, honour expiry / revocation / passwords, answer 404 (not 401/403) for anything
unknown, rate-limit `/api/public/*`, and never log tokens. The page that renders it declares `meta.public: true`
(mb-page skill) and the endpoints live under `/api/public/*` (mb-auth skill).

### 6. Generate & apply migrations

`mspack` runs `drizzle-kit generate` + `migrate` against the dev DB whenever a schema exists:

```bash
pnpm dev        # generate + migrate, then start dev
pnpm migrate    # migrate only
```

**Commit the generated `drizzle/` directory** — App Publish replays exactly these files on
every tenant database (tracked in `<app id>.__drizzle_migrations`). `*.sql` is forced to LF
(`.gitattributes`) so checksums don't drift on Windows; never hand-edit checksums. Column
renames may need an interactive choice during `generate`.

## Checklist

- [ ] `pnpm add @mspbots/tenant-db postgres`
- [ ] `service/schema.ts` exists; schema name === `package.json` `id`
- [ ] `service/lib/db.ts` copied from `reference/db.ts`; `closeAll()` called in `shutdown()`
- [ ] `.env.local` created from `.env.example` with `DB_PASSWORD` filled in
- [ ] handlers resolve the tenant from the authenticated user and use `db(me.tenantId)`
- [ ] `drizzle/` committed after `pnpm migrate`

## Common issues

- **No migration runs** → `service/schema.ts` (or `service/schemas/`) is missing.
- **`password authentication failed for user "mb_dev"`** → `DB_PASSWORD` not set; copy `.env.example` → `.env.local`.
- **`relation … does not exist`** → run `pnpm migrate`; confirm the schema name matches `id`.
- **`Missing environment variable: DB_PROXY_BASE_URL`** → you called `getDb(tenantId)` locally; use `db(tenantId)` (falls back to direct) or `getDirectDb()`.
- **`pg-proxy request failed … 401`** → wrong `DB_PROXY_API_KEY`, or the call left the internal network and hit the API-key gateway — use the internal tenant-mgr address.
- **Tenant has no database yet** → tenant provisioning happens when the organization is created (setting); check the tenant exists in tenant-mgr.
