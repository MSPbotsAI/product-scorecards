// Copy to: service/lib/auth.ts
//
// Backend authentication/authorization for an MSPBots Node app, provided by the shared package
// @mspbots/auth (Logto JWT via JWKS, tenant API keys via Redis, admin checks, per-tenant install gate).
// This file re-exports the package and adds a few Hono guards, so the rest of the app imports from
// './lib/auth.ts' and the package can evolve underneath.
//
// Requires: pnpm add @mspbots/auth
// Env (deployed, injected by the platform): AUTH_PROVIDER=logto, LOGTO_ISSUER, LOGTO_APP_ID, LOGTO_AUDIENCE,
//      LOGTO_ADMIN_ROLES; REDIS_* for API keys / install gate.
// Local dev: ENV=dev → an empty token resolves to a superAdmin mock user. Never set ENV=dev when deployed.

import type { Context, MiddlewareHandler } from 'hono'
import { authenticate, isAdmin, isPlatformAdmin, type AuthUser } from '@mspbots/auth'

export * from '@mspbots/auth'

/** Read the user stored by one of the guards below. */
export function getUser<T = AuthUser>(c: Context): T | undefined {
  return c.get('user') as T | undefined
}

/** Require a logged-in user (Bearer JWT) or a valid tenant API key (X-API-Key); 401 otherwise. */
export function requireUser(): MiddlewareHandler {
  return async (c, next) => {
    const user = await authenticate(c)
    if (!user) return c.json({ code: 401, message: 'Unauthorized' }, 401)
    c.set('user', user)
    await next()
  }
}

/** Require an organization admin of the caller's own tenant (`admin`, or the global `superAdmin`); 403 otherwise. */
export function requireAdmin(): MiddlewareHandler {
  return async (c, next) => {
    const user = await authenticate(c)
    if (!user) return c.json({ code: 401, message: 'Unauthorized' }, 401)
    if (!isAdmin(user)) return c.json({ code: 403, message: 'Forbidden: admin required' }, 403)
    c.set('user', user)
    await next()
  }
}

/**
 * Require the global platform role `superAdmin` — for anything that reads or writes across tenants.
 * Never gate cross-tenant endpoints with isAdmin(): an organization admin must not see other tenants.
 */
export function requirePlatformAdmin(): MiddlewareHandler {
  return async (c, next) => {
    const user = await authenticate(c)
    if (!user) return c.json({ code: 401, message: 'Unauthorized' }, 401)
    if (!isPlatformAdmin(user)) return c.json({ code: 403, message: 'Forbidden: platform admin required' }, 403)
    c.set('user', user)
    await next()
  }
}
