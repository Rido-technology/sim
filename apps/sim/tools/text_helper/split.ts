import type { ToolConfig } from '@/tools/types'
import type { TextSplitParams, TextArrayResult } from './types'

export const textSplitTool: ToolConfig<TextSplitParams, TextArrayResult> = {
  id: 'text_helper_split',
  name: 'Split Text',
  description: 'Split text into an array using a separator',
  version: '1.0.0',

  params: {
    text: {
      type: 'string',
      required: true,
      description: 'The text to split',
    },
    separator: {
      type: 'string',
      required: true,
      description: 'The separator to split by (e.g., ",", "\\n", " ")',
    },
    limit: {
      type: 'number',
      required: false,
      description: 'Maximum number of splits (optional)',
    },
  },

  request: {
    url: '/api/tools/text_helper/split',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    const text = String(params.text)
    const separator = String(params.separator)
    const limit = params.limit ? Number(params.limit) : undefined

    if (!text) {
      return { success: true, output: { result: [] } }
    }

    let result: string[]
    if (limit !== undefined && limit > 0) {
      result = text.split(separator, limit)
    } else {
      result = text.split(separator)
    }

    return { success: true, output: { result } }
  },

  outputs: {
    result: {
      type: 'array',
      description: 'Array of text segments after splitting',
    },
  },
}