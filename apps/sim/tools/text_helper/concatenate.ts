import type { ToolConfig } from '@/tools/types'
import type { TextConcatenateParams, TextResult } from './types'

export const textConcatenateTool: ToolConfig<TextConcatenateParams, TextResult> = {
  id: 'text_helper_concatenate',
  name: 'Concatenate Text',
  description: 'Join multiple texts together with an optional separator',
  version: '1.0.0',

  params: {
    texts: {
      type: 'array',
      required: true,
      description: 'Array of texts to concatenate, or string with texts separated by newlines/commas',
    },
    separator: {
      type: 'string',
      required: false,
      description: 'Separator to use between texts (default: empty string)',
    },
  },

  request: {
    url: '/api/tools/text_helper/concatenate',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    let texts: string[] = []

    // Handle both array input (API) and string input (block UI)
    if (Array.isArray(params.texts)) {
      texts = params.texts
    } else if (typeof params.texts === 'string') {
      // Parse string input - split by newlines first, then by commas if no newlines
      const stringInput = String(params.texts).trim()
      if (stringInput.includes('\n')) {
        texts = stringInput.split('\n').map(text => text.trim()).filter(text => text.length > 0)
      } else if (stringInput.includes(',')) {
        texts = stringInput.split(',').map(text => text.trim()).filter(text => text.length > 0)
      } else {
        texts = stringInput ? [stringInput] : []
      }
    }

    const separator = params.separator !== undefined ? String(params.separator) : ''

    if (texts.length === 0) {
      return { success: true, output: { result: '' } }
    }

    const result = texts.map(text => String(text)).join(separator)
    return { success: true, output: { result } }
  },

  outputs: {
    result: {
      type: 'string',
      description: 'The concatenated text',
    },
  },
}