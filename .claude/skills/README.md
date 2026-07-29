# MSPBots App Skills

Skills that teach an agent to build an MSPBots app **to the template's standards**. They
come in two tiers: **core** skills cover the base packages every app uses (`@mspbots/*`),
and **capability** skills add optional backend integrations (formerly the `@tools/*`
packages) as copy-in Node reference code.

> **Mirror:** identical copies live under `.claude/skills/` (read by Claude Code) and
> `.agent/skills/` (read by other agents). Edit one, then re-mirror the tree.

## The golden rule

**You only author `pages/*.tsx` and `service/server.ts`.** The toolchain (`@mspbots/react`
plugin + `@mspbots/routes` + the app runtime it mounts) owns the app entry,
router, layout, theme, styles, auth and route guards. The entry is fully virtual — you don't
hand-write `main.tsx`, and there is no importable `mount`. Never write a `BrowserRouter`, a
route table, or import CSS / set up Tailwind. (App init `setup` + optional route guards go in a root `app.ts`.)

## Core skills (base packages)

| Skill | Use it for | Key packages |
|---|---|---|
| [mb-page](mb-page/SKILL.md) | A screen: file routing, `meta`, page title, frontend access (roles) | `@mspbots/routes`, `@mspbots/layout`, `@mspbots/react` |
| [mb-ui](mb-ui/SKILL.md) | The interface: buttons, forms, dialogs, tables, the 56-component catalog, theming | `@mspbots/ui` |
| [mb-fetch](mb-fetch/SKILL.md) | Client → server calls and streams (`$fetch`/`$ws`/`$sse`) | globally injected (no import) |
| [mb-server](mb-server/SKILL.md) | The backend `service/server.ts` (Hono REST/SSE/WS) | `hono`, `@hono/node-*` |

## Capability skills (optional integrations)

Each carries Node reference code to copy into `service/lib/` + install only the real deps.
Apps no longer install the old `@tools/*` packages.

| Skill | Capability | Replaces | Underlying deps |
|---|---|---|---|
| [mb-database](mb-database/SKILL.md) | PostgreSQL persistence (Drizzle ORM) | `@tools/database` | `drizzle-orm`\*, `postgres` |
| [mb-auth](mb-auth/SKILL.md) | JWT auth + role guards (backend) | `@tools/auth` | `jose`\* |
| [mb-ai](mb-ai/SKILL.md) | LLM via MSPBots AI Gateway + LangChain | `@tools/langchain-sdk` | `langchain`, `@langchain/core`, `@langchain/openai` |
| [mb-report](mb-report/SKILL.md) | MSPBots dataset / widget data | `@tools/common` | none (`fetch`) |
| [mb-logs](mb-logs/SKILL.md) | Azure Monitor logs — managed identity + DCR (preferred) **or** shared key + HMAC | `@tools/applogs-sdk`, `@tools/azure-monitor-sdk` | `@azure/identity` + `@azure/monitor-ingestion` & `@azure/monitor-query-logs` (DCR) **or** `@azure/monitor-query` (shared key) |

\* already in this template's `package.json`.

## How to use a skill

1. Read the skill's `SKILL.md` (and its `reference/` files) before implementing.
2. For capabilities: copy the `reference/` code into `service/lib/`, `pnpm add` the listed deps, wire it into `service/server.ts`.
3. Validate: `pnpm exec tsc --noEmit` then `pnpm build`.

## Pure Node

All backend reference code targets **Node** only — `process.env`, native Hono routes,
`process.on('SIGTERM'|'SIGINT')`. No `manifest.permissions`, no `service/deno.json`
(ignore those steps in any old `@tools/*` README). Logging: **mb-logs** covers both the
managed-identity + DCR path (preferred on the platform) and the shared-key + HMAC fallback.
