import type { ClickHouseQueryParams, ClickHouseQueryResponse } from '@/tools/clickhouse/types'
import type { ToolConfig } from '@/tools/types'

export const queryTool: ToolConfig<ClickHouseQueryParams, ClickHouseQueryResponse> = {
  id: 'clickhouse_query',
  name: 'ClickHouse Query',
  description: 'Execute SELECT query on ClickHouse database',
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
    query: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'SQL SELECT query to execute',
    },
  },

  request: {
    url: '/api/tools/clickhouse/query',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => ({
      host: params.host,
      port: Number(params.port),
      database: params.database,
      username: params.username,
      password: params.password,
      protocol: params.protocol || 'http',
      query: params.query,
    }),
  },

  transformResponse: async (response: Response) => {
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'ClickHouse query failed')
    }

    return {
      success: true,
      output: {
        message: data.message || 'Query executed successfully',
        rows: data.rows || [],
        rowCount: data.rowCount || 0,
      },
      error: undefined,
    }
  },

  outputs: {
    message: { type: 'string', description: 'Operation status message' },
    rows: { type: 'array', description: 'Array of rows returned from the query' },
    rowCount: { type: 'number', description: 'Number of rows returned' },
  },
}
