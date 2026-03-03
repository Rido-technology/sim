import { createLogger } from '@sim/logger'
import type {
  MicrosoftOneNoteToolParams,
  OneNoteGetPageResponse,
  Page,
} from '@/tools/microsoft_onenote/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftOneNoteGetPage')

export const getPageTool: ToolConfig<MicrosoftOneNoteToolParams, OneNoteGetPageResponse> = {
  id: 'microsoft_onenote_get_page',
  name: 'Get OneNote Page',
  description: 'Get details and optionally content of a OneNote page',
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
    pageId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'The ID of the page to retrieve (e.g., "1-xyz789")',
    },
    includeContent: {
      type: 'boolean',
      required: false,
      visibility: 'user-or-llm',
      description: 'Whether to include the HTML content of the page',
    },
  },

  request: {
    url: (params) => {
      if (!params.pageId) {
        throw new Error('Page ID is required')
      }

      return `https://graph.microsoft.com/v1.0/me/onenote/pages/${params.pageId}`
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

  transformResponse: async (response: Response, params) => {
    const pageData = await response.json()
    logger.info('Retrieved page metadata:', pageData)

    const page: Page = {
      id: pageData.id,
      title: pageData.title,
      createdDateTime: pageData.createdDateTime,
      lastModifiedDateTime: pageData.lastModifiedDateTime,
      level: pageData.level || 0,
      order: pageData.order || 0,
      contentUrl: pageData.contentUrl,
      links: pageData.links,
      parentSection: pageData.parentSection,
    }

    let content: string | undefined

    // Fetch content if requested
    if (params?.includeContent && pageData.contentUrl && params?.accessToken) {
      try {
        const contentResponse = await fetch(pageData.contentUrl, {
          headers: {
            Authorization: `Bearer ${params.accessToken}`,
          },
        })

        if (contentResponse.ok) {
          content = await contentResponse.text()
          logger.info('Retrieved page content')
        }
      } catch (error) {
        logger.error('Failed to fetch page content:', error)
      }
    }

    return {
      success: true,
      output: {
        page,
        content,
      },
    }
  },

  outputs: {
    success: { type: 'boolean', description: 'Whether the operation was successful' },
    page: { type: 'object', description: 'The page metadata' },
    content: { type: 'string', description: 'The HTML content of the page (if requested)' },
  },
}
