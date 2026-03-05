import type { ToolConfig } from '@/tools/types'
import type { MathRandomParams, MathResult } from './types'

export const mathRandomTool: ToolConfig<MathRandomParams, MathResult> = {
  id: 'math_helper_random',
  name: 'Random Number',
  description: 'Generate a random number between min and max',
  version: '1.0.0',

  params: {
    min: {
      type: 'number',
      required: true,
      description: 'Minimum bound',
    },
    max: {
      type: 'number',
      required: true,
      description: 'Maximum bound',
    },
    integer: {
      type: 'boolean',
      required: false,
      description: 'If true, return an integer value',
    },
  },

  request: {
    url: '/api/tools/math_helper/random',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    const min = Number(params.min)
    const max = Number(params.max)
    const integer = Boolean(params.integer)

    if (min > max) {
      return {
        success: false,
        output: { result: 0 },
        error: 'min must be less than or equal to max',
      }
    }

    if (integer) {
      const result = Math.floor(Math.random() * (max - min + 1)) + min
      return { success: true, output: { result } }
    }

    const result = Math.random() * (max - min) + min
    return { success: true, output: { result } }
  },

  outputs: {
    result: {
      type: 'number',
      description: 'Generated random number',
    },
  },
}
