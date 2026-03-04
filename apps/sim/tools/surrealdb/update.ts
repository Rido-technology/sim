import type { SurrealDBUpdateParams, SurrealDBUpdateResponse } from '@/tools/surrealdb/types'
import type { ToolConfig } from '@/tools/types'

export const updateTool: ToolConfig<SurrealDBUpdateParams, SurrealDBUpdateResponse> = {
  id: 'surrealdb_update',
  name: 'SurrealDB Update',
  description: 'Update records in a SurrealDB table',
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
      description: 'Table or specific record ID to update (e.g., person or person:john)',
    },
    data: {
      type: 'object',
      required: true,
      visibility: 'user-or-llm',
      description: 'Fields to set on the matching records',
    },
    where: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Optional WHERE condition (e.g., age > 18)',
    },
  },

  request: {
    url: '/api/tools/surrealdb/update',
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
      data: params.data,
      where: params.where,
    }),
  },

  transformResponse: async (response: Response) => {
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'SurrealDB update failed')
    }

    return {
      success: true,
      output: {
        message: data.message || 'Records updated successfully',
        records: data.records || [],
        recordCount: data.recordCount || 0,
      },
      error: undefined,
    }
  },

  outputs: {
    message: { type: 'string', description: 'Operation status message' },
    records: { type: 'array', description: 'Array of updated records' },
    recordCount: { type: 'number', description: 'Number of records updated' },
  },
}
