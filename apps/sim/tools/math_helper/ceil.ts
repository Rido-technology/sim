import type { ToolConfig } from '@/tools/types'
import type { MathUnaryParams, MathResult } from './types'

export const mathCeilTool: ToolConfig<MathUnaryParams, MathResult> = {
  id: 'math_helper_ceil',
  name: 'Ceiling',
  description: 'Round a number up to the nearest integer',
  version: '1.0.0',

  params: {
    a: {
      type: 'number',
      required: true,
      description: 'The number to ceil',
    },
  },

  request: {
    url: '/api/tools/math_helper/ceil',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    const a = Number(params.a)
    return { success: true, output: { result: Math.ceil(a) } }
  },

  outputs: {
    result: {
      type: 'number',
      description: 'Ceiling of a',
    },
  },
}
