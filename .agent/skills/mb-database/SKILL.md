---
name: mb-database
description: Add PostgreSQL persistence to an MSPBots Node app using Drizzle ORM. Use when the user wants to store, persist, query, or model data — create database tables, define a schema, run migrations, or read/write rows from a Hono API handler. Covers the service/schema.ts declaration that triggers `mspack migrate`, the postgres-js connection singleton, and the DB_* environment variables.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# Database (Drizzle + PostgreSQL)

Persistence for an MSPBots **Node** app. The template already ships `drizzle-orm`,
`drizzle-kit`, and a ready `drizzle.config.ts`; migrations are driven by `mspack`
(`pnpm dev` / `pnpm build` / `pnpm migrate`). You only add a schema, a connection
helper, and queries.

## When to use

The app needs to store data across requests/restarts (users, settings, records,
audit trails). For ephemeral in-memory data you don't need this.

## Integration steps

### 1. Install the runtime driver

`drizzle-orm` ships already; add the postgres-js driver:

```bash
pnpm add postgres
```

### 2. Declare the schema — `service/schema.ts`

Its **presence** is what makes `mspack` run migrations. The schema name **must equal
your app's `id`** in `package.json` (drizzle.config.ts filters on it via `schemaFilter`,
and the platform provisions an isolated Postgres schema + restricted role per app id).

Copy [`reference/schema.example.ts`](reference/schema.example.ts) to `service/schema.ts`
and set the schema name to your `package.json` `id`. Minimal shape:

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

Copy [`reference/db.ts`](reference/db.ts) to `service/lib/db.ts`. It exposes a lazily
created singleton `getDb()` built from the `DB_*` env vars (no per-request connecting).

### 4. Configure env vars — `.env.local`

The template's `.env.local` already carries these (gitignored). Confirm/replace with
your app's values:

```env
DB_TYPE=postgresql
DB_HOST=20.241.40.252
DB_PORT=15432
DB_NAME=mb_app_agentint
DB_USER=user_<your-app-id>
DB_PASSWORD=pass_<your-app-id>
```

`DB_USER` / `DB_PASSWORD` are the **restricted per-app role** the migration provisions
(`user_<id>` / `pass_<id>`). `APP_ID` is injected by the toolchain at runtime.

### 5. Query from a Hono handler — `service/server.ts`

```typescript
import { getDb } from './lib/db.ts'
import { users } from './schema.ts'

app.get('/api/users', async (c) => {
  const rows = await getDb().select().from(users)
  return c.json({ items: rows, total: rows.length })
})

app.post('/api/users', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const [created] = await getDb().insert(users).values({ name: body.name, email: body.email }).returning()
  return c.json(created, 201)
})
```

### 6. Generate & apply migrations

`mspack` runs `drizzle-kit generate` + `migrate` automatically whenever a schema exists:

```bash
pnpm dev        # generate + migrate, then start dev
pnpm migrate    # migrate only
```

**Commit the generated `drizzle/` directory** — it is tracked source, and `*.sql` is
forced to LF (see `.gitattributes`) so checksums don't drift on Windows. Don't hand-edit
migration checksums. Column renames may need an interactive choice during `generate`.

## Checklist

- [ ] `pnpm add postgres`
- [ ] `service/schema.ts` exists; schema name === `package.json` `id`
- [ ] `service/lib/db.ts` copied from `reference/db.ts`
- [ ] `DB_*` set in `.env.local`
- [ ] queries use `getDb()` in `service/server.ts`
- [ ] `drizzle/` committed after `pnpm migrate`

## Common issues

- **No migration runs** → `service/schema.ts` (or `service/schemas/`) is missing.
- **`relation … does not exist`** → run `pnpm migrate`; confirm the schema name matches `id`.
- **Auth error connecting** → `DB_USER`/`DB_PASSWORD` must be the per-app `user_<id>` role.
- **`Missing DB_NAME`** → env vars not loaded; check `.env.local`.
