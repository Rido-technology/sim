import type { ToolConfig } from '@/tools/types'
import type { TextReplaceParams, TextResult } from './types'

export const textReplaceTool: ToolConfig<TextReplaceParams, TextResult> = {
  id: 'text_helper_replace',
  name: 'Replace Text',
  description: 'Replace occurrences of text with another text',
  version: '1.0.0',

  params: {
    text: {
      type: 'string',
      required: true,
      description: 'The original text',
    },
    search: {
      type: 'string',
      required: true,
      description: 'The text to search for',
    },
    replace: {
      type: 'string',
      required: true,
      description: 'The text to replace with',
    },
    replaceAll: {
      type: 'boolean',
      required: false,
      description: 'Replace all occurrences (default: true)',
    },
  },

  request: {
    url: '/api/tools/text_helper/replace',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    const text = String(params.text)
    const search = String(params.search)
    const replace = String(params.replace)
    const replaceAll = params.replaceAll !== false // Default to true

    if (!search) {
      return { success: true, output: { result: text } }
    }

    let result: string
    if (replaceAll) {
      // Replace all occurrences using global regex
      const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
      result = text.replace(searchRegex, replace)
    } else {
      // Replace only first occurrence
      result = text.replace(search, replace)
    }

    return { success: true, output: { result } }
  },

  outputs: {
    result: {
      type: 'string',
      description: 'The text with replacements applied',
    },
  },
}