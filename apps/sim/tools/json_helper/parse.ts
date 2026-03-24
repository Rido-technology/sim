import type { ToolConfig } from '@/tools/types'
import type { JsonParseParams, JsonResult } from './types'

export const jsonParseTool: ToolConfig<JsonParseParams, JsonResult> = {
  id: 'json_helper_parse',
  name: 'Parse JSON',
  description: 'Parse a JSON string into an object or value',
  version: '1.0.0',

  params: {
    jsonString: {
      type: 'string',
      required: true,
      description: 'The JSON string to parse',
    },
  },

  request: {
    url: '/api/tools/json_helper/parse',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    const result = JSON.parse(params.jsonString)
    return { success: true, output: { result } }
  },

  outputs: {
    result: {
     type: 'json',      description: 'The parsed JSON value',
    },
  },
}
