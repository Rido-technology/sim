import { createLogger } from '@sim/logger'
import type {
  MicrosoftTodoReopenTaskResponse,
  MicrosoftTodoToolParams,
  TodoTask,
} from '@/tools/microsoft_todo/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftTodoReopenTask')

export const reopenTaskTool: ToolConfig<
  MicrosoftTodoToolParams,
  MicrosoftTodoReopenTaskResponse
> = {
  id: 'microsoft_todo_reopen_task',
  name: 'Reopen Task',
  description: 'Reopen a completed task in Microsoft To Do (set status to notStarted)',
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
      description: 'The ID of the task to reopen',
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
    body: () => {
      return JSON.stringify({
        status: 'notStarted',
      })
    },
  },

  transformResponse: async (response): Promise<MicrosoftTodoReopenTaskResponse> => {
    logger.info('Transforming reopen task response')

    const data = await response.json()

    if (!response.ok) {
      logger.error('Error reopening task', { error: data })
      return {
        success: false,
        error: data.error?.message || 'Failed to reopen task',
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
      description: 'The reopened task',
    },
  },
}
