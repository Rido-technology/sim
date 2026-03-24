import type { ToolConfig } from '@/tools/types'
import type { JsonGetKeyParams, JsonResult } from './types'

export const jsonGetKeyTool: ToolConfig<JsonGetKeyParams, JsonResult> = {
  id: 'json_helper_get_key',
  name: 'Get Value by Key',
  description: 'Return the value of a single top-level key from a JSON object',
  version: '1.0.0',

  params: {
    data: {
      type: 'json',
      required: true,
      description: 'The JSON object to query',
    },
    key: {
      type: 'string',
      required: true,
      description: 'The exact key name to retrieve',
    },
  },

  request: {
    url: '/api/tools/json_helper/get_key',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    const data =
      typeof params.data === 'string'
        ? JSON.parse(params.data)
        : (params.data as Record<string, unknown>)
    const result = data[params.key]
    return { success: true, output: { result } }
  },

  outputs: {
    result: {
      type: 'json', description: 'The value stored under the given key',
    },
  },
}
