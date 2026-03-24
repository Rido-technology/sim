import type { ToolConfig } from '@/tools/types'
import type { JsonValuesParams, JsonResult } from './types'

export const jsonValuesTool: ToolConfig<JsonValuesParams, JsonResult> = {
  id: 'json_helper_values',
  name: 'Get Values',
  description: 'Return all top-level values of a JSON object as an array',
  version: '1.0.0',

  params: {
    data: {
      type: 'json',
      required: true,
      description: 'The JSON object whose values to retrieve',
    },
  },

  request: {
    url: '/api/tools/json_helper/values',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    const data =
      typeof params.data === 'string' ? JSON.parse(params.data) : (params.data as Record<string, unknown>)
    const result = Object.values(data)
    return { success: true, output: { result } }
  },

  outputs: {
    result: {
      type: 'json', description: 'Array of the object values',
    },
  },
}
