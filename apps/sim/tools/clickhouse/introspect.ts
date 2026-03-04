import type {
  ClickHouseIntrospectParams,
  ClickHouseIntrospectResponse,
} from '@/tools/clickhouse/types'
import type { ToolConfig } from '@/tools/types'

export const introspectTool: ToolConfig<
  ClickHouseIntrospectParams,
  ClickHouseIntrospectResponse
> = {
  id: 'clickhouse_introspect',
  name: 'ClickHouse Introspect',
  description: 'Introspect ClickHouse database schema to retrieve table structures and columns',
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
      description: 'Database name to introspect',
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
  },

  request: {
    url: '/api/tools/clickhouse/introspect',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => ({
      host: params.host,
      port: Number(params.port),
      database: params.database,
      username: params.username,
      password: params.password,
      protocol: params.protocol || 'http',
    }),
  },

  transformResponse: async (response: Response) => {
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'ClickHouse introspection failed')
    }

    return {
      success: true,
      output: {
        message: data.message || 'Schema introspection completed successfully',
        tables: data.tables || [],
        databases: data.databases || [],
      },
      error: undefined,
    }
  },

  outputs: {
    message: { type: 'string', description: 'Operation status message' },
    tables: {
      type: 'array',
      description: 'Array of table schemas with columns, engines, and ordering keys',
    },
    databases: { type: 'array', description: 'List of available databases on the server' },
  },
}
