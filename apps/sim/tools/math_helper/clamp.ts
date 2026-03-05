import type { ToolConfig } from '@/tools/types'
import type { MathClampParams, MathResult } from './types'

export const mathClampTool: ToolConfig<MathClampParams, MathResult> = {
  id: 'math_helper_clamp',
  name: 'Clamp',
  description: 'Clamp a number between a minimum and maximum bound',
  version: '1.0.0',

  params: {
    value: {
      type: 'number',
      required: true,
      description: 'The value to clamp',
    },
    min: {
      type: 'number',
      required: true,
      description: 'Lower bound',
    },
    max: {
      type: 'number',
      required: true,
      description: 'Upper bound',
    },
  },

  request: {
    url: '/api/tools/math_helper/clamp',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    const value = Number(params.value)
    const min = Number(params.min)
    const max = Number(params.max)

    if (min > max) {
      return {
        success: false,
        output: { result: 0 },
        error: 'min must be less than or equal to max',
      }
    }

    return {
      success: true,
      output: { result: Math.min(Math.max(value, min), max) },
    }
  },

  outputs: {
    result: {
      type: 'number',
      description: 'Clamped value',
    },
  },
}
