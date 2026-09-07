// Copy to: service/lib/db.ts
//
// Multi-tenant Postgres access for an MSPBots Node app, via the shared SDK @mspbots/tenant-db:
//   - getDb(tenantId)  → Drizzle client for that tenant's database. Connection params are fetched from
//                        pg-proxy (tenant-mgr) by tenant id and pooled/cached per tenant.
//   - getDirectDb()    → Drizzle client on the DB_* connection: the shared dev database locally, or the
//                        fallback when no pg-proxy is configured.
//   - getSql(tenantId) → raw postgres client for DDL/migrations.
//   - closeAll()       → drain every pool (call from the server's shutdown()).
// The tenant id comes from the authenticated user (AuthUser.tenantId — mb-auth skill); this module never parses tokens.
//
// Requires: pnpm add @mspbots/tenant-db postgres   (drizzle-orm ships with the template)
// Env: DB_PROXY_BASE_URL + DB_PROXY_API_KEY (deployed, injected) · DB_HOST/PORT/NAME/USER/PASSWORD (local / fallback)

import { createTenantDb } from '@mspbots/tenant-db'
import * as schema from '../schema.ts'

// Tables are declared under pgSchema('<app id>') in service/schema.ts, so they are already schema-qualified.
const tenant = createTenantDb({ schema })

export const getDb = tenant.getDb
export const getSql = tenant.getSql
export const getDirectDb = tenant.getDirectDb
export const closeAll = tenant.closeAll

/**
 * Pick the right client for a request: per-tenant through pg-proxy when it is configured (deployed),
 * otherwise the direct DB_* connection (local development on the shared dev database).
 */
export function db(tenantId?: string) {
  if (process.env.DB_PROXY_BASE_URL && tenantId) return getDb(tenantId)
  return getDirectDb()
}
