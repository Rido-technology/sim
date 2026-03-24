import type { ToolConfig } from '@/tools/types'
import type { JsonFilterKeysParams, JsonResult } from './types'

export const jsonFilterKeysTool: ToolConfig<JsonFilterKeysParams, JsonResult> = {
  id: 'json_helper_filter_keys',
  name: 'Filter Keys',
  description: 'Keep only the specified keys from a JSON object',
  version: '1.0.0',

  params: {
    data: {
      type: 'json',
      required: true,
      description: 'The JSON object to filter',
    },
    keys: {
      type: 'string',
      required: true,
      description: 'Comma-separated list of keys to keep (e.g. "name,email,age")',
    },
  },

  request: {
    url: '/api/tools/json_helper/filter_keys',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    const data =
      typeof params.data === 'string' ? JSON.parse(params.data) : (params.data as Record<string, unknown>)
    const allowed = params.keys.split(',').map((k) => k.trim()).filter(Boolean)
    const result: Record<string, unknown> = {}
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = data[key]
      }
    }
    return { success: true, output: { result } }
  },

  outputs: {
    result: {
     type: 'json',      description: 'Object containing only the specified keys',
    },
  },
}
