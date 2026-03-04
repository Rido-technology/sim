import { createLogger } from '@sim/logger'
import type {
  LinkedResource,
  MicrosoftTodoGetAttachmentResponse,
  MicrosoftTodoToolParams,
} from '@/tools/microsoft_todo/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftTodoGetAttachment')

export const getAttachmentTool: ToolConfig<
  MicrosoftTodoToolParams,
  MicrosoftTodoGetAttachmentResponse
> = {
  id: 'microsoft_todo_get_attachment',
  name: 'Get Attachment',
  description: 'Get details of a specific attachment in a Microsoft To Do task',
  version: '1.0',

  oauth: {
    required: true,
    provider: 'microsoft-todo',
  },

  params: {
    accessToken: {
      type: 'string',
      required: true,
      visibility: 'hidden',
      description: 'The access token for the Microsoft To Do API',
    },
    listId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'The ID of the task list',
    },
    taskId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'The ID of the task',
    },
    attachmentId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'The ID of the attachment',
    },
  },

  request: {
    url: (params) => {
      if (!params.listId) {
        throw new Error('List ID is required')
      }
      if (!params.taskId) {
        throw new Error('Task ID is required')
      }
      if (!params.attachmentId) {
        throw new Error('Attachment ID is required')
      }

      return `https://graph.microsoft.com/v1.0/me/todo/lists/${params.listId}/tasks/${params.taskId}/linkedResources/${params.attachmentId}`
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

  transformResponse: async (response): Promise<MicrosoftTodoGetAttachmentResponse> => {
    logger.info('Transforming get attachment response')

    const data = await response.json()

    if (!response.ok) {
      logger.error('Error getting attachment', { error: data })
      return {
        success: false,
        error: data.error?.message || 'Failed to get attachment',
      }
    }

    const attachment = data as LinkedResource

    return {
      success: true,
      output: {
        data: {
          attachment,
        },
      },
    }
  },

  outputs: {
    attachment: {
      type: 'object',
      description: 'The attachment details',
    },
  },
}
