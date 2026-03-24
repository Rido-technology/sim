import type { ToolConfig } from '@/tools/types'
import type { JsonMergeParams, JsonResult } from './types'

/** Deep merge source into target, returns new object */
function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...target }
  for (const key of Object.keys(source)) {
    const srcVal = source[key]
    const tgtVal = result[key]
    if (
      srcVal !== null &&
      typeof srcVal === 'object' &&
      !Array.isArray(srcVal) &&
      tgtVal !== null &&
      typeof tgtVal === 'object' &&
      !Array.isArray(tgtVal)
    ) {
      result[key] = deepMerge(
        tgtVal as Record<string, unknown>,
        srcVal as Record<string, unknown>,
      )
    } else {
      result[key] = srcVal
    }
  }
  return result
}

export const jsonMergeTool: ToolConfig<JsonMergeParams, JsonResult> = {
  id: 'json_helper_merge',
  name: 'Merge Objects',
  description: 'Deep-merge two JSON objects; source values override target values',
  version: '1.0.0',

  params: {
    data: {
      type: 'json',
      required: true,
      description: 'The base JSON object',
    },
    source: {
      type: 'json',
      required: true,
      description: 'The object to merge into the base',
    },
  },

  request: {
    url: '/api/tools/json_helper/merge',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    const data =
      typeof params.data === 'string' ? JSON.parse(params.data) : (params.data as Record<string, unknown>)
    const source =
      typeof params.source === 'string'
        ? JSON.parse(params.source)
        : (params.source as Record<string, unknown>)
    const result = deepMerge(data, source)
    return { success: true, output: { result } }
  },

  outputs: {
    result: {
     type: 'json',      description: 'The deep-merged JSON object',
    },
  },
}
