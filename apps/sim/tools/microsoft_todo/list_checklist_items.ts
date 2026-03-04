import { createLogger } from '@sim/logger'
import type {
  ChecklistItem,
  MicrosoftTodoListChecklistItemsResponse,
  MicrosoftTodoToolParams,
} from '@/tools/microsoft_todo/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftTodoListChecklistItems')

export const listChecklistItemsTool: ToolConfig<
  MicrosoftTodoToolParams,
  MicrosoftTodoListChecklistItemsResponse
> = {
  id: 'microsoft_todo_list_checklist_items',
  name: 'List Checklist Items',
  description: 'List all checklist items (subtasks) in a Microsoft To Do task',
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

      return `https://graph.microsoft.com/v1.0/me/todo/lists/${params.listId}/tasks/${params.taskId}/checklistItems`
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

  transformResponse: async (
    response
  ): Promise<MicrosoftTodoListChecklistItemsResponse> => {
    logger.info('Transforming list checklist items response')

    const data = await response.json()

    if (!response.ok) {
      logger.error('Error listing checklist items', { error: data })
      return {
        success: false,
        error: data.error?.message || 'Failed to list checklist items',
      }
    }

    const checklistItems = data.value as ChecklistItem[]

    return {
      success: true,
      output: {
        data: {
          checklistItems,
        },
      },
    }
  },

  outputs: {
    checklistItems: {
      type: 'array',
      description: 'List of checklist items in the task',
    },
  },
}
