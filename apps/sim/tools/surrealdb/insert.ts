import type { SurrealDBInsertParams, SurrealDBInsertResponse } from '@/tools/surrealdb/types'
import type { ToolConfig } from '@/tools/types'

export const insertTool: ToolConfig<SurrealDBInsertParams, SurrealDBInsertResponse> = {
  id: 'surrealdb_insert',
  name: 'SurrealDB Insert',
  description: 'Insert records into a SurrealDB table',
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
    table: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Table name to insert into (e.g., person, order)',
    },
    data: {
      type: 'object',
      required: true,
      visibility: 'user-or-llm',
      description: 'Record or array of records to insert as key-value pairs',
    },
  },

  request: {
    url: '/api/tools/surrealdb/insert',
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
      table: params.table,
      data: params.data,
    }),
  },

  transformResponse: async (response: Response) => {
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'SurrealDB insert failed')
    }

    return {
      success: true,
      output: {
        message: data.message || 'Records inserted successfully',
        records: data.records || [],
        recordCount: data.recordCount || 0,
      },
      error: undefined,
    }
  },

  outputs: {
    message: { type: 'string', description: 'Operation status message' },
    records: { type: 'array', description: 'Array of inserted records with their IDs' },
    recordCount: { type: 'number', description: 'Number of records inserted' },
  },
}
