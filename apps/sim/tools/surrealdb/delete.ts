import type { SurrealDBDeleteParams, SurrealDBDeleteResponse } from '@/tools/surrealdb/types'
import type { ToolConfig } from '@/tools/types'

export const deleteTool: ToolConfig<SurrealDBDeleteParams, SurrealDBDeleteResponse> = {
  id: 'surrealdb_delete',
  name: 'SurrealDB Delete',
  description: 'Delete records from a SurrealDB table',
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
    target: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Table or specific record ID to delete from (e.g., person or person:john)',
    },
    where: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Optional WHERE condition to filter which records to delete (e.g., active = false)',
    },
  },

  request: {
    url: '/api/tools/surrealdb/delete',
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
      target: params.target,
      where: params.where,
    }),
  },

  transformResponse: async (response: Response) => {
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'SurrealDB delete failed')
    }

    return {
      success: true,
      output: {
        message: data.message || 'Records deleted successfully',
        records: data.records || [],
        recordCount: data.recordCount || 0,
      },
      error: undefined,
    }
  },

  outputs: {
    message: { type: 'string', description: 'Operation status message' },
    records: { type: 'array', description: 'Array of deleted records' },
    recordCount: { type: 'number', description: 'Number of records deleted' },
  },
}
