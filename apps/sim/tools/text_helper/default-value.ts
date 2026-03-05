import type { ToolConfig } from '@/tools/types'
import type { DefaultValueParams, TextResult } from './types'

export const defaultValueTool: ToolConfig<DefaultValueParams, TextResult> = {
  id: 'text_helper_default_value',
  name: 'Default Value',
  description: 'Use a default value if the input is empty or meets certain criteria',
  version: '1.0.0',

  params: {
    input: {
      type: 'string',
      required: true,
      description: 'The input text to check',
    },
    defaultValue: {
      type: 'string',
      required: true,
      description: 'The default value to use if input is empty',
    },
    emptyCheck: {
      type: 'string',
      required: false,
      description: 'What constitutes empty: "empty" (empty string), "whitespace" (only spaces/tabs/newlines), "null" (null/undefined)',
    },
  },

  request: {
    url: '/api/tools/text_helper/default-value',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    const input = params.input
    const defaultValue = String(params.defaultValue)
    const emptyCheck = params.emptyCheck || 'empty'

    let isEmpty = false

    switch (emptyCheck) {
      case 'empty':
        isEmpty = input === '' || input === undefined || input === null
        break
      case 'whitespace':
        isEmpty = !input || String(input).trim() === ''
        break
      case 'null':
        isEmpty = input === null || input === undefined
        break
      default:
        isEmpty = input === '' || input === undefined || input === null
    }

    const result = isEmpty ? defaultValue : String(input)

    return { success: true, output: { result } }
  },

  outputs: {
    result: {
      type: 'string',
      description: 'The input value or default value',
    },
  },
}