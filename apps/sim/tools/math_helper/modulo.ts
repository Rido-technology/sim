import type { ToolConfig } from '@/tools/types'
import type { MathBinaryParams, MathResult } from './types'

export const mathModuloTool: ToolConfig<MathBinaryParams, MathResult> = {
  id: 'math_helper_modulo',
  name: 'Modulo',
  description: 'Get the remainder of dividing one number by another',
  version: '1.0.0',

  params: {
    a: {
      type: 'number',
      required: true,
      description: 'Dividend',
    },
    b: {
      type: 'number',
      required: true,
      description: 'Divisor (must not be zero)',
    },
  },

  request: {
    url: '/api/tools/math_helper/modulo',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    const a = Number(params.a)
    const b = Number(params.b)
    if (b === 0) {
      const errorMessage = 'Modulo by zero is not allowed'
      return { success: false, output: { result: 0 }, error: errorMessage }
    }
    return { success: true, output: { result: a % b } }
  },

  outputs: {
    result: {
      type: 'number',
      description: 'Remainder of a divided by b',
    },
  },
}
