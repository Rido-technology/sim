import { createLogger } from '@sim/logger'
import type {
  MicrosoftTodoDeleteTaskResponse,
  MicrosoftTodoToolParams,
} from '@/tools/microsoft_todo/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftTodoDeleteTask')

export const deleteTaskTool: ToolConfig<
  MicrosoftTodoToolParams,
  MicrosoftTodoDeleteTaskResponse
> = {
  id: 'microsoft_todo_delete_task',
  name: 'Delete Task',
  description: 'Delete a task from a Microsoft To Do task list',
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
      description: 'The ID of the task to delete',
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

      return `https://graph.microsoft.com/v1.0/me/todo/lists/${params.listId}/tasks/${params.taskId}`
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

  transformResponse: async (response): Promise<MicrosoftTodoDeleteTaskResponse> => {
    logger.info('Transforming delete task response')

    if (!response.ok) {
      const data = await response.json()
      logger.error('Error deleting task', { error: data })
      return {
        success: false,
        error: data.error?.message || 'Failed to delete task',
      }
    }

    return {
      success: true,
      output: {
        data: {
          success: true,
          message: 'Task deleted successfully',
        },
      },
    }
  },

  outputs: {
    success: {
      type: 'boolean',
      description: 'Whether the task was deleted successfully',
    },
    message: {
      type: 'string',
      description: 'Success message',
    },
  },
}
