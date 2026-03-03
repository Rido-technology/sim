import { createLogger } from '@sim/logger'
import type {
  MicrosoftOneNoteToolParams,
  OneNoteDeletePageResponse,
} from '@/tools/microsoft_onenote/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftOneNoteDeletePage')

export const deletePageTool: ToolConfig<MicrosoftOneNoteToolParams, OneNoteDeletePageResponse> = {
  id: 'microsoft_onenote_delete_page',
  name: 'Delete OneNote Page',
  description: 'Delete a OneNote page',
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
      description: 'The ID of the page to delete',
    },
  },

  request: {
    url: (params) => {
      if (!params.pageId) {
        throw new Error('Page ID is required')
      }

      return `https://graph.microsoft.com/v1.0/me/onenote/pages/${params.pageId}`
    },
    method: 'DELETE',
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
    // DELETE requests typically return 204 No Content on success
    if (response.status === 204) {
      logger.info('Page deleted successfully')
      return {
        success: true,
        output: {
          success: true,
          message: 'Page deleted successfully',
        },
      }
    }

    logger.info('Delete response status:', response.status)

    return {
      success: true,
      output: {
        success: true,
        message: 'Page deleted',
      },
    }
  },

  outputs: {
    success: { type: 'boolean', description: 'Whether the operation was successful' },
    message: { type: 'string', description: 'Status message' },
  },
}
