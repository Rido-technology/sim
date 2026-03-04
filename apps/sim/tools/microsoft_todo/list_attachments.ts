import { createLogger } from '@sim/logger'
import type {
  LinkedResource,
  MicrosoftTodoListAttachmentsResponse,
  MicrosoftTodoToolParams,
} from '@/tools/microsoft_todo/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftTodoListAttachments')

export const listAttachmentsTool: ToolConfig<
  MicrosoftTodoToolParams,
  MicrosoftTodoListAttachmentsResponse
> = {
  id: 'microsoft_todo_list_attachments',
  name: 'List Attachments',
  description: 'List all attachments (linked resources) in a Microsoft To Do task',
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
  },

  request: {
    url: (params) => {
      if (!params.listId) {
        throw new Error('List ID is required')
      }
      if (!params.taskId) {
        throw new Error('Task ID is required')
      }

      return `https://graph.microsoft.com/v1.0/me/todo/lists/${params.listId}/tasks/${params.taskId}/linkedResources`
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

  transformResponse: async (response): Promise<MicrosoftTodoListAttachmentsResponse> => {
    logger.info('Transforming list attachments response')

    const data = await response.json()

    if (!response.ok) {
      logger.error('Error listing attachments', { error: data })
      return {
        success: false,
        error: data.error?.message || 'Failed to list attachments',
      }
    }

    const attachments = data.value as LinkedResource[]

    return {
      success: true,
      output: {
        data: {
          attachments,
        },
      },
    }
  },

  outputs: {
    attachments: {
      type: 'array',
      description: 'List of attachments in the task',
    },
  },
}
