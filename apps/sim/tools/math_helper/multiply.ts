import type { ToolConfig } from '@/tools/types'
import type { MathBinaryParams, MathResult } from './types'

export const mathMultiplyTool: ToolConfig<MathBinaryParams, MathResult> = {
  id: 'math_helper_multiply',
  name: 'Multiplication',
  description: 'Multiply two numbers',
  version: '1.0.0',

  params: {
    a: {
      type: 'number',
      required: true,
      description: 'First number',
    },
    b: {
      type: 'number',
      required: true,
      description: 'Second number',
    },
  },

  request: {
    url: '/api/tools/math_helper/multiply',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    const a = Number(params.a)
    const b = Number(params.b)
    return { success: true, output: { result: a * b } }
  },

  outputs: {
    result: {
      type: 'number',
      description: 'Product of a and b',
    },
  },
}
