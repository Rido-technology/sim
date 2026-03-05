import type { ToolConfig } from '@/tools/types'
import type { MathPowerParams, MathResult } from './types'

export const mathPowerTool: ToolConfig<MathPowerParams, MathResult> = {
  id: 'math_helper_power',
  name: 'Power',
  description: 'Raise a base number to an exponent',
  version: '1.0.0',

  params: {
    base: {
      type: 'number',
      required: true,
      description: 'The base number',
    },
    exponent: {
      type: 'number',
      required: true,
      description: 'The exponent',
    },
  },

  request: {
    url: '/api/tools/math_helper/power',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    const base = Number(params.base)
    const exponent = Number(params.exponent)
    return { success: true, output: { result: Math.pow(base, exponent) } }
  },

  outputs: {
    result: {
      type: 'number',
      description: 'base raised to the power of exponent',
    },
  },
}
