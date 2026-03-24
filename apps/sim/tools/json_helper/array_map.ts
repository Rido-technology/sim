import type { ToolConfig } from '@/tools/types'
import type { JsonArrayMapParams, JsonResult } from './types'

export const jsonArrayMapTool: ToolConfig<JsonArrayMapParams, JsonResult> = {
  id: 'json_helper_array_map',
  name: 'Array Map',
  description: 'Extract a specific field from each item in a JSON array',
  version: '1.0.0',

  params: {
    data: {
      type: 'json',
      required: true,
      description: 'The JSON array',
    },
    field: {
      type: 'string',
      required: true,
      description: 'The field name to extract from each array item',
    },
  },

  request: {
    url: '/api/tools/json_helper/array_map',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    const arr =
      typeof params.data === 'string'
        ? (JSON.parse(params.data) as Record<string, unknown>[])
        : (params.data as Record<string, unknown>[])
    const result = arr.map((item) => item[params.field])
    return { success: true, output: { result } }
  },

  outputs: {
    result: {
     type: 'json',
      description: 'Array of values extracted from each element',
    },
  },
}
