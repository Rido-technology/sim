import { createLogger } from '@sim/logger'
import type {
  MicrosoftOneNoteToolParams,
  OneNoteSearchPagesResponse,
  Page,
} from '@/tools/microsoft_onenote/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftOneNoteSearchPages')

export const searchPagesTool: ToolConfig<MicrosoftOneNoteToolParams, OneNoteSearchPagesResponse> =
  {
    id: 'microsoft_onenote_search_pages',
    name: 'Search OneNote Pages',
    description: 'Search across all OneNote pages',
    version: '1.0',

    oauth: {
      required: true,
      provider: 'microsoft-onenote',
    },

    params: {
      accessToken: {
        type: 'string',
        required: true,
        visibility: 'hidden',
        description: 'The access token for the Microsoft OneNote API',
      },
      search: {
        type: 'string',
        required: true,
        visibility: 'user-or-llm',
        description: 'The search term (e.g., "meeting", "project notes")',
      },
      top: {
        type: 'number',
        required: false,
        visibility: 'user-or-llm',
        description: 'Maximum number of results to return (e.g., 10, 50, 100)',
      },
    },

    request: {
      url: (params) => {
        if (!params.search) {
          throw new Error('Search term is required')
        }

        const url = new URL('https://graph.microsoft.com/v1.0/me/onenote/pages')
        url.searchParams.append('search', params.search)

        if (params.top) {
          url.searchParams.append('$top', params.top.toString())
        }

        return url.toString()
      },
      method: 'GET',
      headers: (params) => {
        if (!params.accessToken) {
          throw new Error('Access token is required')
        }

        return {
          Authorization: `Bearer ${params.accessToken}`,
        }
      },
    },

    transformResponse: async (response: Response) => {
      const data = await response.json()
      logger.info('Search results:', data)

      const pages: Page[] = data.value?.map((page: any) => ({
        id: page.id,
        title: page.title,
        createdDateTime: page.createdDateTime,
        lastModifiedDateTime: page.lastModifiedDateTime,
        level: page.level || 0,
        order: page.order || 0,
        contentUrl: page.contentUrl,
        links: page.links,
        parentSection: page.parentSection,
      }))

      return {
        success: true,
        output: {
          pages: pages || [],
        },
      }
    },

    outputs: {
      success: { type: 'boolean', description: 'Whether the operation was successful' },
      pages: { type: 'array', description: 'List of pages matching the search query' },
    },
  }
