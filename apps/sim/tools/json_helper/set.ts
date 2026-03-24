import type { ToolConfig } from '@/tools/types'
import type { JsonSetParams, JsonResult } from './types'

/** Immutably set a value at a dot-notation path */
function setByPath(obj: unknown, path: string, value: unknown): unknown {
  const parts = path.split('.')
  const clone = Array.isArray(obj) ? [...(obj as unknown[])] : { ...(obj as Record<string, unknown>) }
  let current: Record<string, unknown> = clone as Record<string, unknown>
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    const next = current[part]
    const nextClone = Array.isArray(next)
      ? [...(next as unknown[])]
      : next != null && typeof next === 'object'
        ? { ...(next as Record<string, unknown>) }
        : {}
    current[part] = nextClone
    current = nextClone as Record<string, unknown>
  }
  current[parts[parts.length - 1]] = value
  return clone
}

export const jsonSetTool: ToolConfig<JsonSetParams, JsonResult> = {
  id: 'json_helper_set',
  name: 'Set Value',
  description: 'Set a value at a dot-notation path in a JSON object, returning the updated object',
  version: '1.0.0',

  params: {
    data: {
      type: 'json',
      required: true,
      description: 'The JSON object to update',
    },
    path: {
      type: 'string',
      required: true,
      description: 'Dot-notation path where the value should be set (e.g. "user.name")',
    },
    value: {
      type: 'json',
      required: true,
      description: 'The value to set at the path',
    },
  },

  request: {
    url: '/api/tools/json_helper/set',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    const data = typeof params.data === 'string' ? JSON.parse(params.data) : params.data
    const value =
      typeof params.value === 'string'
        ? (() => {
            try {
              return JSON.parse(params.value as string)
            } catch {
              return params.value
            }
          })()
        : params.value
    const result = setByPath(data, params.path, value)
    return { success: true, output: { result } }
  },

  outputs: {
    result: {
     type: 'json',      description: 'The JSON object with the new value set',
    },
  },
}
