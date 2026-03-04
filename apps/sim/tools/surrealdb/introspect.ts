import type {
  SurrealDBIntrospectParams,
  SurrealDBIntrospectResponse,
} from '@/tools/surrealdb/types'
import type { ToolConfig } from '@/tools/types'

export const introspectTool: ToolConfig<SurrealDBIntrospectParams, SurrealDBIntrospectResponse> = {
  id: 'surrealdb_introspect',
  name: 'SurrealDB Introspect',
  description: 'Introspect SurrealDB schema to retrieve table structures, fields, and indexes',
  version: '1.0',

  params: {
    host: {
      type: 'string',
      required: true,
      visibility: 'user-only',
      description: 'SurrealDB server hostname or IP address',
    },
    port: {
      type: 'number',
      required: true,
      visibility: 'user-only',
      description: 'SurrealDB HTTP port (default: 8000)',
    },
    namespace: {
      type: 'string',
      required: true,
      visibility: 'user-only',
      description: 'SurrealDB namespace',
    },
    database: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'SurrealDB database to introspect',
    },
    username: {
      type: 'string',
      required: true,
      visibility: 'user-only',
      description: 'SurrealDB username',
    },
    password: {
      type: 'string',
      required: true,
      visibility: 'user-only',
      description: 'SurrealDB password',
    },
    protocol: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'Protocol (http or https)',
    },
  },

  request: {
    url: '/api/tools/surrealdb/introspect',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => ({
      host: params.host,
      port: Number(params.port),
      namespace: params.namespace,
      database: params.database,
      username: params.username,
      password: params.password,
      protocol: params.protocol || 'http',
    }),
  },

  transformResponse: async (response: Response) => {
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'SurrealDB introspection failed')
    }

    return {
      success: true,
      output: {
        message: data.message || 'Schema introspection completed',
        tables: data.tables || [],
        tableNames: data.tableNames || [],
      },
      error: undefined,
    }
  },

  outputs: {
    message: { type: 'string', description: 'Operation status message' },
    tables: {
      type: 'array',
      description: 'Array of table schemas with fields, indexes, and events',
    },
    tableNames: { type: 'array', description: 'List of table names in the database' },
  },
}
