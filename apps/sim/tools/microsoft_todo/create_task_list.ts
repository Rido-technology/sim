import { createLogger } from '@sim/logger'
import type {
  MicrosoftTodoCreateTaskListResponse,
  MicrosoftTodoToolParams,
  TaskList,
} from '@/tools/microsoft_todo/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftTodoCreateTaskList')

export const createTaskListTool: ToolConfig<
  MicrosoftTodoToolParams,
  MicrosoftTodoCreateTaskListResponse
> = {
  id: 'microsoft_todo_create_task_list',
  name: 'Create Task List',
  description: 'Create a new task list in Microsoft To Do',
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
    displayName: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'The name of the task list',
    },
  },

  request: {
    url: () => 'https://graph.microsoft.com/v1.0/me/todo/lists',
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

  transformResponse: async (response) => {
    logger.info('Transforming create task list response')

    const data = await response.json()

    if (!response.ok) {
      logger.error('Error creating task list', { error: data })
      return {
        success: false,
        error: data.error?.message || 'Failed to create task list',
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
      description: 'Created task list details',
    },
  },
}
