import { createLogger } from '@sim/logger'
import type {
  MicrosoftOneNoteToolParams,
  OneNoteUpdatePageResponse,
} from '@/tools/microsoft_onenote/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftOneNoteUpdatePage')

export const updatePageTool: ToolConfig<MicrosoftOneNoteToolParams, OneNoteUpdatePageResponse> = {
  id: 'microsoft_onenote_update_page',
  name: 'Update OneNote Page',
  description: 'Update content of a OneNote page using JSON Patch operations',
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
      description: 'The ID of the page to update',
    },
    content: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'The HTML content to add to the page (e.g., "<p>Updated content</p>")',
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

      // OneNote uses JSON Patch format for updates
      const patchOperations = [
        {
          target: 'body',
          action: 'append',
          position: 'after',
          content: params.content,
        },
      ]

      logger.info('Updating page with operations:', patchOperations)
      return patchOperations
    },
  },

  transformResponse: async (response: Response) => {
    // PATCH requests to OneNote typically return 204 No Content on success
    if (response.status === 204) {
      logger.info('Page updated successfully')
      return {
        success: true,
        output: {
          success: true,
          message: 'Page updated successfully',
        },
      }
    }

    const data = await response.json()
    logger.info('Update response:', data)

    return {
      success: true,
      output: {
        success: true,
        message: 'Page updated',
      },
    }
  },

  outputs: {
    success: { type: 'boolean', description: 'Whether the operation was successful' },
    message: { type: 'string', description: 'Status message' },
  },
}
