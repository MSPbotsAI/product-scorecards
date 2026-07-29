// Part of the `mb-logs` skill (shared-key mode) — copy alongside azure-monitor-client.ts + log-queryer.ts
// into service/lib/. Writes logs via the legacy HTTP Data Collector API (shared key + HMAC).

import crypto from 'node:crypto'

interface IngesterOptions {
  batchSize?: number
  flushInterval?: number
}

/** Batches log rows per table and POSTs them to Azure Monitor (HTTP Data Collector API). */
export class LogIngester {
  workspaceId: string
  sharedKey: string
  batchSize: number
  flushInterval: number
  private logBuffer = new Map<string, Record<string, unknown>[]>()
  private flushTimer: ReturnType<typeof setInterval> | null = null
  private isFlushing = false

  constructor(workspaceId: string, sharedKey: string, options: IngesterOptions = {}) {
    this.workspaceId = workspaceId
    this.sharedKey = sharedKey
    this.batchSize = options.batchSize ?? 50
    this.flushInterval = options.flushInterval ?? 10 * 60 * 1000
    this.startFlushTimer()
  }

  startFlushTimer(): void {
    this.flushTimer = setInterval(() => void this.flush(), this.flushInterval)
  }

  stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }
  }

  /** Build the SharedKey authorization signature. */
  buildSignature(date: string, contentLength: number, method: string, contentType: string, resource: string): string {
    const xHeaders = `x-ms-date:${date}`
    const stringToHash = `${method}\n${contentLength}\n${contentType}\n${xHeaders}\n${resource}`
    const decodedKey = Buffer.from(this.sharedKey, 'base64')
    const encodedHash = crypto.createHmac('sha256', decodedKey).update(Buffer.from(stringToHash, 'utf8')).digest('base64')
    return `SharedKey ${this.workspaceId}:${encodedHash}`
  }

  /** POST a batch of logs to a Log-Type table. */
  async sendLogs(logType: string, logs: Record<string, unknown>[]): Promise<boolean> {
    const body = JSON.stringify(logs)
    const method = 'POST'
    const contentType = 'application/json'
    const resource = '/api/logs'
    const date = new Date().toUTCString()
    const contentLength = Buffer.byteLength(body)
    const signature = this.buildSignature(date, contentLength, method, contentType, resource)
    const uri = `https://${this.workspaceId}.ods.opinsights.azure.com${resource}?api-version=2016-04-01`

    const response = await fetch(uri, {
      method,
      headers: { 'content-type': contentType, Authorization: signature, 'Log-Type': logType, 'x-ms-date': date },
      body,
    })
    if (response.ok) return true
    throw new Error(`Log ingestion failed: ${response.status} - ${await response.text()}`)
  }

  /** Buffer one row for a table; flush when the batch fills. */
  async addLog(table: string, data: Record<string, unknown>): Promise<void> {
    if (!this.logBuffer.has(table)) this.logBuffer.set(table, [])
    const buffer = this.logBuffer.get(table)!
    buffer.push(data)
    if (buffer.length >= this.batchSize) await this.flushTable(table)
  }

  async flushTable(table: string): Promise<void> {
    if (this.isFlushing) return
    const buffer = this.logBuffer.get(table)
    if (!buffer || buffer.length === 0) return
    this.isFlushing = true
    this.logBuffer.set(table, [])
    try {
      await this.sendLogs(table, buffer)
    } catch (error) {
      // Re-queue on failure so logs aren't dropped.
      this.logBuffer.set(table, [...buffer, ...(this.logBuffer.get(table) ?? [])])
      throw error
    } finally {
      this.isFlushing = false
    }
  }

  async flush(): Promise<void> {
    await Promise.all([...this.logBuffer.keys()].map((table) => this.flushTable(table)))
  }

  async close(): Promise<void> {
    this.stopFlushTimer()
    await this.flush()
  }
}
