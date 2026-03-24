import type { ToolConfig } from '@/tools/types'
import type { JsonArrayFilterParams, JsonResult } from './types'

export const jsonArrayFilterTool: ToolConfig<JsonArrayFilterParams, JsonResult> = {
  id: 'json_helper_array_filter',
  name: 'Array Filter',
  description: 'Filter a JSON array keeping only items where a field equals a specified value',
  version: '1.0.0',

  params: {
    data: {
      type: 'json',
      required: true,
      description: 'The JSON array to filter',
    },
    field: {
      type: 'string',
      required: true,
      description: 'The field name to match on each item',
    },
    value: {
      type: 'json',
      required: true,
      description: 'The value the field must equal',
    },
  },

  request: {
    url: '/api/tools/json_helper/array_filter',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    const arr =
      typeof params.data === 'string'
        ? (JSON.parse(params.data) as Record<string, unknown>[])
        : (params.data as Record<string, unknown>[])
    const filterValue =
      typeof params.value === 'string'
        ? (() => {
            try {
              return JSON.parse(params.value as string)
            } catch {
              return params.value
            }
          })()
        : params.value
    const result = arr.filter(
      (item) => String(item[params.field]) === String(filterValue),
    )
    return { success: true, output: { result } }
  },

  outputs: {
    result: {
      type: 'json',
      description: 'Array containing only matching elements',
    },
  },
}
