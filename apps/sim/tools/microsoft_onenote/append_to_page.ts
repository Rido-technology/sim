import { createLogger } from '@sim/logger'
import type {
  MicrosoftOneNoteToolParams,
  OneNoteAppendToPageResponse,
} from '@/tools/microsoft_onenote/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftOneNoteAppendToPage')

export const appendToPageTool: ToolConfig<
  MicrosoftOneNoteToolParams,
  OneNoteAppendToPageResponse
> = {
  id: 'microsoft_onenote_append_to_page',
  name: 'Append to OneNote Page',
  description: 'Append content to the end of an existing OneNote page',
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
      description: 'The ID of the page to append to',
    },
    content: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'The HTML content to append (e.g., "<p>Additional notes</p>")',
    },
  },

  request: {
    url: (params) => {
      if (!params.pageId) {
        throw new Error('Page ID is required')
      }

      return `https://graph.microsoft.com/v1.0/me/onenote/pages/${params.pageId}/content`
    },
    method: 'PATCH',
    headers: (params) => {
      if (!params.accessToken) {
        throw new Error('Access token is required')
      }

      return {
        Authorization: `Bearer ${params.accessToken}`,
        'Content-Type': 'application/json',
      }
    },
    body: (params) => {
      if (!params.content) {
        throw new Error('Content is required')
      }

      // Append to the end of the page body
      const patchOperations = [
        {
          target: 'body',
          action: 'append',
          position: 'after',
          content: params.content,
        },
      ]

      logger.info('Appending content to page:', params.pageId)
      return patchOperations
    },
  },

  transformResponse: async (response: Response) => {
    // PATCH requests typically return 204 No Content on success
    if (response.status === 204) {
      logger.info('Content appended successfully')
      return {
        success: true,
        output: {
          success: true,
          message: 'Content appended successfully',
        },
      }
    }

    const data = await response.json()
    logger.info('Append response:', data)

    return {
      success: true,
      output: {
        success: true,
        message: 'Content appended',
      },
    }
  },

  outputs: {
    success: { type: 'boolean', description: 'Whether the operation was successful' },
    message: { type: 'string', description: 'Status message' },
  },
}
