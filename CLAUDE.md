# AGENTS.md

> This file follows the [AGENTS.md](https://agents.md) convention. It tells coding agents and developers **how to build in this project to standard**. Treat the Golden Rules as requirements, and open the relevant **skill** before implementing a feature.

## Project Overview

**MSPBots React full-stack app.** Frontend **Vite 7 + React 19**, backend **Hono on Node**, optional **PostgreSQL + Drizzle ORM**. The toolchain (`@mspbots/react` Vite plugin → `@mspbots/routes` file routing) **generates the entire app shell** — router, layout, theme, styles, auth, route guards — from your `pages/` directory. The unified **`mspack`** CLI drives dev / build / migrate / publish. Apps publish to `https://npm.mspbots.ai/` as `@app/<name>` and are identified by the top-level `id` in `package.json`.

## What you author vs. what is generated

**You author only:**
- `pages/**/page.tsx` — one `page.tsx` per screen (a component + `meta`); the directory is the route.
- `service/server.ts` — the Hono backend.
- Optional: `service/schema.ts` (DB), `service/lib/*` (capability code), `service/permissions.ts`, the `react({ app, auth, theme, layout })` config in `vite.config.ts`, root `app.ts` (app init `setup` + route guards), and `.env.local`.

**The toolchain provides these virtually — you normally don't create them:** `index.html`, the app entry, `styles.css` (Tailwind + theme), plus the runtime — `ReactDOM.createRoot`, `BrowserRouter` and the route table, `LayoutProvider`/`Layout`, the auth redirect, and `/403` role guards. `title` / `favicon` / theme-init are injected by the `@mspbots/react` plugin. The entry is fully virtual — there is no importable `mount` and you don't hand-write `main.tsx`. **To override** the virtual `index.html` / `styles.css`, drop a same-named file in the project root. If you find yourself rewriting the router or the runtime — **stop, it's wrong.**

## Golden Rules (requirements)

1. **Pages.** A screen is a **`pages/**/page.tsx`** — the directory is the route (no `meta.path`) — that **default-exports a React component** and **named-exports `meta`** (`label`, `description`, `icon`, `order`, `menu`, `route`; plus optional `fullscreen` / `group` / `placement`). The browser tab title and breadcrumb come from **`meta.label`**, and `meta.description` sets the HTML description — no `Page` wrapper needed. → **`mb-page`** skill.
2. **UI.** Build every interface from **`@mspbots/ui`** (import from the package root). Use the semantic **theme tokens** (`bg-background`, `text-muted-foreground`, `bg-primary`, `chart-1`…), merge classes with **`cn()`**, and portal overlays with **`container={root()}`**. Never hardcode colors (`#fff`, `bg-white`) or hand-roll a component the library provides. → **`mb-ui`** skill.
3. **Networking.** Client↔server calls **must** use **`$fetch` / `$ws` / `$sse`** — globally available (no import; injected by the app runtime) — never raw `fetch` / `WebSocket` / `EventSource`. Write paths as `/api/...` (or `/ws`, `/sse`); **never hardcode `/apps/<name>/`** (BASE_URL is applied for you, plus the Bearer token). → **`mb-fetch`** skill.
4. **Backend.** Write the backend in `service/server.ts` with **native Hono routes**, mounted under `/api`, `/sse`, `/ws`. Respect the injected `basePath`, resolve files via `import.meta.url` (not `__dirname`), and keep secrets server-side via `process.env`. → **`mb-server`** skill.
5. **Access is enforced on the server.** `meta.menu` / `meta.route` and `<Permission>` / `useAccess()` are **UX only**. Authorization **must** also be enforced in the backend (→ **`mb-auth`** skill). Never trust the client.
6. **Capabilities come from skills, not `@tools/*`.** For DB, auth, AI/LLM, report data, or logging, follow the matching skill and copy its reference code into `service/lib/`. **Do not** reinstall the legacy `@tools/*` packages.
7. **Identity & env.** **Never change the top-level `id`** in `package.json`. Never hand-set injected metadata (`BASE_URL`, `APP_ID`, …). Keep secrets in `.env.local` (gitignored); never commit credentials.
8. **Pure Node backend.** Use `process.env`, `node:*` APIs — **no `Deno.*`**. (See [MIGRATE.md](MIGRATE.md) if you find Deno residue.)
9. **TypeScript + ESM**, 2-space indentation. No ESLint/Prettier is enforced — match surrounding style.
10. **Validate before done:** `pnpm exec tsc --noEmit` then `pnpm build`.

## Skills — read before implementing

Skills live in `.claude/skills/` (Claude Code) with an identical mirror in `.agent/skills/`. Each has a `SKILL.md` plus `reference/` code. **Open the relevant skill before writing the feature.**

**Core (the base packages every app uses):**

| Skill | Use it for |
|---|---|
| `mb-page` | A screen: file routing, `meta`, page title via `meta`, frontend access (roles) |
| `mb-ui` | The interface: the `@mspbots/ui` catalog, forms, dialogs, tables, theming |
| `mb-fetch` | Client → server calls & streams (`$fetch` / `$ws` / `$sse`) |
| `mb-server` | The backend `service/server.ts` (Hono REST / SSE / WS) |

**Capabilities (optional integrations — copy-in Node reference code, install only the real deps):**

| Skill | Use it to… | Underlying deps |
|---|---|---|
| `mb-database` | Persist data (Drizzle + PostgreSQL) | `postgres` (`drizzle-orm` ships already) |
| `mb-auth` | Protect routes / read the user (platform JWT) | `jose` (ships already) |
| `mb-ai` | Call an LLM via the MSPBots AI Gateway (LangChain) | `langchain@^1`, `@langchain/core`, `@langchain/openai` |
| `mb-report` | Read MSPBots dataset / widget data | — (`fetch`) |
| `mb-logs` | Ship logs to Azure Monitor / Log Analytics — managed identity + DCR (preferred), or shared key + HMAC | `@azure/identity` + `@azure/monitor-ingestion`/`@azure/monitor-query-logs` (DCR) or `@azure/monitor-query` (shared key) |

See [.claude/skills/README.md](.claude/skills/README.md) for the index.

## Base packages (`@mspbots/*`)

| Package | Role | Skill |
|---|---|---|
| `@mspbots/ui` | 56 shadcn/Radix components + `cn`, `root`, `Permission`, hooks | `mb-ui` |
| `@mspbots/layout` | Layout shell — sidebar, header/breadcrumb, menu (driven by page `meta`) | `mb-page` |
| Global runtime APIs | `$fetch` / `$ws` / `$sse` (BASE_URL + Bearer auth) — **globally injected, no import** | `mb-fetch` |
| `@mspbots/routes` (dev) | File-based routing: `pages/**` → `virtual:routes` (routes + menu nodes) | `mb-page` |
| `@mspbots/react` | Vite plugin `react({ app, auth, theme, layout, hubspot })` (flat config; build-time define + html injection) **+** the app runtime (router/layout/auth/guards, globally-injected `usePages`/`usePageMeta`/`useAccess`/`useMenus`/`registerMenu`/`registerMenus`/`useHead`/`useHubspot`/`useUserpilot`/`$fetch`/`$ws`/`$sse`/`$hubspot`/`$userpilot`). Exposes only `.` (the plugin) and `./client` (ambient types). Re-exports shared types — config types (`AppOptions`/`AppConfig`/`AuthConfig`/`ThemeConfig`/`LayoutConfig`), page/server types (`PageMeta`/`PageNode`/`Menu`/`RequestCtx`/`HandlerParams`/`ServerHandler`/`ServerRoutes`/`ApiResponse`), and route-guard types (`BeforeEach`/`AfterEach`/`RouteContext`/`RouterModule`/`AccessSnapshot`); `@mspbots/react/client` (tsconfig `types`) provides global ambient + `virtual:routes` types | `mb-page` |
| `@mspbots/type` | Shared/ambient TypeScript types (page `meta`, server handlers, runtime globals) — provided via `@mspbots/react/client`, not imported directly | `mb-page` |
| `mspack` | CLI: dev / build / migrate / publish / update | — |

### App configuration — `vite.config.ts` → `react({ app, auth, theme, layout })`

The app's name/title, auth redirect, theme, and layout are passed as **flat** top-level options to the plugin (typed `AppOptions` — no `system` wrapper):

```ts
react({
  app:  { name: 'MSPbots AI', title: 'My App' },
  auth: true, // or false; enables the login redirect using the plugin's default target
  theme:  { preset: 'blue', radius: '0.75rem' }, // preset = a brand hue name (blue/celery/orange/cyan/…), default blue
  layout: { sidebar: { account: true } },
})
```

`auth` accepts three forms — `boolean` (toggle only, default target), `({ mode, dev, prod }) => string` (enable + custom redirect), or `{ enabled?, target? }` (explicit; `target` optional). **`target` is optional and defaults to a value the plugin provides** — local dev redirects to the full platform env (`https://agentint.mspbots.ai/apps/mb-platform-user/login`), production redirects to the same-origin relative path (`/apps/mb-platform-user/login`, matching the current domain automatically). Only pass `target` to override this. The template's `vite.config.ts` uses the plain `auth: false` form.

Logos/favicon are **auto-discovered** from `public/` (`logo.light.*`, `logo.dark.*`, `logo.*`, `favicon.*`) — not configured here.

### Local dev proxy

The plugin **auto-injects** a dev proxy for platform services (merged with your own `server.proxy`): `/apps/mb-platform-user/*` forwards to `https://agentint.mspbots.ai` (`changeOrigin` + set-cookie domain rewrite, to avoid cross-origin credential issues). You don't configure this — it's how Login-As (the account menu's tenant switcher) reaches the full platform environment from local dev. Your `vite.config.ts` only needs to add the business backend proxy: `^/(api|ws|sse)` → `http://127.0.0.1:${PORT}`.

**App init & route guards** live in the project-root `app.ts` (formerly `app.router.ts`; the old name still works and `mspack update` renames it). Named-export `setup` for one-time startup init — it runs after the runtime globals are installed and before the first render, the right place for `registerMenu(...)` — and/or `beforeEach` / `afterEach` for route guards (a `default` export is ignored). Import the guard types from the main entry:

```ts
import type { BeforeEach, AfterEach, RouteContext } from '@mspbots/react'

// Runs once at startup (globals ready, before first render). May be async.
export function setup() {
  registerMenu({ name: 'docs', label: 'Docs', href: 'https://docs.example.com', icon: 'BookOpen', placement: 'bottom' })
}

export const beforeEach: BeforeEach = (ctx: RouteContext) => { /* redirect / cancel */ }
export const afterEach: AfterEach = (ctx: RouteContext) => { /* after navigation */ }
```

## Directory Structure

```
.
├── pages/                 # Screens (file-based routing). Each dir holds a `page.tsx`.
│   ├── page.tsx           #   pages/page.tsx → "/"; pages/user/[id]/page.tsx → "/user/:id"
│   └── admin/page.tsx     #   meta.{label,icon,order,menu,route} drives the sidebar & access
├── service/               # Backend
│   ├── server.ts          #   Hono entry (native routes under /api, /sse, /ws; basePath = BASE_URL)
│   ├── lib/               #   (optional) capability code copied from skills (db.ts, auth.ts, …)
│   ├── schema.ts          #   (optional) Drizzle schema; its presence triggers DB migration
│   └── schemas/           #   (optional) multi-file schema dir (alternative to schema.ts)
├── public/                # Static assets; logo.* / favicon.* auto-discovered by @mspbots/react
├── drizzle/               # Drizzle migration artifacts (committed; copied into dist on build)
├── app.ts                 # App init `setup` (e.g. registerMenu) + optional route guards (beforeEach/afterEach)
├── vite.config.ts         # @mspbots/react plugin — flat config (app/auth/theme/layout)
├── tsup.config.ts         # Backend bundling (service/server.ts → ESM, node22, deps inlined)
├── drizzle.config.ts      # Drizzle Kit (postgresql; schemaFilter = package.json id)
├── tsconfig.json          # Extends @mspbots/tsconfig/react; excludes .claude/.agent
├── .env.local             # Local deployment config (DB, keys; gitignored)
├── .claude/skills/        # Skills (page, ui, fetch, server, + capabilities) — Claude Code reads these
├── .agent/skills/         # Identical mirror of .claude/skills for other agents
└── package.json           # Stable identity `id`, name, metadata.platform=node, scripts
```

> `service/schema.ts`, `service/schemas/`, `service/lib/` don't exist by default — add them on demand; `app.ts` ships with a `setup` demo you can edit or delete; `dist/` is produced by the build. The entry is **virtually provided by `@mspbots/react`** — you don't hand-write `main.tsx`, and there is no importable `mount`. You may drop an `index.html` / `styles.css` in the project root to override the virtual ones. Author your screens in `pages/**` and the backend in `service/server.ts`, not an entry or router file.

## Quickstart & Prerequisites

```bash
pnpm install     # registry → https://npm.mspbots.ai/ via .npmrc
pnpm dev         # Vite frontend + Hono backend (mspack picks a free backend port from 3000)
```

- **Node.js ≥ 22** (mspack engine ≥ 22.18.0); project is ESM.
- **pnpm** (`corepack enable pnpm`); `pnpm login` before publishing.
- **PostgreSQL** only when a DB schema is declared.

## Commands

| Command | = | Purpose |
|---|---|---|
| `pnpm dev` | `mspack dev` | Dev server (env check → identity → migrate if schema → backend `tsx watch` + Vite). `--port 5180` sets the frontend port. |
| `pnpm build` | `mspack build` | `vite build` → migrate (if schema) → `tsup` bundle → copy `drizzle/` into `dist/`. |
| `pnpm migrate` | `mspack migrate` | `drizzle-kit generate` + `migrate` (provisions schema + restricted role `user_<id>`). Needs `DB_*`. |
| `mspack publish` | — | Login → identity check vs registry → version bump → write `dist/package.json` (`@app/<name>`) → publish. `--dry-run`, `--bump`, `--tag`. (Don't use `pnpm publish`.) |
| `mspack update` | — | Re-sync an app with the latest template (and migrate Deno → Node). Force-syncs `AGENTS.md`, configs, and the skills. |

**Production run:** `NODE_ENV=production BASE_URL=/apps/<name>/ PORT=8080 node dist/server.js` (one process serves API + static frontend with SPA fallback).

## Environment Variables

**Injected app metadata — never set by hand** (mspack in dev/build, the gateway in prod, into both frontend & backend):

| Variable | Value |
|---|---|
| `BASE_URL` | Mount prefix — `/` in dev, `/apps/<name>/` in build/prod (Vite `base` → `import.meta.env.BASE_URL`; backend Hono `basePath`) |
| `APP_NAME` | App short name |
| `APP_ID` | Stable platform `id` (frontend `import.meta.env.APP_ID` / `__APP_ID__`) |
| `APP_VERSION` | `package.json` version |

**Deployment config — you provide** (cascading `.env` via dotenvx: `.env.[mode].local > .env.[mode] > .env.local > .env`; real env wins):

| Variable | Purpose | Required |
|---|---|---|
| `PORT` | Backend listen port | Prod (dev auto-assigns from 3000) |
| `NODE_ENV` | `production` enables static serving + SPA fallback | Prod |
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD` | DB connection (`user_<id>` / `pass_<id>` role) | When a schema exists |

Capability skills introduce their own env (e.g. `APP_MODE_KEY`/`APP_MODEL_NAME` for `ai`, `AZURE_*` for logging, `ENV=dev` for the `auth` dev mock) — see each skill. `.env*` are gitignored; never commit secrets.

## Validation

No test runner ships; the build is the gate after changes:

```bash
pnpm exec tsc --noEmit   # type check (tsconfig sets noEmit; .claude/.agent excluded)
pnpm build               # vite frontend + tsup backend + migration copy
```

DB changes also need a reachable Postgres and a passing `pnpm migrate`.

## Migration (Deno → Node)

Older apps used a Deno backend; this template is Node. `mspack update` migrates in place (most automatically; some manual WebSocket / `Deno.*` / CORS follow-up). **→ [MIGRATE.md](MIGRATE.md).** If you see `Deno.` usage, `service/deno.json`, `@deno/shim-deno`, or `tsc` errors on `Deno`, complete MIGRATE.md's checklist first.

## Security Notes

- `.env*` are gitignored — **never commit credentials**; keep them in `.env.local` / `process.env`, server-side only.
- Publishing auth is `pnpm login` (written to `~/.npmrc`), not project env.
- **Do not change** the top-level `id` — a mismatch with the published `id` aborts publishing.
- Migration accepts only valid SQL identifiers (regex-validated); `*.sql` must be LF (`.gitattributes`) to avoid checksum drift.
- Enforce every permission on the **backend** (`mb-auth` skill); frontend gating is cosmetic.

## Commit & PR Conventions

- **Conventional Commits** with a scope: `feat(...)`, `fix(...)`, `refactor(...)`, `docs(...)`.
- PRs explain motivation and blast radius; DB changes include migration notes (see [MIGRATE.md](MIGRATE.md)).
