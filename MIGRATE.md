# MIGRATE — Deno → Node

This template's backend moved from **Deno** to **Node** (Hono on `@hono/node-server`). `mspack update` migrates an existing app in place.

> ⚠️ `mspack update` rewrites files without a backup — **commit or stash first** (it refuses to run on a dirty git tree unless you pass `--force`).

## What `mspack update` does automatically

- **package.json** — keeps your stable top-level `id`; sets `metadata.platform=node`; merges template deps/scripts (drops `@types/deno` and the `predev` script); restores `service/deno.json` `npm:` imports as standard dependencies; adds `@deno/shim-deno` for the compatibility shim; refreshes the publish `files` list (adds `!.env*` / `!drizzle`, drops the Deno-era `!storage`).
- **Toolchain configs** — overwrites `tsconfig.json`, `tsup.config.ts`, `drizzle.config.ts`, `.gitignore`, `.gitattributes`; lands `.npmrc` and `pnpm-workspace.yaml` when missing (the latter carries `onlyBuiltDependencies: [esbuild]`, required so `pnpm install` may build esbuild).
- **Docs** — syncs `AGENTS.md` and this `MIGRATE.md`.
- **vite.config.ts** — carries your `system` block (app / auth / layout) from the old `mspbot.config.ts`.
- **Routes & pages** — migrates legacy filename routes to the directory convention (`pages/Home.tsx` → `pages/page.tsx`, `pages/User/[id].tsx` → `pages/user/[id]/page.tsx`, `pages/_layout.tsx` → `pages/layout.tsx`); **rebases relative imports in the moved files so they still resolve** (a file that sank a directory level gains a `../`; a reference to another moved page follows it, and other files under `pages/` that referenced a moved page are updated too); lifts each page's `<Page title description>` wrapper into `meta` and strips it to a Fragment.
- **Removed-dependency imports** — strips every `import … from '@mspbots/fetch'` **across the whole project** (not just `pages/`); `$fetch`/`$ws`/`$sse` are now globally injected by `@mspbots/react` (no import needed).
- **service/server.ts** — wraps your existing backend with a Node bootstrap, preserving **both** your `"METHOD /path"` route map and native Hono routes.
- **Cleanup** — removes `service/deno.json`, `service/deno.lock`, `service/.npmrc`, `mspbot.config.ts`, `vite-env.d.ts`, and template-only docs (`README.md`, `CHANGELOG.md`, `Vibe Coding SOP.md`).

## Manual steps — checklist

After `mspack update`, work through the items below. Where the migration can detect an issue, it prints an `Action needed:` note; the rest you must verify yourself.

- [ ] **WebSocket routes.** `Deno.upgradeWebSocket` is **not** provided by the `@deno/shim-deno` shim. Port each WS route to `@hono/node-ws`'s `upgradeWebSocket` (already exported from `service/server.ts`); see the template's `/ws/demo` for the pattern. *Symptom:* `tsc` error `Cannot find name 'Deno'` and a runtime failure when the route is hit.
- [ ] **Other `Deno.*` APIs.** The shim assigns `Deno` via `globalThis`, so it provides values at runtime but **no TypeScript types**. Replace `Deno.env` / `Deno.readFile` / etc. with Node (`process.env`, `node:fs`) or Web equivalents. *Symptom:* `Cannot find name 'Deno'` (esbuild/tsx still strip types and run, so it works until that path executes an unsupported API).
- [ ] **CORS / custom server config.** The old `mspbot.config.ts` `server: { cors, headers }` block is **not** carried over. Dev proxying now lives in `vite.config.ts` (`/api|/ws|/sse`); if you need response headers in production, set them in `service/server.ts`.
- [ ] **`import.meta.env` / asset imports.** The old `vite-env.d.ts` is removed and the new `tsconfig.json` does not include `vite/client`. If your frontend reads `import.meta.env.VITE_*` or imports assets (`*.svg`, `*.css`), add a `vite-env.d.ts` back with `/// <reference types="vite/client" />` (plus your `ImportMetaEnv`), or add `"vite/client"` to `tsconfig.json` `types`.
- [ ] **Build toolchain installs.** `pnpm install` must be allowed to build `esbuild`. This is enabled by `pnpm-workspace.yaml` (`onlyBuiltDependencies: [esbuild]`). If `vite` / `tsup` fail with a missing esbuild binary, confirm that file exists or run `pnpm approve-builds`.
- [ ] **Route migration edge cases.** The migration reports (as `Action needed:`) anything it couldn't move safely: a dynamic `<Page title={…}>` expression, extra `<Page>` props (only `title`/`description` are lifted into `meta`), a legacy `meta.path` (the path now comes from the directory), or two files mapping to the same directory. Resolve each where flagged.
- [ ] **Imports of a moved page from outside `pages/`.** The route migration rewrites relative imports **within** `pages/` (including other files under `pages/` that referenced a moved page). It does **not** scan outside `pages/`, so a file in `components/`, `service/`, etc. that imports a page by path (e.g. `import Admin from '../pages/Admin'`) still points at the old location. Update those import paths by hand. *Symptom:* `Cannot find module '…/pages/Admin'`.
- [ ] **`@mspbots/fetch` leftovers.** The migration deletes every `import … from '@mspbots/fetch'` project-wide. The runtime helpers `$fetch`/`$ws`/`$sse` are globally injected by `@mspbots/react`, so **frontend** usage keeps working with no import. It does **not** fix three cases: an **aliased** import (`import { $fetch as api }` — re-point to the global `$fetch`); a **type** imported from the package (e.g. `AuthOptions`, now exported by `@mspbots/type` — change the import to `from '@mspbots/type'`); and any use in the **Node backend** (`service/`), where the globals don't exist at runtime — rewrite with a server-side fetch. The migration reports both the aliased/type imports and the backend uses as `Action needed:` notes. *Symptom:* `Cannot find name '$fetch' / 'api' / 'AuthOptions'`, or a runtime `$fetch is not defined` in the backend.
- [ ] **(Recommended) Port the route map to native Hono.** The migration keeps your `"METHOD /path"` map working through a compatibility adapter, but native Hono routes (`app.get(...)`) are the current style. Once no `Deno.*` remains and the map is ported, you can drop the `@deno/shim-deno` dependency and the adapter.

## Validate

```bash
pnpm install
pnpm exec tsc --noEmit   # expect 0 errors once the items above are addressed
pnpm build               # end-to-end compile (vite + tsup) — surfaces residual Deno.* / type issues
pnpm dev                 # backend (tsx watch) + frontend (vite)
```

DB-backed apps additionally need a reachable Postgres and a passing `pnpm migrate`.

---

### For AI assistants

Treat the checklist above as actionable work, not just reference. When you see migration residue — any `Deno.` usage, a leftover `service/deno.json`, a `@deno/shim-deno` dependency, or `tsc` errors on `Deno` / `import.meta.env` — complete the unchecked items, then run the **Validate** steps. `AGENTS.md` binds this file for exactly this purpose.
