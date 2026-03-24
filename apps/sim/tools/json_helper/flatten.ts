import type { ToolConfig } from '@/tools/types'
import type { JsonFlattenParams, JsonResult } from './types'

/** Flatten a nested object to single-level dot-notation keys */
function flattenObject(
  obj: Record<string, unknown>,
  prefix = '',
  sep = '.',
): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const key of Object.keys(obj)) {
    const newKey = prefix ? `${prefix}${sep}${key}` : key
    const val = obj[key]
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      const nested = flattenObject(val as Record<string, unknown>, newKey, sep)
      Object.assign(result, nested)
    } else {
      result[newKey] = val
    }
  }
  return result
}

export const jsonFlattenTool: ToolConfig<JsonFlattenParams, JsonResult> = {
  id: 'json_helper_flatten',
  name: 'Flatten Object',
  description: 'Flatten a nested JSON object to single-level keys using dot-notation',
  version: '1.0.0',

  params: {
    data: {
      type: 'json',
      required: true,
      description: 'The nested JSON object to flatten',
    },
    separator: {
      type: 'string',
      required: false,
      description: 'Key separator (default: ".")',
    },
  },

  request: {
    url: '/api/tools/json_helper/flatten',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    const data =
      typeof params.data === 'string'
        ? JSON.parse(params.data)
        : (params.data as Record<string, unknown>)
    const sep = params.separator ?? '.'
    const result = flattenObject(data, '', sep)
    return { success: true, output: { result } }
  },

  outputs: {
    result: {
     type: 'json',      description: 'Single-level object with dot-notation keys',
    },
  },
}
