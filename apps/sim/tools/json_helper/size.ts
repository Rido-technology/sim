import type { ToolConfig } from '@/tools/types'
import type { JsonSizeParams } from './types'

export const jsonSizeTool: ToolConfig<JsonSizeParams, { result: number }> = {
  id: 'json_helper_size',
  name: 'Size',
  description: 'Get the number of keys in a JSON object or elements in an array',
  version: '1.0.0',

  params: {
    data: {
      type: 'json',
      required: true,
      description: 'The JSON object or array',
    },
  },

  request: {
    url: '/api/tools/json_helper/size',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    const data = typeof params.data === 'string' ? JSON.parse(params.data) : params.data
    const result = Array.isArray(data) ? data.length : Object.keys(data as Record<string, unknown>).length
    return { success: true, output: { result } }
  },

  outputs: {
    result: {
      type: 'number',
      description: 'Number of keys (object) or elements (array)',
    },
  },
}
