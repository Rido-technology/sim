import { createLogger } from '@sim/logger'
import type {
  MicrosoftTodoGetTaskListResponse,
  MicrosoftTodoToolParams,
  TaskList,
} from '@/tools/microsoft_todo/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftTodoGetTaskList')

export const getTaskListTool: ToolConfig<MicrosoftTodoToolParams, MicrosoftTodoGetTaskListResponse> =
  {
    id: 'microsoft_todo_get_task_list',
    name: 'Get Task List',
    description: 'Get details of a specific task list in Microsoft To Do',
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
        description: 'The ID of the task list to retrieve',
      },
    },

    request: {
      url: (params) => {
        if (!params.listId) {
          throw new Error('List ID is required')
        }

        return `https://graph.microsoft.com/v1.0/me/todo/lists/${params.listId}`
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

    transformResponse: async (response) => {
      logger.info('Transforming get task list response')

      const data = await response.json()

      if (!response.ok) {
        logger.error('Error getting task list', { error: data })
        return {
          success: false,
          error: data.error?.message || 'Failed to get task list',
        }
      }

      const taskList = data as TaskList

      return {
        success: true,
        output: {
          data: {
            taskList,
          },
        },
      }
    },

    outputs: {
      taskList: {
        type: 'json',
        description: 'Task list details',
      },
    },
  }
