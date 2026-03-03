import { createLogger } from '@sim/logger'
import type {
  MicrosoftOneNoteToolParams,
  OneNoteListPagesResponse,
  Page,
} from '@/tools/microsoft_onenote/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftOneNoteListPages')

export const listPagesTool: ToolConfig<MicrosoftOneNoteToolParams, OneNoteListPagesResponse> = {
  id: 'microsoft_onenote_list_pages',
  name: 'List OneNote Pages',
  description: 'List all pages in a OneNote section',
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
    sectionId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'The ID of the section (e.g., "1-abcdef")',
    },
    search: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Search term to filter pages',
    },
    top: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'Maximum number of pages to return (e.g., 10, 50, 100)',
    },
  },

  request: {
    url: (params) => {
      if (!params.sectionId) {
        throw new Error('Section ID is required')
      }

      const url = new URL(
        `https://graph.microsoft.com/v1.0/me/onenote/sections/${params.sectionId}/pages`
      )

      if (params.search) {
        url.searchParams.append('search', params.search)
      }

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
    logger.info('Listed pages:', data)

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
    pages: { type: 'array', description: 'List of pages in the section' },
  },
}
