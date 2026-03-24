import type { ToolConfig } from '@/tools/types'
import type { JsonDeleteParams, JsonResult } from './types'

/** Immutably delete the key at a dot-notation path */
function deleteByPath(obj: unknown, path: string): unknown {
  const parts = path.split('.')
  if (parts.length === 1) {
    const clone = { ...(obj as Record<string, unknown>) }
    delete clone[parts[0]]
    return clone
  }
  const [head, ...rest] = parts
  const source = obj as Record<string, unknown>
  const clone = { ...source }
  clone[head] = deleteByPath(source[head], rest.join('.'))
  return clone
}

export const jsonDeleteKeyTool: ToolConfig<JsonDeleteParams, JsonResult> = {
  id: 'json_helper_delete',
  name: 'Delete Key',
  description: 'Remove a key from a JSON object at a given dot-notation path',
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
      description: 'Dot-notation path of the key to delete (e.g. "user.address")',
    },
  },

  request: {
    url: '/api/tools/json_helper/delete',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    const data = typeof params.data === 'string' ? JSON.parse(params.data) : params.data
    const result = deleteByPath(data, params.path)
    return { success: true, output: { result } }
  },

  outputs: {
    result: {
      type: 'json',
      description: 'The JSON object with the key removed',
    },
  },
}
