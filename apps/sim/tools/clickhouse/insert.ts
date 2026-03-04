import type { ClickHouseInsertParams, ClickHouseInsertResponse } from '@/tools/clickhouse/types'
import type { ToolConfig } from '@/tools/types'

export const insertTool: ToolConfig<ClickHouseInsertParams, ClickHouseInsertResponse> = {
  id: 'clickhouse_insert',
  name: 'ClickHouse Insert',
  description: 'Insert rows into a ClickHouse table',
  version: '1.0',

  params: {
    host: {
      type: 'string',
      required: true,
      visibility: 'user-only',
      description: 'ClickHouse server hostname or IP address',
    },
    port: {
      type: 'number',
      required: true,
      visibility: 'user-only',
      description: 'ClickHouse HTTP port (default: 8123)',
    },
    database: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Database name to connect to',
    },
    username: {
      type: 'string',
      required: true,
      visibility: 'user-only',
      description: 'ClickHouse username',
    },
    password: {
      type: 'string',
      required: true,
      visibility: 'user-only',
      description: 'ClickHouse password',
    },
    protocol: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'Protocol to use (http or https)',
    },
    table: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Table name to insert into',
    },
    data: {
      type: 'object',
      required: true,
      visibility: 'user-or-llm',
      description: 'Row or array of rows to insert as key-value pairs',
    },
  },

  request: {
    url: '/api/tools/clickhouse/insert',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => ({
      host: params.host,
      port: Number(params.port),
      database: params.database,
      username: params.username,
      password: params.password,
      protocol: params.protocol || 'http',
      table: params.table,
      data: params.data,
    }),
  },

  transformResponse: async (response: Response) => {
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'ClickHouse insert failed')
    }

    return {
      success: true,
      output: {
        message: data.message || 'Data inserted successfully',
        rows: data.rows || [],
        rowCount: data.rowCount || 0,
      },
      error: undefined,
    }
  },

  outputs: {
    message: { type: 'string', description: 'Operation status message' },
    rows: { type: 'array', description: 'Array of inserted rows' },
    rowCount: { type: 'number', description: 'Number of rows inserted' },
  },
}
