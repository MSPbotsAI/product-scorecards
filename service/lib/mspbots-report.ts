// Copy to: service/lib/mspbots-report.ts
//
// Client for the MSPBots Report API — fetch dataset and widget data. Two modes:
//   1. Token mode: getDatasetData()/listDatasets() with the caller's token + tenantCode
//      (forward these from the incoming request headers / verified user).
//   2. Public API mode: getPublicDatasetData()/getPublicWidgetData() with a public_api_key.
//
// No extra dependencies (uses global fetch). Run on the backend only.

export interface ReportClientOptions {
  /** Token-mode base, e.g. https://app.mspbots.ai/web/reports */
  mspbots_client_host?: string
  /** Public API key (only for the getPublic* methods). */
  public_api_key?: string
  /** Public API base. Defaults to PUBLIC_API_HOST env or https://api.mspbots.ai/ */
  public_api_host?: string
}

export interface PageQuery {
  /** 1-based page number (> 0). Default 1. */
  current?: number
  /** Page size (> 0 and < 1000). Default 50. */
  size?: number
  [key: string]: unknown
}

export interface AuthHeaders {
  token: string
  tenantCode: string
}

const logger = {
  debug: (...a: unknown[]) => console.debug('[report]', ...a),
  error: (...a: unknown[]) => console.error('[report]', ...a),
}

function ensurePagination(params: PageQuery = {}): PageQuery {
  return { current: params.current ?? 1, size: params.size ?? 50, ...params }
}

function toSearchParams(obj: Record<string, unknown>): URLSearchParams {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(obj)) {
    if (v !== null && v !== undefined) sp.set(k, String(v))
  }
  return sp
}

export function createMspbotsReportClient(options: ReportClientOptions = {}) {
  const config = {
    public_api_key: options.public_api_key ?? process.env.PUBLIC_API_KEY ?? '',
    public_api_host: options.public_api_host ?? process.env.PUBLIC_API_HOST ?? 'https://api.mspbots.ai/',
    ...options,
  }

  return {
    /** Dataset data via token + tenantCode (default mode). */
    async getDatasetData(datasetId: string, queryParams: PageQuery = { current: 1, size: 50 }, headers: AuthHeaders) {
      if (!datasetId) throw new Error('datasetId is required')
      const { token, tenantCode } = headers ?? ({} as AuthHeaders)
      if (!token) throw new Error('token is required')
      if (!tenantCode) throw new Error('tenantCode is required')

      const { current, size, ...rest } = queryParams
      if (current != null) {
        const n = Number(current)
        if (!Number.isInteger(n) || n <= 0) throw new Error('current must be a positive integer')
      }
      const finalSize = size == null ? 50 : Number(size)
      if (!Number.isFinite(finalSize) || finalSize <= 0) throw new Error('size must be greater than 0')
      if (finalSize >= 1000) throw new Error('size must be less than 1000')

      const sp = toSearchParams({ current: current ?? 1, size: finalSize, ...rest })
      const url = `${config.mspbots_client_host}/sys/dataset/${datasetId}/data?${sp}`
      return this._get(url, { token, tenantCode })
    },

    /** Available datasets via token + tenantCode. */
    async listDatasets(queryParams: Record<string, unknown> = {}, headers: AuthHeaders) {
      const { token, tenantCode } = headers ?? ({} as AuthHeaders)
      if (!token) throw new Error('token is required')
      if (!tenantCode) throw new Error('tenantCode is required')
      const merged = { showAllIntegration: false, internal: false, tenantCode: 1001, resourceType: 5, ...queryParams }
      const url = `${config.mspbots_client_host}/sys/dataset/simple-list?${toSearchParams(merged)}`
      return this._get(url, { token, tenantCode })
    },

    /** Dataset data via the Public API (apiKey). */
    async getPublicDatasetData(datasetId: string, queryParams: PageQuery = {}) {
      if (!datasetId) throw new Error('datasetId is required')
      if (!config.public_api_key) throw new Error('public_api_key is required')
      const url = `${config.public_api_host}/api/dataset/${datasetId}?${toSearchParams(ensurePagination(queryParams))}`
      return this._get(url, { apiKey: config.public_api_key })
    },

    /** Widget data via the Public API (apiKey). */
    async getPublicWidgetData(widgetId: string, queryParams: PageQuery = {}) {
      if (!widgetId) throw new Error('widgetId is required')
      if (!config.public_api_key) throw new Error('public_api_key is required')
      const url = `${config.public_api_host}/api/widget/${widgetId}?${toSearchParams(ensurePagination(queryParams))}`
      return this._get(url, { apiKey: config.public_api_key })
    },

    async _get(url: string, headers: Record<string, string>) {
      logger.debug('GET', url)
      const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json', ...headers } })
      if (!res.ok) {
        const text = await res.text()
        logger.error(`API error ${res.status}: ${text}`)
        throw new Error(`MSPBots Report API error (${res.status}): ${text}`)
      }
      return res.json()
    },
  }
}
