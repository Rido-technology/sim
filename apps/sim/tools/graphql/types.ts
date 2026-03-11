import type { TableRow, ToolResponse } from '@/tools/types'

export interface GraphQLRequestParams {
  url: string
  query: string
  variables?: Record<string, any> | TableRow[]
  headers?: Record<string, string> | TableRow[]
  operationName?: string
  timeout?: number
}

export interface GraphQLRequestResponse extends ToolResponse {
  output: {
    data: unknown
    errors?: Array<{
      message: string
      locations?: Array<{ line: number; column: number }>
      path?: string[]
      extensions?: Record<string, any>
    }>
    extensions?: Record<string, any>
  }
}
