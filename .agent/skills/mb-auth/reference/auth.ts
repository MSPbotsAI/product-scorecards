// Copy to: service/lib/auth.ts
//
// JWT verification + role authorization for an MSPBots Node app (native Hono).
// Tokens are EdDSA-signed by the platform; the frontend's globally-injected $fetch attaches
// them as `Authorization: Bearer <token>`. This module verifies them with the
// platform public key and exposes Hono guards.
//
// Requires: `jose` (already in this template's package.json).
//
// Local dev: set `ENV=dev` in .env.local to bypass verification — an empty token
// then resolves to a superAdmin mock user (no real auth service needed locally).

import { jwtVerify, importSPKI } from 'jose'
import type { Context, MiddlewareHandler } from 'hono'

const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAOnD2mXqGl3URgtoAjQGrS8agwmxo97EAoU++9Ej6d3I=
-----END PUBLIC KEY-----`

const publicKey = await importSPKI(PUBLIC_KEY, 'EdDSA')

export interface AuthUser {
  id: string
  email?: string
  displayName?: string
  avatarUrl?: string | null
  roles?: string[]
  timezoneId?: string
  timeZoneName?: string
  tenantId?: string
  tenantName?: string
  [key: string]: unknown
}

const DEV_USER: AuthUser = {
  id: '19cc2e98-bb84-4ad4-a146-e4292b869112',
  email: 'develop@msbotss.ai',
  displayName: 'Developer',
  avatarUrl: null,
  roles: ['superAdmin'],
  timezoneId: 'Asia/Shanghai',
  timeZoneName: 'Asia/Shanghai',
  tenantId: '13533f3a-6050-4ba9-964f-b8f4e0654b29',
  tenantName: 'MSPBots.ai',
}

/** Verify a JWT and return its payload, or null when invalid. */
export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, publicKey, { algorithms: ['EdDSA'] })
    return payload as AuthUser
  } catch {
    return null
  }
}

/** Resolve an Authorization header to a user. Empty + ENV=dev → mock superAdmin. */
export async function authenticateToken(authorization?: string): Promise<AuthUser | null> {
  const token = authorization?.replace('Bearer ', '').trim()
  if (!token) {
    if (process.env.ENV === 'dev') return DEV_USER
    console.warn('auth: token is empty')
    return null
  }
  return verifyToken(token)
}

/** Authenticate, then require one of `allowedRoles` (superAdmin always passes). */
export async function authorizeToken(authorization: string | undefined, allowedRoles: string[]): Promise<AuthUser | null> {
  const user = await authenticateToken(authorization)
  if (user && Array.isArray(user.roles) && user.roles.length > 0) {
    if (user.roles.includes('superAdmin')) return user
    const ok = user.roles.some((r) => allowedRoles.includes(r))
    if (!ok) console.warn(`auth: user ${user.id} [${user.roles}] lacks role [${allowedRoles}]`)
    return ok ? user : null
  }
  return null
}

/**
 * Hono middleware that requires one of `allowedRoles`. On success the verified
 * user is stored on the context — read it with getUser(c).
 *
 * @example
 *   app.use('/api/admin/*', requireRolesMw(['admin']))
 *   app.get('/api/admin/stats', (c) => c.json({ me: getUser(c) }))
 */
export function requireRolesMw(allowedRoles: string[] = ['user']): MiddlewareHandler {
  return async (c, next) => {
    const user = await authorizeToken(c.req.header('authorization'), allowedRoles)
    if (!user) return c.json({ message: 'Permission denied', code: 403 }, 403)
    c.set('user', user)
    await next()
  }
}

/** Read the user set by requireRolesMw. */
export function getUser<T = AuthUser>(c: Context): T | undefined {
  return c.get('user') as T | undefined
}
