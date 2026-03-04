import { createLogger } from '@sim/logger'
import type {
  MicrosoftTodoGetTaskResponse,
  MicrosoftTodoToolParams,
  TodoTask,
} from '@/tools/microsoft_todo/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftTodoGetTask')

export const getTaskTool: ToolConfig<MicrosoftTodoToolParams, MicrosoftTodoGetTaskResponse> = {
  id: 'microsoft_todo_get_task',
  name: 'Get Task',
  description: 'Get details of a specific task in Microsoft To Do',
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

      return `https://graph.microsoft.com/v1.0/me/todo/lists/${params.listId}/tasks/${params.taskId}`
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

  transformResponse: async (response): Promise<MicrosoftTodoGetTaskResponse> => {
    logger.info('Transforming get task response')

    const data = await response.json()

    if (!response.ok) {
      logger.error('Error getting task', { error: data })
      return {
        success: false,
        error: data.error?.message || 'Failed to get task',
      }
    }

    const task = data as TodoTask

    return {
      success: true,
      output: {
        data: {
          task,
        },
      },
    }
  },

  outputs: {
    task: {
      type: 'object',
      description: 'The task details',
    },
  },
}
