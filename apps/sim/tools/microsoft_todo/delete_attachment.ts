import { createLogger } from '@sim/logger'
import type {
  MicrosoftTodoDeleteAttachmentResponse,
  MicrosoftTodoToolParams,
} from '@/tools/microsoft_todo/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftTodoDeleteAttachment')

export const deleteAttachmentTool: ToolConfig<
  MicrosoftTodoToolParams,
  MicrosoftTodoDeleteAttachmentResponse
> = {
  id: 'microsoft_todo_delete_attachment',
  name: 'Delete Attachment',
  description: 'Delete an attachment (linked resource) from a Microsoft To Do task',
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
      description: 'The ID of the attachment to delete',
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

  transformResponse: async (response): Promise<MicrosoftTodoDeleteAttachmentResponse> => {
    logger.info('Transforming delete attachment response')

    if (!response.ok) {
      const data = await response.json()
      logger.error('Error deleting attachment', { error: data })
      return {
        success: false,
        error: data.error?.message || 'Failed to delete attachment',
      }
    }

    return {
      success: true,
      output: {
        data: {
          success: true,
          message: 'Attachment deleted successfully',
        },
      },
    }
  },

  outputs: {
    success: {
      type: 'boolean',
      description: 'Whether the attachment was deleted successfully',
    },
    message: {
      type: 'string',
      description: 'Success message',
    },
  },
}
