import type { ToolResponse } from '@/tools/types'

export interface SurrealDBConnectionConfig {
  host: string
  port: number
  namespace: string
  database: string
  username: string
  password: string
  protocol: 'http' | 'https'
}

export interface SurrealDBQueryParams extends SurrealDBConnectionConfig {
  query: string
}

export interface SurrealDBInsertParams extends SurrealDBConnectionConfig {
  table: string
  data: Record<string, unknown> | Record<string, unknown>[]
}

export interface SurrealDBUpdateParams extends SurrealDBConnectionConfig {
  target: string
  data: Record<string, unknown>
  where?: string
}

export interface SurrealDBDeleteParams extends SurrealDBConnectionConfig {
  target: string
  where?: string
}

export interface SurrealDBExecuteParams extends SurrealDBConnectionConfig {
  query: string
}

export interface SurrealDBIntrospectParams extends SurrealDBConnectionConfig {}

export interface SurrealDBBaseResponse extends ToolResponse {
  output: {
    message: string
    records: unknown[]
    recordCount: number
  }
  error?: string
}

export interface SurrealDBQueryResponse extends SurrealDBBaseResponse {}
export interface SurrealDBInsertResponse extends SurrealDBBaseResponse {}
export interface SurrealDBUpdateResponse extends SurrealDBBaseResponse {}
export interface SurrealDBDeleteResponse extends SurrealDBBaseResponse {}
export interface SurrealDBExecuteResponse extends SurrealDBBaseResponse {}
export interface SurrealDBResponse extends SurrealDBBaseResponse {}

export interface SurrealDBTableField {
  name: string
  definition: string
}

export interface SurrealDBTableIndex {
  name: string
  definition: string
}

export interface SurrealDBTableSchema {
  name: string
  definition: string
  fields: SurrealDBTableField[]
  indexes: SurrealDBTableIndex[]
  events: Record<string, string>
}

export interface SurrealDBIntrospectResponse extends ToolResponse {
  output: {
    message: string
    tables: SurrealDBTableSchema[]
    tableNames: string[]
  }
  error?: string
}
