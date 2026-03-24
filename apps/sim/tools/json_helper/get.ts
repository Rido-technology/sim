import type { ToolConfig } from '@/tools/types'
import type { JsonGetParams, JsonResult } from './types'

/** Resolve a dot-notation path (e.g. "user.address.city" or "items.0.id") */
function getByPath(obj: unknown, path: string): unknown {
  const parts = path.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return current
}

export const jsonGetTool: ToolConfig<JsonGetParams, JsonResult> = {
  id: 'json_helper_get',
  name: 'Get Value',
  description: 'Extract a value from a JSON object using a dot-notation path (e.g. "user.address.city")',
  version: '1.0.0',

  params: {
    data: {
      type: 'json',
      required: true,
      description: 'The JSON object to query',
    },
    path: {
      type: 'string',
      required: true,
      description: 'Dot-notation path to the value (e.g. "user.name" or "items.0.id")',
    },
  },

  request: {
    url: '/api/tools/json_helper/get',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    const data = typeof params.data === 'string' ? JSON.parse(params.data) : params.data
    const result = getByPath(data, params.path)
    return { success: true, output: { result } }
  },

  outputs: {
    result: {
     type: 'json',      description: 'The value found at the given path',
    },
  },
}
