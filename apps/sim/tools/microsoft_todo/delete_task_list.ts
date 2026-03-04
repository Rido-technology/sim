import { createLogger } from '@sim/logger'
import type {
  MicrosoftTodoDeleteTaskListResponse,
  MicrosoftTodoToolParams,
} from '@/tools/microsoft_todo/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftTodoDeleteTaskList')

export const deleteTaskListTool: ToolConfig<
  MicrosoftTodoToolParams,
  MicrosoftTodoDeleteTaskListResponse
> = {
  id: 'microsoft_todo_delete_task_list',
  name: 'Delete Task List',
  description: 'Delete a task list in Microsoft To Do',
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
      description: 'The ID of the task list to delete',
    },
  },

  request: {
    url: (params) => {
      if (!params.listId) {
        throw new Error('List ID is required')
      }

      return `https://graph.microsoft.com/v1.0/me/todo/lists/${params.listId}`
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

  transformResponse: async (response) => {
    logger.info('Transforming delete task list response')

    if (!response.ok) {
      const data = await response.json()
      logger.error('Error deleting task list', { error: data })
      return {
        success: false,
        error: data.error?.message || 'Failed to delete task list',
      }
    }

    return {
      success: true,
      output: {
        data: {
          success: true,
          message: 'Task list deleted successfully',
        },
      },
    }
  },

  outputs: {
    success: {
      type: 'boolean',
      description: 'Whether the task list was deleted successfully',
    },
    message: {
      type: 'string',
      description: 'Success message',
    },
  },
}
