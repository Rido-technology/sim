import type { ToolConfig } from '@/tools/types'
import type { MathUnaryParams, MathResult } from './types'

export const mathSqrtTool: ToolConfig<MathUnaryParams, MathResult> = {
  id: 'math_helper_sqrt',
  name: 'Square Root',
  description: 'Calculate the square root of a number',
  version: '1.0.0',

  params: {
    a: {
      type: 'number',
      required: true,
      description: 'The number to take the square root of (must be non-negative)',
    },
  },

  request: {
    url: '/api/tools/math_helper/sqrt',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    const a = Number(params.a)
    if (a < 0) {
      return { success: false, output: { result: 0 }, error: 'Cannot compute square root of a negative number' }
    }
    return { success: true, output: { result: Math.sqrt(a) } }
  },

  outputs: {
    result: {
      type: 'number',
      description: 'Square root of a',
    },
  },
}
