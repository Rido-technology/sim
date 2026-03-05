import type { ToolConfig } from '@/tools/types'
import type { MathUnaryParams, MathResult } from './types'

export const mathFloorTool: ToolConfig<MathUnaryParams, MathResult> = {
  id: 'math_helper_floor',
  name: 'Floor',
  description: 'Round a number down to the nearest integer',
  version: '1.0.0',

  params: {
    a: {
      type: 'number',
      required: true,
      description: 'The number to floor',
    },
  },

  request: {
    url: '/api/tools/math_helper/floor',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    const a = Number(params.a)
    return { success: true, output: { result: Math.floor(a) } }
  },

  outputs: {
    result: {
      type: 'number',
      description: 'Floor of a',
    },
  },
}
