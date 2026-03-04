import { createLogger } from '@sim/logger'
import type {
  LinkedResource,
  MicrosoftTodoAddAttachmentResponse,
  MicrosoftTodoToolParams,
} from '@/tools/microsoft_todo/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftTodoAddAttachment')

export const addAttachmentTool: ToolConfig<
  MicrosoftTodoToolParams,
  MicrosoftTodoAddAttachmentResponse
> = {
  id: 'microsoft_todo_add_attachment',
  name: 'Add Attachment',
  description: 'Add a link attachment (linked resource) to a Microsoft To Do task',
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
    webUrl: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'The URL of the linked resource',
    },
    displayName: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'The display name for the attachment',
    },
    applicationName: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'The application name (e.g., SharePoint, OneDrive)',
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
    method: 'POST',
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
      if (!params.webUrl) {
        throw new Error('Web URL is required')
      }
      if (!params.displayName) {
        throw new Error('Display name is required')
      }

      return JSON.stringify({
        webUrl: params.webUrl,
        displayName: params.displayName,
        applicationName: params.applicationName || 'Web',
      })
    },
  },

  transformResponse: async (response): Promise<MicrosoftTodoAddAttachmentResponse> => {
    logger.info('Transforming add attachment response')

    const data = await response.json()

    if (!response.ok) {
      logger.error('Error adding attachment', { error: data })
      return {
        success: false,
        error: data.error?.message || 'Failed to add attachment',
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
      description: 'The created attachment',
    },
  },
}
