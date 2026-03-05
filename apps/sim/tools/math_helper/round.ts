import type { ToolConfig } from '@/tools/types'
import type { MathRoundParams, MathResult } from './types'

export const mathRoundTool: ToolConfig<MathRoundParams, MathResult> = {
  id: 'math_helper_round',
  name: 'Round',
  description: 'Round a number to a specified number of decimal places',
  version: '1.0.0',

  params: {
    a: {
      type: 'number',
      required: true,
      description: 'The number to round',
    },
    precision: {
      type: 'number',
      required: false,
      description: 'Number of decimal places (default: 0)',
    },
  },

  request: {
    url: '/api/tools/math_helper/round',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    const a = Number(params.a)
    const precision = params.precision !== undefined ? Number(params.precision) : 0
    const factor = Math.pow(10, precision)
    return { success: true, output: { result: Math.round(a * factor) / factor } }
  },

  outputs: {
    result: {
      type: 'number',
      description: 'Rounded value of a',
    },
  },
}
