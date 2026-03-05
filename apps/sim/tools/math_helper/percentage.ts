import type { ToolConfig } from '@/tools/types'
import type { MathPercentageParams, MathResult } from './types'

export const mathPercentageTool: ToolConfig<MathPercentageParams, MathResult> = {
  id: 'math_helper_percentage',
  name: 'Percentage',
  description: 'Calculate what percentage a value is of a total',
  version: '1.0.0',

  params: {
    value: {
      type: 'number',
      required: true,
      description: 'The partial value',
    },
    total: {
      type: 'number',
      required: true,
      description: 'The total value',
    },
  },

  request: {
    url: '/api/tools/math_helper/percentage',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    const value = Number(params.value)
    const total = Number(params.total)

    if (total === 0) {
      return {
        success: false,
        output: { result: 0 },
        error: 'Total must not be zero',
      }
    }

    return {
      success: true,
      output: { result: (value / total) * 100 },
    }
  },

  outputs: {
    result: {
      type: 'number',
      description: 'Percentage value (0-100+ depending on inputs)',
    },
  },
}
