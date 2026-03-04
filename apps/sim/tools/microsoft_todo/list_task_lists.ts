import { createLogger } from '@sim/logger'
import type {
  MicrosoftTodoListTaskListsResponse,
  MicrosoftTodoToolParams,
  TaskList,
} from '@/tools/microsoft_todo/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftTodoListTaskLists')

export const listTaskListsTool: ToolConfig<
  MicrosoftTodoToolParams,
  MicrosoftTodoListTaskListsResponse
> = {
  id: 'microsoft_todo_list_task_lists',
  name: 'List Task Lists',
  description: 'List all task lists accessible to the user in Microsoft To Do',
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
      description: 'OData filter query',
    },
    orderby: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Sort field',
    },
    top: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'Maximum number of task lists to return',
    },
  },

  request: {
    url: (params) => {
      const url = new URL('https://graph.microsoft.com/v1.0/me/todo/lists')

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

  transformResponse: async (response): Promise<MicrosoftTodoListTaskListsResponse> => {
    logger.info('Transforming list task lists response')

    const data = await response.json()

    if (!response.ok) {
      logger.error('Error listing task lists', { error: data })
      return {
        success: false,
        error: data.error?.message || 'Failed to list task lists',
      }
    }

    const taskLists = data.value as TaskList[]

    return {
      success: true,
      output: {
        data: {
          taskLists,
          nextLink: data['@odata.nextLink'],
        },
      },
    }
  },

  outputs: {
    taskLists: {
      type: 'array',
      description: 'List of task lists',
    },
    nextLink: {
      type: 'string',
      description: 'Link to next page of results if pagination is available',
    },
  },
}
