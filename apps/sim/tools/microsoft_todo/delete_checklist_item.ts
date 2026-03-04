import { createLogger } from '@sim/logger'
import type {
  MicrosoftTodoDeleteChecklistItemResponse,
  MicrosoftTodoToolParams,
} from '@/tools/microsoft_todo/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftTodoDeleteChecklistItem')

export const deleteChecklistItemTool: ToolConfig<
  MicrosoftTodoToolParams,
  MicrosoftTodoDeleteChecklistItemResponse
> = {
  id: 'microsoft_todo_delete_checklist_item',
  name: 'Delete Checklist Item',
  description: 'Delete a checklist item (subtask) from a Microsoft To Do task',
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
    checklistItemId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'The ID of the checklist item to delete',
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
      if (!params.checklistItemId) {
        throw new Error('Checklist item ID is required')
      }

      return `https://graph.microsoft.com/v1.0/me/todo/lists/${params.listId}/tasks/${params.taskId}/checklistItems/${params.checklistItemId}`
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

  transformResponse: async (
    response
  ): Promise<MicrosoftTodoDeleteChecklistItemResponse> => {
    logger.info('Transforming delete checklist item response')

    if (!response.ok) {
      const data = await response.json()
      logger.error('Error deleting checklist item', { error: data })
      return {
        success: false,
        error: data.error?.message || 'Failed to delete checklist item',
      }
    }

    return {
      success: true,
      output: {
        data: {
          success: true,
          message: 'Checklist item deleted successfully',
        },
      },
    }
  },

  outputs: {
    success: {
      type: 'boolean',
      description: 'Whether the checklist item was deleted successfully',
    },
    message: {
      type: 'string',
      description: 'Success message',
    },
  },
}
