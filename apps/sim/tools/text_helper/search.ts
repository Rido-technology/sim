import type { ToolConfig } from '@/tools/types'
import type { TextSearchParams, TextSearchResult } from './types'

export const textSearchTool: ToolConfig<TextSearchParams, TextSearchResult> = {
  id: 'text_helper_search',
  name: 'Search Text',
  description: 'Search for text patterns and return matches with positions',
  version: '1.0.0',

  params: {
    text: {
      type: 'string',
      required: true,
      description: 'The text to search in',
    },
    pattern: {
      type: 'string',
      required: true,
      description: 'The text pattern to search for',
    },
    caseSensitive: {
      type: 'boolean',
      required: false,
      description: 'Whether the search should be case sensitive (default: false)',
    },
  },

  request: {
    url: '/api/tools/text_helper/search',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    const text = String(params.text)
    const pattern = String(params.pattern)
    const caseSensitive = Boolean(params.caseSensitive)

    if (!pattern) {
      return {
        success: true,
        output: {
          found: false,
          matches: [],
          positions: [],
          count: 0,
        },
      }
    }

    const flags = caseSensitive ? 'g' : 'gi'
    const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(escapedPattern, flags)

    const matches: string[] = []
    const positions: number[] = []
    let match: RegExpExecArray | null

    while ((match = regex.exec(text)) !== null) {
      matches.push(match[0])
      positions.push(match.index)
      // Prevent infinite loop for empty matches
      if (match[0].length === 0) {
        regex.lastIndex++
      }
    }

    return {
      success: true,
      output: {
        found: matches.length > 0,
        matches,
        positions,
        count: matches.length,
      },
    }
  },

  outputs: {
    found: {
      type: 'boolean',
      description: 'Whether any matches were found',
    },
    matches: {
      type: 'array',
      description: 'Array of matched text strings',
    },
    positions: {
      type: 'array',
      description: 'Array of positions where matches were found',
    },
    count: {
      type: 'number',
      description: 'Total number of matches found',
    },
  },
}