import type { ToolConfig } from '@/tools/types'
import type { JsonStringifyParams, JsonResult } from './types'

export const jsonStringifyTool: ToolConfig<JsonStringifyParams, JsonResult> = {
  id: 'json_helper_stringify',
  name: 'Stringify JSON',
  description: 'Convert a value to a JSON string, with optional pretty-printing',
  version: '1.0.0',

  params: {
    data: {
      type: 'json',
      required: true,
      description: 'The value to serialize to JSON',
    },
    indent: {
      type: 'number',
      required: false,
      description: 'Number of spaces for indentation (2 for pretty-print)',
    },
  },

  request: {
    url: '/api/tools/json_helper/stringify',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    const indent = params.indent !== undefined ? Number(params.indent) : undefined
    const result = JSON.stringify(params.data, null, indent)
    return { success: true, output: { result } }
  },

  outputs: {
    result: {
      type: 'string',
      description: 'The JSON string representation',
    },
  },
}
