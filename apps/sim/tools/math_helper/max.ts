import type { ToolConfig } from '@/tools/types'
import type { MathMinMaxParams, MathResult } from './types'

export const mathMaxTool: ToolConfig<MathMinMaxParams, MathResult> = {
  id: 'math_helper_max',
  name: 'Maximum',
  description: 'Find the maximum value from a list of numbers',
  version: '1.0.0',

  params: {
    values: {
      type: 'string',
      required: true,
      description: 'Comma-separated list of numbers (e.g. "1, 2, 3")',
    },
  },

  request: {
    url: '/api/tools/math_helper/max',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    const nums = String(params.values)
      .split(',')
      .map((v) => Number(v.trim()))
    if (nums.some(isNaN)) {
      return { success: false, output: { result: 0 }, error: 'All values must be valid numbers' }
    }
    return { success: true, output: { result: Math.max(...nums) } }
  },

  outputs: {
    result: {
      type: 'number',
      description: 'Maximum value from the list',
    },
  },
}
