import type { TableRow, ToolResponse } from '@/tools/types'

export interface GraphQLRequestParams {
  method: 'GET' | 'POST'
  url: string
  params?: TableRow[]
  headers?: TableRow[]
  query: string
  variables?: string
  useProxy?: boolean
  proxyHost?: string
  proxyPort?: string
  proxyUsername?: string
  proxyPassword?: string
  timeout?: number
}

export interface GraphQLRequestResponse extends ToolResponse {
  output: {
    data: unknown
    errors?: unknown[]
    status: number
    headers: Record<string, string>
  }
}
