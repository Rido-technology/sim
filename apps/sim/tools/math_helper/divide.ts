import type { ToolConfig } from '@/tools/types'
import type { MathBinaryParams, MathResult } from './types'

export const mathDivideTool: ToolConfig<MathBinaryParams, MathResult> = {
  id: 'math_helper_divide',
  name: 'Division',
  description: 'Divide one number by another',
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
    url: '/api/tools/math_helper/divide',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    const a = Number(params.a)
    const b = Number(params.b)
    if (b === 0) {
      const errorMessage = 'Division by zero is not allowed'
      return { success: false, output: { result: 0 }, error: errorMessage }
    }
    return { success: true, output: { result: a / b, remainder: a % b } }
  },

  outputs: {
    result: {
      type: 'number',
      description: 'Quotient of a divided by b',
    },
    remainder: {
      type: 'number',
      description: 'Remainder of integer division',
    },
  },
}
