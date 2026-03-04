import { createLogger } from '@sim/logger'
import type {
  MicrosoftTodoCompleteTaskResponse,
  MicrosoftTodoToolParams,
  TodoTask,
} from '@/tools/microsoft_todo/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftTodoCompleteTask')

export const completeTaskTool: ToolConfig<
  MicrosoftTodoToolParams,
  MicrosoftTodoCompleteTaskResponse
> = {
  id: 'microsoft_todo_complete_task',
  name: 'Complete Task',
  description: 'Mark a task as completed in Microsoft To Do',
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
      description: 'The ID of the task to complete',
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
        status: 'completed',
      })
    },
  },

  transformResponse: async (response): Promise<MicrosoftTodoCompleteTaskResponse> => {
    logger.info('Transforming complete task response')

    const data = await response.json()

    if (!response.ok) {
      logger.error('Error completing task', { error: data })
      return {
        success: false,
        error: data.error?.message || 'Failed to complete task',
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
      description: 'The completed task',
    },
  },
}
