import { createLogger } from '@sim/logger'
import type {
  MicrosoftTodoToolParams,
  MicrosoftTodoUpdateTaskResponse,
  TodoTask,
} from '@/tools/microsoft_todo/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftTodoUpdateTask')

export const updateTaskTool: ToolConfig<
  MicrosoftTodoToolParams,
  MicrosoftTodoUpdateTaskResponse
> = {
  id: 'microsoft_todo_update_task',
  name: 'Update Task',
  description: 'Update an existing task in Microsoft To Do',
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
      description: 'The ID of the task to update',
    },
    title: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'The title of the task',
    },
    body: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'The description/notes for the task',
    },
    bodyType: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Content type of the body (text or html)',
    },
    importance: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Importance level: low, normal, or high',
    },
    status: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Status: notStarted, inProgress, completed, waitingOnOthers, or deferred',
    },
    dueDateTime: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Due date and time (ISO 8601 format)',
    },
    dueTimeZone: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Time zone for due date',
    },
    startDateTime: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Start date and time (ISO 8601 format)',
    },
    startTimeZone: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Time zone for start date',
    },
    reminderDateTime: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Reminder date and time (ISO 8601 format)',
    },
    reminderTimeZone: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Time zone for reminder',
    },
    isReminderOn: {
      type: 'boolean',
      required: false,
      visibility: 'user-or-llm',
      description: 'Whether reminder is enabled',
    },
    categories: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'JSON array of categories',
    },
    recurrence: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'JSON object for recurrence pattern',
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
    body: (params) => {
      const body: Record<string, unknown> = {}

      if (params.title !== undefined) {
        body.title = params.title
      }

      if (params.body !== undefined) {
        body.body = {
          content: params.body,
          contentType: params.bodyType || 'text',
        }
      }

      if (params.importance !== undefined) {
        body.importance = params.importance
      }

      if (params.status !== undefined) {
        body.status = params.status
      }

      if (params.dueDateTime !== undefined) {
        body.dueDateTime = {
          dateTime: params.dueDateTime,
          timeZone: params.dueTimeZone || 'UTC',
        }
      }

      if (params.startDateTime !== undefined) {
        body.startDateTime = {
          dateTime: params.startDateTime,
          timeZone: params.startTimeZone || 'UTC',
        }
      }

      if (params.reminderDateTime !== undefined) {
        body.reminderDateTime = {
          dateTime: params.reminderDateTime,
          timeZone: params.reminderTimeZone || 'UTC',
        }
      }

      if (params.isReminderOn !== undefined) {
        body.isReminderOn = params.isReminderOn
      }

      if (params.categories !== undefined) {
        try {
          body.categories = JSON.parse(params.categories)
        } catch (error) {
          logger.warn('Failed to parse categories, using as single item', { error })
          body.categories = [params.categories]
        }
      }

      if (params.recurrence !== undefined) {
        try {
          body.recurrence = JSON.parse(params.recurrence)
        } catch (error) {
          logger.error('Failed to parse recurrence pattern', { error })
        }
      }

      return JSON.stringify(body)
    },
  },

  transformResponse: async (response): Promise<MicrosoftTodoUpdateTaskResponse> => {
    logger.info('Transforming update task response')

    const data = await response.json()

    if (!response.ok) {
      logger.error('Error updating task', { error: data })
      return {
        success: false,
        error: data.error?.message || 'Failed to update task',
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
      description: 'The updated task',
    },
  },
}
