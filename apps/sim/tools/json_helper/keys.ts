import type { ToolConfig } from '@/tools/types'
import type { JsonKeysParams, JsonResult } from './types'

export const jsonKeysTool: ToolConfig<JsonKeysParams, JsonResult> = {
  id: 'json_helper_keys',
  name: 'Get Keys',
  description: 'Return all top-level keys of a JSON object as an array',
  version: '1.0.0',

  params: {
    data: {
      type: 'json',
      required: true,
      description: 'The JSON object whose keys to retrieve',
    },
  },

  request: {
    url: '/api/tools/json_helper/keys',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    const data =
      typeof params.data === 'string' ? JSON.parse(params.data) : (params.data as Record<string, unknown>)
    const result = Object.keys(data)
    return { success: true, output: { result } }
  },

  outputs: {
    result: {
     type: 'json',      description: 'Array of the object keys',
    },
  },
}
