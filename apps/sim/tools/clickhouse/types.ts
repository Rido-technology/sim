import type { ToolResponse } from '@/tools/types'

export interface ClickHouseConnectionConfig {
  host: string
  port: number
  database: string
  username: string
  password: string
  protocol: 'http' | 'https'
}

export interface ClickHouseQueryParams extends ClickHouseConnectionConfig {
  query: string
}

export interface ClickHouseInsertParams extends ClickHouseConnectionConfig {
  table: string
  data: Record<string, unknown> | Record<string, unknown>[]
}

export interface ClickHouseExecuteParams extends ClickHouseConnectionConfig {
  query: string
}

export interface ClickHouseIntrospectParams extends ClickHouseConnectionConfig {}

export interface ClickHouseBaseResponse extends ToolResponse {
  output: {
    message: string
    rows: unknown[]
    rowCount: number
  }
  error?: string
}

export interface ClickHouseQueryResponse extends ClickHouseBaseResponse {}
export interface ClickHouseInsertResponse extends ClickHouseBaseResponse {}
export interface ClickHouseExecuteResponse extends ClickHouseBaseResponse {}
export interface ClickHouseResponse extends ClickHouseBaseResponse {}

export interface ClickHouseTableColumn {
  name: string
  type: string
  nullable: boolean
  default: string | null
  isPrimaryKey: boolean
}

export interface ClickHouseTableSchema {
  name: string
  database: string
  columns: ClickHouseTableColumn[]
  primaryKey: string[]
  engine: string
  orderBy: string[]
}

export interface ClickHouseIntrospectResponse extends ToolResponse {
  output: {
    message: string
    tables: ClickHouseTableSchema[]
    databases: string[]
  }
  error?: string
}
