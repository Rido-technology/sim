import { createLogger } from '@sim/logger'
import type {
  MicrosoftTodoToolParams,
  MicrosoftTodoUpdateTaskListResponse,
  TaskList,
} from '@/tools/microsoft_todo/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftTodoUpdateTaskList')

export const updateTaskListTool: ToolConfig<
  MicrosoftTodoToolParams,
  MicrosoftTodoUpdateTaskListResponse
> = {
  id: 'microsoft_todo_update_task_list',
  name: 'Update Task List',
  description: 'Update an existing task list in Microsoft To Do',
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
      description: 'The ID of the task list to update',
    },
    displayName: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'The new name of the task list',
    },
  },

  request: {
    url: (params) => {
      if (!params.listId) {
        throw new Error('List ID is required')
      }

      return `https://graph.microsoft.com/v1.0/me/todo/lists/${params.listId}`
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
      if (!params.displayName) {
        throw new Error('Display name is required')
      }

      return JSON.stringify({
        displayName: params.displayName,
      })
    },
  },

  transformResponse: async (response) => {
    logger.info('Transforming update task list response')

    const data = await response.json()

    if (!response.ok) {
      logger.error('Error updating task list', { error: data })
      return {
        success: false,
        error: data.error?.message || 'Failed to update task list',
      }
    }

    const taskList = data as TaskList

    return {
      success:true,
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
      description: 'Updated task list details',
    },
  },
}
