import type { ToolConfig } from '@/tools/types'
import type { StripHtmlParams, TextResult } from './types'

export const stripHtmlTool: ToolConfig<StripHtmlParams, TextResult> = {
  id: 'text_helper_strip_html',
  name: 'Strip HTML Tags',
  description: 'Remove all HTML tags from text, leaving only the content',
  version: '1.0.0',

  params: {
    html: {
      type: 'string',
      required: true,
      description: 'The HTML text to strip tags from',
    },
    preserveSpaces: {
      type: 'boolean',
      required: false,
      description: 'Preserve spacing from block elements (default: true)',
    },
  },

  request: {
    url: '/api/tools/text_helper/strip-html',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    const html = String(params.html)
    const preserveSpaces = params.preserveSpaces !== false // Default to true
    
    if (!html.trim()) {
      return { success: true, output: { result: '' } }
    }

    let result = html

    if (preserveSpaces) {
      // Add line breaks before closing block elements
      result = result.replace(/<\/(div|p|h[1-6]|li|ul|ol|blockquote|pre)>/gi, '\n')
      // Add line breaks after opening block elements  
      result = result.replace(/<(br|hr)\s*\/?>/gi, '\n')
      // Add spaces around inline elements to prevent word concatenation
      result = result.replace(/<\/?(span|a|strong|em|b|i|code)[^>]*>/gi, ' ')
    }

    // Remove all HTML tags
    result = result.replace(/<[^>]*>/g, '')

    // Decode common HTML entities
    result = result
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")

    // Clean up extra whitespace
    if (preserveSpaces) {
      result = result.replace(/ +/g, ' ') // Multiple spaces to single space
      result = result.replace(/\n +/g, '\n') // Remove spaces at start of lines
      result = result.replace(/ +\n/g, '\n') // Remove spaces at end of lines
      result = result.replace(/\n{3,}/g, '\n\n') // Multiple newlines to double newline
    } else {
      result = result.replace(/\s+/g, ' ') // All whitespace to single space
    }

    result = result.trim()

    return { success: true, output: { result } }
  },

  outputs: {
    result: {
      type: 'string',
      description: 'The text content without HTML tags',
    },
  },
}