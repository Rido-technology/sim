import { createLogger } from '@sim/logger'
import type {
  ChecklistItem,
  MicrosoftTodoToolParams,
  MicrosoftTodoUpdateChecklistItemResponse,
} from '@/tools/microsoft_todo/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftTodoUpdateChecklistItem')

export const updateChecklistItemTool: ToolConfig<
  MicrosoftTodoToolParams,
  MicrosoftTodoUpdateChecklistItemResponse
> = {
  id: 'microsoft_todo_update_checklist_item',
  name: 'Update Checklist Item',
  description: 'Update a checklist item (subtask) in a Microsoft To Do task',
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
      description: 'The ID of the checklist item to update',
    },
    displayName: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'The name of the checklist item',
    },
    isChecked: {
      type: 'boolean',
      required: false,
      visibility: 'user-or-llm',
      description: 'Whether the checklist item is checked',
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
      const body: Record<string, unknown> = {}

      if (params.displayName !== undefined) {
        body.displayName = params.displayName
      }

      if (params.isChecked !== undefined) {
        body.isChecked = params.isChecked
      }

      return JSON.stringify(body)
    },
  },

  transformResponse: async (
    response
  ): Promise<MicrosoftTodoUpdateChecklistItemResponse> => {
    logger.info('Transforming update checklist item response')

    const data = await response.json()

    if (!response.ok) {
      logger.error('Error updating checklist item', { error: data })
      return {
        success: false,
        error: data.error?.message || 'Failed to update checklist item',
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
      description: 'The updated checklist item',
    },
  },
}
