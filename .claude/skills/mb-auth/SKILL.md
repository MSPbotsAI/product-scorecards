---
name: mb-auth
description: Authenticate and authorize requests in an MSPBots Node app. Use when the user wants to protect API routes, require login, check user roles/permissions, restrict an endpoint to admins, read the current user on the backend, or verify the platform JWT. Covers EdDSA token verification with jose, native-Hono role guards, and a local-dev mock user.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# Auth (JWT + role permissions)

The platform issues EdDSA-signed JWTs. The frontend (the globally-injected `$fetch`)
attaches them as `Authorization: Bearer <token>`; the backend verifies them with the
platform public key (baked into the reference code) and checks roles. `jose` is
already a template dependency.

## When to use

Any endpoint limited to logged-in users or specific roles, or any handler that needs
the current user (id, email, tenant, roles).

## Integration steps

### 1. Add the module

Copy [`reference/auth.ts`](reference/auth.ts) to `service/lib/auth.ts`. No extra install
(uses `jose`).

### 2. Protect routes (native Hono)

Guard a path/group with a role, then read the user in handlers:

```typescript
import { requireRolesMw, getUser } from './lib/auth.ts'

// Everything under /api/admin requires the 'admin' role (superAdmin always passes).
app.use('/api/admin/*', requireRolesMw(['admin']))
app.get('/api/admin/me', (c) => c.json({ user: getUser(c) }))

// A single route, default role 'user':
app.use('/api/profile', requireRolesMw())
app.get('/api/profile', (c) => c.json({ id: getUser(c)?.id }))
```

Public routes need no guard — just don't put a `requireRolesMw` in front of them.

Need finer control inside a handler? Call the primitives directly:

```typescript
import { authenticateToken, authorizeToken } from './lib/auth.ts'

app.get('/api/maybe', async (c) => {
  const user = await authenticateToken(c.req.header('authorization')) // null if not logged in
  return c.json({ greeting: user ? `hi ${user.displayName}` : 'hi guest' })
})
```

### 3. Local development

No auth service runs locally. Set `ENV=dev` in `.env.local`; an empty/absent token then
resolves to a **superAdmin mock user** so every guard passes:

```env
ENV=dev
```

Leave it unset in production so real verification is enforced.

## What you get on the user

The verified payload (and the dev mock) includes: `id`, `email`, `displayName`, `roles`,
`tenantId`, `tenantName`, `timezoneId`. `superAdmin` bypasses all role checks.

## Frontend note

Roles/token on the client come from `useAccess()` (globally injected by the app runtime, no import):

```tsx
const { roles, tokenPayload, isReady } = useAccess()
```

Page-level menu/route gating is declared in a page's `meta` (see `pages/admin/page.tsx`,
`meta.route` / `meta.menu`). This skill is about **backend** enforcement — always verify
on the server even if the UI hides something.

## Checklist

- [ ] `service/lib/auth.ts` copied
- [ ] protected routes guarded with `requireRolesMw([...])`
- [ ] handlers read the user via `getUser(c)`
- [ ] `ENV=dev` set locally; unset in production

## Common issues

- **Always 403 in prod** → the frontend isn't sending the token, or the role names don't match. Inspect `getUser(c)?.roles`.
- **Works locally, fails deployed** → you relied on the `ENV=dev` mock; ensure real tokens carry the expected roles.
