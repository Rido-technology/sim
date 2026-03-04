import { createLogger } from '@sim/logger'
import type {
  ChecklistItem,
  MicrosoftTodoCreateChecklistItemResponse,
  MicrosoftTodoToolParams,
} from '@/tools/microsoft_todo/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftTodoCreateChecklistItem')

export const createChecklistItemTool: ToolConfig<
  MicrosoftTodoToolParams,
  MicrosoftTodoCreateChecklistItemResponse
> = {
  id: 'microsoft_todo_create_checklist_item',
  name: 'Create Checklist Item',
  description: 'Create a new checklist item (subtask) in a Microsoft To Do task',
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
    displayName: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'The name of the checklist item',
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

      return `https://graph.microsoft.com/v1.0/me/todo/lists/${params.listId}/tasks/${params.taskId}/checklistItems`
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
      if (!params.displayName) {
        throw new Error('Display name is required')
      }

      return JSON.stringify({
        displayName: params.displayName,
      })
    },
  },

  transformResponse: async (
    response
  ): Promise<MicrosoftTodoCreateChecklistItemResponse> => {
    logger.info('Transforming create checklist item response')

    const data = await response.json()

    if (!response.ok) {
      logger.error('Error creating checklist item', { error: data })
      return {
        success: false,
        error: data.error?.message || 'Failed to create checklist item',
      }
    }

    const checklistItem = data as ChecklistItem

    return {
      success: true,
      output: {
        data: {
          checklistItem,
        },
      },
    }
  },

  outputs: {
    checklistItem: {
      type: 'object',
      description: 'The created checklist item',
    },
  },
}
