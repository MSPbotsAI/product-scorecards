// Part of the `mb-logs` skill (shared-key mode) — copy alongside azure-monitor-client.ts + log-ingester.ts
// into service/lib/. Runs KQL queries via an AAD service principal.

import { ClientSecretCredential } from '@azure/identity'
import { LogsQueryClient } from '@azure/monitor-query'

export interface QueryResult {
  data: Record<string, unknown>[]
  pagination: { page: number; pageSize: number; totalCount: number; totalPages: number }
}

/** Executes KQL queries against a Log Analytics workspace using a service principal. */
export class LogQuerier {
  workspaceId: string
  private client: LogsQueryClient

  constructor(workspaceId: string, tenantId: string, clientId: string, clientSecret: string) {
    this.workspaceId = workspaceId
    this.client = new LogsQueryClient(new ClientSecretCredential(tenantId, clientId, clientSecret))
  }

  private makeJsonSafe(obj: unknown): unknown {
    if (obj instanceof Date) return obj.toISOString()
    if (Array.isArray(obj)) return obj.map((item) => this.makeJsonSafe(item))
    if (obj !== null && typeof obj === 'object') {
      const result: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(obj)) result[key] = this.makeJsonSafe(value)
      return result
    }
    return obj
  }

  async query(kqlQuery: string): Promise<QueryResult> {
    const response: any = await this.client.queryWorkspace(this.workspaceId, kqlQuery, null as any)
    if (response.status === 'Failure') {
      throw new Error(`Query Error: ${response.partialError?.message ?? 'Unknown error'}`)
    }
    const results: Record<string, unknown>[] = []
    for (const table of response.tables) {
      for (const row of table.rows) {
        const rowDict: Record<string, unknown> = {}
        table.columns.forEach((column: any, index: number) => {
          rowDict[column.name] = this.makeJsonSafe(row[index])
        })
        results.push(rowDict)
      }
    }
    return {
      data: results,
      pagination: { page: 1, pageSize: results.length, totalCount: results.length, totalPages: 1 },
    }
  }
}
