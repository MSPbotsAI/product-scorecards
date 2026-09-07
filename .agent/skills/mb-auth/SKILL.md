---
name: mb-auth
description: Authenticate and authorize requests in an MSPBots Node app with the shared package @mspbots/auth. Use when the user wants to protect API routes, require login, check user roles/permissions, restrict an endpoint to admins or platform admins, read the current user or tenant on the backend, accept tenant API keys, or gate the app on per-tenant installation. Covers Logto JWT verification, the platform's four-role model (admin/user per organization, superAdmin/dev global), Hono guards, and a local-dev mock user.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# Auth (Logto JWT + tenant API keys + roles)

The platform's identity provider is **Logto**: each tenant is a Logto *organization*, and the
JWT carries `tenantId` (= organization id) plus the user's roles. The frontend (the globally
injected `$fetch`) attaches the token as `Authorization: Bearer <token>`; the backend verifies
it with `@mspbots/auth` (JWKS — no keys in app code) and checks roles. The same package also
accepts **tenant API keys** (`X-API-Key`, validated against Redis) and provides the
**per-tenant install gate**.

## The role model (case-sensitive names)

| Role | Scope | Meaning |
|---|---|---|
| `user` | organization | tenant member |
| `admin` | organization | manages **its own** tenant's users/settings |
| `superAdmin` | global | platform super administrator — the only role allowed **across tenants** |
| `dev` | global | platform developer (publishing tooling) |

Two checks, two audiences — don't mix them up:
- `isAdmin(user)` → `admin` **or** `superAdmin`: for endpoints that manage the caller's **own** tenant.
- `isPlatformAdmin(user)` → `superAdmin` only: for anything that lists or touches **other tenants**. Gating a cross-tenant endpoint with `isAdmin` lets any tenant admin see the whole platform.

Queries default to the caller's own tenant (`user.tenantId`); only platform-level code may go across tenants.

## When to use

Any endpoint limited to logged-in users or specific roles, any handler that needs the current
user/tenant, machine callers with API keys, or an app that must be installed per tenant.

## Integration steps

### 1. Install and add the module

```bash
pnpm add @mspbots/auth
```

Copy [`reference/auth.ts`](reference/auth.ts) to `service/lib/auth.ts`. It re-exports the
package and adds three Hono guards: `requireUser()`, `requireAdmin()`, `requirePlatformAdmin()`,
plus `getUser(c)`.

### 2. Protect routes (native Hono)

```typescript
import { requireUser, requireAdmin, requirePlatformAdmin, getUser } from './lib/auth.ts'

// Any logged-in user (or a tenant API key)
app.use('/api/profile/*', requireUser())
app.get('/api/profile', (c) => c.json({ me: getUser(c) }))

// Tenant admins (admin or superAdmin) — manage the caller's own tenant
app.use('/api/admin/*', requireAdmin())
app.get('/api/admin/users', (c) => c.json({ tenantId: getUser(c)?.tenantId }))

// Platform super admin only — anything across tenants
app.use('/api/platform/*', requirePlatformAdmin())
```

**Public (anonymous) API lives under `/api/public/*` and is registered BEFORE any guarded group** — Hono runs
middleware in registration order, so a `requireUser()` mounted on `/api` earlier would swallow it. The client
side honours the same contract: `$fetch` sends `/api/public/*` requests without a token even for a signed-in
visitor, so a visitor from another tenant is not judged by their own tenant's install state at the gateway.
Pages that use these endpoints declare `meta.public: true` (mb-page skill). Resolve the tenant from the link
itself, never from a query parameter — see "Anonymous access to tenant data" in the mb-database skill.

```typescript
const publicApi = new Hono()
publicApi.get('/shares/:token', ...)          // anonymous; rate-limit it; unknown token → 404
app.route('/api/public', publicApi)           // first
app.route('/api', authenticated)              // then the guarded group (requireUser() inside)
```

Need finer control inside a handler? Use the primitives:

```typescript
import { authenticate, authenticateToken, isAdmin } from './lib/auth.ts'

app.get('/api/maybe', async (c) => {
  const user = await authenticate(c)            // Bearer JWT or X-API-Key → AuthUser | null
  return c.json({ greeting: user ? `hi ${user.displayName}` : 'hi guest' })
})
```

`authenticate(c)` accepts both a Bearer JWT and a tenant API key; `authenticateToken(header)`
accepts only the JWT. API-key callers come back with `isApiKey: true`, `tenantId` set and no roles.

### 3. Per-tenant install gate (apps installed from the marketplace)

**Nothing to do in the app.** The platform gateway enforces it on every `/apps/<slug>/*` request: a signed-in
user (or api-key caller) whose tenant has not installed your app never reaches it — API calls get 403, page
navigations land on the platform's install page where a tenant admin can install. Install state (setting's
`sys_tenant_apps`) is the only source of truth. Do **not** add `requireAppInstalled()` / `/api/_installed`
probes in the app — they are legacy and unnecessary.

### 4. Environment

Deployed apps get everything injected by the platform (App Publish registers the app's Logto
client); copy `.env.example` → `.env.local` for local work:

```env
# local only — never in a deployed environment
ENV=dev              # empty token → superAdmin mock user

# deployed (injected): AUTH_PROVIDER=logto, LOGTO_ISSUER, LOGTO_APP_ID, LOGTO_AUDIENCE, LOGTO_ADMIN_ROLES
# deployed (injected): REDIS_HOST / REDIS_PORT / REDIS_PASSWORD / REDIS_DB — API keys + install gate
```

### 5. Frontend side

`vite.config.ts` already enables the login flow with `auth: { mode: 'logto' }`. Roles/token on
the client come from `useAccess()` (globally injected, no import):

```tsx
const { roles, tokenPayload, isReady } = useAccess()
```

Page-level gating is declared in a page's `meta` (`meta.route` / `meta.menu`, see
`pages/admin/page.tsx`) — role names there are **case-sensitive** (`superAdmin`). A page anyone may open
without logging in declares `meta.public: true` (no login redirect there; see the mb-page skill). Frontend
gating is UX only; this skill is about **backend** enforcement.

## What you get on the user

`AuthUser`: `id`, `email`, `displayName`, `roles`, `scopes`, `tenantId`, `tenantName`, and for
API-key callers `isApiKey` / `apiKeyId`.

## Checklist

- [ ] `pnpm add @mspbots/auth`; `service/lib/auth.ts` copied
- [ ] protected routes use `requireUser()` / `requireAdmin()` / `requirePlatformAdmin()`
- [ ] cross-tenant endpoints use `requirePlatformAdmin()` (never `requireAdmin()`)
- [ ] queries are scoped to `getUser(c).tenantId`
- [ ] `ENV=dev` only in `.env.local`; never deployed
- [ ] marketplace apps expose `/api/_installed` and gate with `requireAppInstalled()`

## Common issues

- **Always 401 deployed** → the frontend isn't sending the token, or `LOGTO_ISSUER`/`LOGTO_AUDIENCE` don't match the token; inspect the `iss`/`aud` claims.
- **Works locally, 403 deployed** → you relied on the `ENV=dev` mock; real tokens must carry the expected roles.
- **A tenant admin sees other tenants' data** → the endpoint used `isAdmin`/`requireAdmin()` where it needed `requirePlatformAdmin()`.
- **Role check never matches** → role names are case-sensitive: `superAdmin`, not `superadmin`.
- **API key rejected** → `REDIS_*` not configured, or the key isn't registered for that tenant.
