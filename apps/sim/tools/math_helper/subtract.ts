import type { ToolConfig } from '@/tools/types'
import type { MathBinaryParams, MathResult } from './types'

export const mathSubtractTool: ToolConfig<MathBinaryParams, MathResult> = {
  id: 'math_helper_subtract',
  name: 'Subtraction',
  description: 'Subtract one number from another',
  version: '1.0.0',

  params: {
    a: {
      type: 'number',
      required: true,
      description: 'Number to subtract from',
    },
    b: {
      type: 'number',
      required: true,
      description: 'Number to subtract',
    },
  },

  request: {
    url: '/api/tools/math_helper/subtract',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    const a = Number(params.a)
    const b = Number(params.b)
    return { success: true, output: { result: a - b } }
  },

  outputs: {
    result: {
      type: 'number',
      description: 'Difference of a minus b',
    },
  },
}
