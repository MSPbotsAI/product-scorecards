// Copy to: service/lib/azure-log-service.ts
//
// Ship app logs to Azure Monitor / Log Analytics using the modern Data Collection
// Rule (DCR) ingestion path + DefaultAzureCredential (managed identity on the
// platform; az login / service principal locally). Buffers logs and flushes by
// size or timer. Also runs KQL queries.
//
// Requires: pnpm add @azure/identity @azure/monitor-ingestion @azure/monitor-query-logs

import { DefaultAzureCredential } from '@azure/identity'
import { LogsIngestionClient } from '@azure/monitor-ingestion'
import { LogsQueryClient } from '@azure/monitor-query-logs'

export interface AzureLogConfig {
  /** Data Collection Endpoint URL, e.g. https://<region>.ingest.monitor.azure.com */
  ingestionEndpoint: string
  /** Immutable ID of the Data Collection Rule (dcr-…). */
  dcrImmutableId: string
  /** Log Analytics workspace ID (for queries). */
  workspaceId: string
  /** Stream name configured on the DCR. Default "Custom-AppLogs". */
  streamName?: string
  /** Auto-flush when the buffer reaches this many entries. Default 100. */
  batchSize?: number
  /** Auto-flush after this many ms. Default 5000. */
  flushIntervalMs?: number
}

type LogEntry = Record<string, unknown>

export class AzureLogService {
  private ingestionClient: LogsIngestionClient
  private queryClient: LogsQueryClient
  private config: Required<AzureLogConfig>
  private buffer: LogEntry[] = []
  private flushTimer: ReturnType<typeof setTimeout> | null = null
  private isFlushing = false

  constructor(config: AzureLogConfig) {
    this.config = { streamName: 'Custom-AppLogs', batchSize: 100, flushIntervalMs: 5000, ...config }
    const credential = new DefaultAzureCredential()
    this.ingestionClient = new LogsIngestionClient(this.config.ingestionEndpoint, credential)
    this.queryClient = new LogsQueryClient(credential)
  }

  /** Build from AZURE_LOG_* env vars. */
  static fromEnv(overrides: Partial<AzureLogConfig> = {}): AzureLogService {
    const ingestionEndpoint = process.env.AZURE_LOG_INGESTION_ENDPOINT
    const dcrImmutableId = process.env.AZURE_DCR_IMMUTABLE_ID
    const workspaceId = process.env.AZURE_LOG_WORKSPACE_ID
    const streamName = process.env.AZURE_LOG_STREAM_NAME || 'Custom-AppLogs'
    if (!ingestionEndpoint || !dcrImmutableId || !workspaceId) {
      throw new Error(
        '[AzureLogService] Missing AZURE_LOG_INGESTION_ENDPOINT, AZURE_DCR_IMMUTABLE_ID, or AZURE_LOG_WORKSPACE_ID',
      )
    }
    return new AzureLogService({ ingestionEndpoint, dcrImmutableId, workspaceId, streamName, ...overrides })
  }

  /** Buffer one log entry (non-blocking). Auto-stamps TimeGenerated. */
  log(entry: LogEntry): void {
    this.buffer.push({ TimeGenerated: new Date().toISOString(), ...entry })
    if (this.buffer.length >= this.config.batchSize) {
      void this.flush()
    } else if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => void this.flush(), this.config.flushIntervalMs)
    }
  }

  /** Upload buffered logs now. */
  async flush(): Promise<void> {
    if (this.buffer.length === 0 || this.isFlushing) return
    this.isFlushing = true
    if (this.flushTimer) {
      clearTimeout(this.flushTimer)
      this.flushTimer = null
    }
    const batch = this.buffer
    this.buffer = []
    try {
      await this.ingestionClient.upload(this.config.dcrImmutableId, this.config.streamName, batch)
    } catch (err) {
      console.error('[AzureLogService] Failed to upload logs:', err)
    } finally {
      this.isFlushing = false
      if (this.buffer.length >= this.config.batchSize) void this.flush()
    }
  }

  /** Run a KQL query against the workspace. `duration` is ISO-8601 (default PT24H). */
  async query(kql: string, options?: { duration?: string }): Promise<any> {
    const duration = options?.duration ?? 'PT24H'
    const result = await this.queryClient.queryWorkspace(this.config.workspaceId, kql, { duration } as any)
    if (result.status === 'Success') return result
    const message = (result as any).partialError?.message ?? 'Unknown query error'
    throw new Error(`KQL query failed with status '${result.status}': ${message}`)
  }
}
