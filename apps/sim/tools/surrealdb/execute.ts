import type { SurrealDBExecuteParams, SurrealDBExecuteResponse } from '@/tools/surrealdb/types'
import type { ToolConfig } from '@/tools/types'

export const executeTool: ToolConfig<SurrealDBExecuteParams, SurrealDBExecuteResponse> = {
  id: 'surrealdb_execute',
  name: 'SurrealDB Execute',
  description: 'Execute raw SurrealQL statement on SurrealDB',
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
      description: 'SurrealDB database name',
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
    query: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'SurrealQL statement to execute (SELECT, CREATE, UPDATE, DELETE, DEFINE, etc.)',
    },
  },

  request: {
    url: '/api/tools/surrealdb/execute',
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
      query: params.query,
    }),
  },

  transformResponse: async (response: Response) => {
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'SurrealDB execute failed')
    }

    return {
      success: true,
      output: {
        message: data.message || 'SurrealQL executed successfully',
        records: data.records || [],
        recordCount: data.recordCount || 0,
      },
      error: undefined,
    }
  },

  outputs: {
    message: { type: 'string', description: 'Operation status message' },
    records: { type: 'array', description: 'Array of records returned by the statement' },
    recordCount: { type: 'number', description: 'Number of records returned or affected' },
  },
}
