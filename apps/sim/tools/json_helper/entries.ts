import type { ToolConfig } from '@/tools/types'
import type { JsonEntriesParams, JsonResult } from './types'

export const jsonEntriesTool: ToolConfig<JsonEntriesParams, JsonResult> = {
  id: 'json_helper_entries',
  name: 'Object to Entries Array',
  description: 'Convert a JSON object into an array of {key, value} entry objects',
  version: '1.0.0',

  params: {
    data: {
      type: 'json',
      required: true,
      description: 'The JSON object to convert into an entries array',
    },
  },

  request: {
    url: '/api/tools/json_helper/entries',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    const data =
      typeof params.data === 'string'
        ? JSON.parse(params.data)
        : (params.data as Record<string, unknown>)
    const result = Object.entries(data).map(([key, value]) => ({ key, value }))
    return { success: true, output: { result } }
  },

  outputs: {
    result: {
     type: 'json',      description: 'Array where each element is { key: string, value: any }',
    },
  },
}
