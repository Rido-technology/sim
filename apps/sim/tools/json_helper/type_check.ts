import type { ToolConfig } from '@/tools/types'
import type { JsonTypeCheckParams } from './types'

export const jsonTypeCheckTool: ToolConfig<JsonTypeCheckParams, { result: string }> = {
  id: 'json_helper_type_check',
  name: 'Type Check',
  description: 'Return the JSON type of a value: "object", "array", "string", "number", "boolean", or "null"',
  version: '1.0.0',

  params: {
    data: {
      type: 'json',
      required: true,
      description: 'The value to inspect',
    },
  },

  request: {
    url: '/api/tools/json_helper/type_check',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    const data = typeof params.data === 'string'
      ? (() => { try { return JSON.parse(params.data as string) } catch { return params.data } })()
      : params.data
    let result: string
    if (data === null) result = 'null'
    else if (Array.isArray(data)) result = 'array'
    else result = typeof data
    return { success: true, output: { result } }
  },

  outputs: {
    result: {
      type: 'string',
      description: 'JSON type name of the value',
    },
  },
}
