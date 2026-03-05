import type { ToolConfig } from '@/tools/types'
import type { MathUnaryParams, MathResult } from './types'

export const mathAbsTool: ToolConfig<MathUnaryParams, MathResult> = {
  id: 'math_helper_abs',
  name: 'Absolute Value',
  description: 'Get the absolute (non-negative) value of a number',
  version: '1.0.0',

  params: {
    a: {
      type: 'number',
      required: true,
      description: 'The number to get the absolute value of',
    },
  },

  request: {
    url: '/api/tools/math_helper/abs',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    const a = Number(params.a)
    return { success: true, output: { result: Math.abs(a) } }
  },

  outputs: {
    result: {
      type: 'number',
      description: 'Absolute value of a',
    },
  },
}
