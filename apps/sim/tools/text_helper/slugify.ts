import type { ToolConfig } from '@/tools/types'
import type { SlugifyParams, TextResult } from './types'

export const slugifyTool: ToolConfig<SlugifyParams, TextResult> = {
  id: 'text_helper_slugify',
  name: 'Slugify Text',
  description: 'Convert text to a URL-friendly slug format',
  version: '1.0.0',

  params: {
    text: {
      type: 'string',
      required: true,
      description: 'The text to convert to a slug',
    },
    separator: {
      type: 'string',
      required: false,
      description: 'Character to use as separator (default: "-")',
    },
    lowercase: {
      type: 'boolean',
      required: false,
      description: 'Convert to lowercase (default: true)',
    },
  },

  request: {
    url: '/api/tools/text_helper/slugify',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    const text = String(params.text)
    const separator = params.separator || '-'
    const lowercase = params.lowercase !== false // Default to true
    
    if (!text.trim()) {
      return { success: true, output: { result: '' } }
    }

    let result = text

    // Convert to lowercase if requested
    if (lowercase) {
      result = result.toLowerCase()
    }

    // Replace accented characters with their base equivalents
    result = result
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ýÿ]/g, 'y')
      .replace(/[ñ]/g, 'n')
      .replace(/[ç]/g, 'c')
      .replace(/[ß]/g, 'ss')
      .replace(/[æ]/g, 'ae')
      .replace(/[œ]/g, 'oe')

    // Replace non-alphanumeric characters with separator
    result = result.replace(/[^a-zA-Z0-9]/g, separator)

    // Remove multiple consecutive separators
    const escapedSeparator = separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const multipleSeparatorRegex = new RegExp(`${escapedSeparator}+`, 'g')
    result = result.replace(multipleSeparatorRegex, separator)

    // Remove leading and trailing separators
    const trimRegex = new RegExp(`^${escapedSeparator}+|${escapedSeparator}+$`, 'g')
    result = result.replace(trimRegex, '')

    return { success: true, output: { result } }
  },

  outputs: {
    result: {
      type: 'string',
      description: 'The slugified text',
    },
  },
}