import { createLogger } from '@sim/logger'
import type { ToolConfig } from '@/tools/types'
import type {
  MicrosoftOneNoteToolParams,
  OneNoteGetPageContentResponse,
} from './types'

const logger = createLogger('MicrosoftOneNote')

export const microsoftOnenoteGetPageContent: ToolConfig<
  MicrosoftOneNoteToolParams,
  OneNoteGetPageContentResponse
> = {
  id: 'microsoft_onenote_get_page_content',
  name: 'Get OneNote Page Content',
  description: 'Get the HTML content of a specific OneNote page',
  version: '1.0.0',
  oauth: {
    required: true,
    provider: 'microsoft-onenote',
  },
  params: {
    accessToken: {
      type: 'string',
      required: true,
      visibility: 'hidden',
      description: 'Access token for Microsoft Graph API',
    },
    pageId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'The ID of the page to retrieve content from',
    },
  },
  request: {
    url: (params) => `https://graph.microsoft.com/v1.0/me/onenote/pages/${params.pageId}/content`,
    method: 'GET',
    headers: (params) => ({
      Authorization: `Bearer ${params.accessToken}`,
    }),
  },
  transformResponse: async (response) => {
    if (!response.ok) {
      const data = await response.json()
      logger.error('Failed to get page content', { data })
      throw new Error(data.error?.message || 'Failed to get page content')
    }

    const content = await response.text()
    const pageId = response.url.split('/pages/')[1]?.split('/')[0] || ''

    logger.info('Page content retrieved successfully', {
      pageId,
      contentLength: content.length,
    })

    return {
      success: true,
      output: {
        content,
        pageId,
      },
    }
  },
  outputs: {
    success: { type: 'boolean', description: 'Whether the operation was successful' },
    content: { type: 'string', description: 'HTML content of the page' },
    pageId: { type: 'string', description: 'ID of the page' },
  },
}
