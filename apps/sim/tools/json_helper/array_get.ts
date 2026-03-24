import type { ToolConfig } from '@/tools/types'
import type { JsonArrayGetParams, JsonResult } from './types'

export const jsonArrayGetTool: ToolConfig<JsonArrayGetParams, JsonResult> = {
  id: 'json_helper_array_get',
  name: 'Array Get',
  description: 'Retrieve one element from a JSON array by its index (negative indexes supported)',
  version: '1.0.0',

  params: {
    data: {
      type: 'json',
      required: true,
      description: 'The JSON array',
    },
    index: {
      type: 'number',
      required: true,
      description: 'Zero-based index of the element to retrieve (-1 for last item)',
    },
  },

  request: {
    url: '/api/tools/json_helper/array_get',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    const arr =
      typeof params.data === 'string' ? JSON.parse(params.data) : (params.data as unknown[])
    const idx = Number(params.index)
    const result = idx < 0 ? arr[arr.length + idx] : arr[idx]
    return { success: true, output: { result } }
  },

  outputs: {
    result: {
     type: 'json',
      description: 'The element at the specified index',
    },
  },
}
