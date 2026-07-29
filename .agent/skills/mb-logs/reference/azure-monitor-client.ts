// Copy to: service/lib/azure-monitor-client.ts  (with log-ingester.ts + log-queryer.ts alongside)
//
// Azure Monitor Log Analytics client: write logs via the HTTP Data Collector API
// (shared key + HMAC) and query via an AAD service principal.
//
// Requires: pnpm add @azure/identity @azure/monitor-query

import { LogIngester } from './log-ingester.ts'
import { LogQuerier, type QueryResult } from './log-queryer.ts'

export interface AzureMonitorClientConfig {
  workspaceId?: string
  /** Shared key — enables log writes. */
  sharedKey?: string
  /** Service-principal trio — enables KQL queries. */
  tenantId?: string
  clientId?: string
  clientSecret?: string
  /** Default table name. Default "DefaultLog". */
  defaultTable?: string
}

/** Combines a shared-key ingester and a service-principal querier behind one API. */
export class AzureMonitorClient {
  private defaultTable: string
  private ingester: LogIngester | null = null
  private querier: LogQuerier | null = null

  constructor(config: AzureMonitorClientConfig = {}) {
    this.defaultTable = config.defaultTable ?? 'DefaultLog'
    if (config.workspaceId && config.sharedKey) {
      this.ingester = new LogIngester(config.workspaceId, config.sharedKey)
    }
    if (config.workspaceId && config.tenantId && config.clientId && config.clientSecret) {
      this.querier = new LogQuerier(config.workspaceId, config.tenantId, config.clientId, config.clientSecret)
    }
  }

  /** Write a log row (buffered). Requires sharedKey. */
  async log(data: Record<string, unknown>, options: { table?: string } = {}): Promise<void> {
    if (!this.ingester) throw new Error('Shared key not configured. Cannot write logs.')
    await this.ingester.addLog(options.table ?? this.defaultTable, data)
  }

  /** Run a KQL query. Requires the service-principal credentials. */
  async query(kql: string): Promise<QueryResult> {
    if (!this.querier) throw new Error('Service principal credentials not configured. Cannot query logs.')
    return this.querier.query(kql)
  }

  /** Flush buffered logs. */
  async flush(): Promise<void> {
    await this.ingester?.flush()
  }

  /** Flush and stop timers. */
  async close(): Promise<void> {
    await this.ingester?.close()
  }
}

/** Factory matching the original SDK shape. */
export function createTool(config: AzureMonitorClientConfig = {}): AzureMonitorClient {
  return new AzureMonitorClient(config)
}

export default createTool
