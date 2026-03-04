import { createLogger } from '@sim/logger'
import type {
  MicrosoftTodoListTasksResponse,
  MicrosoftTodoToolParams,
  TodoTask,
} from '@/tools/microsoft_todo/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftTodoListTasks')

export const listTasksTool: ToolConfig<MicrosoftTodoToolParams, MicrosoftTodoListTasksResponse> = {
  id: 'microsoft_todo_list_tasks',
  name: 'List Tasks',
  description: 'List all tasks in a Microsoft To Do task list',
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
    select: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Comma-separated list of properties to select',
    },
    filter: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'OData filter query (e.g., status eq \'notStarted\')',
    },
    orderby: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Sort field (e.g., dueDateTime/dateTime)',
    },
    top: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'Maximum number of tasks to return',
    },
  },

  request: {
    url: (params) => {
      if (!params.listId) {
        throw new Error('List ID is required')
      }

      const url = new URL(
        `https://graph.microsoft.com/v1.0/me/todo/lists/${params.listId}/tasks`
      )

      if (params.select) {
        url.searchParams.append('$select', params.select)
      }

      if (params.filter) {
        url.searchParams.append('$filter', params.filter)
      }

      if (params.orderby) {
        url.searchParams.append('$orderby', params.orderby)
      }

      if (params.top) {
        url.searchParams.append('$top', params.top.toString())
      }

      return url.toString()
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

  transformResponse: async (response): Promise<MicrosoftTodoListTasksResponse> => {
    logger.info('Transforming list tasks response')

    const data = await response.json()

    if (!response.ok) {
      logger.error('Error listing tasks', { error: data })
      return {
        success: false,
        error: data.error?.message || 'Failed to list tasks',
      }
    }

    const tasks = data.value as TodoTask[]

    return {
      success: true,
      output: {
        data: {
          tasks,
          nextLink: data['@odata.nextLink'],
        },
      },
    }
  },

  outputs: {
    tasks: {
      type: 'array',
      description: 'List of tasks in the task list',
    },
    nextLink: {
      type: 'string',
      description: 'Link to next page of results if pagination is available',
    },
  },
}
