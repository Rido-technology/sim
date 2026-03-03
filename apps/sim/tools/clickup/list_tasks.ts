import type {
  ClickUpListTasksParams,
  ClickUpListTasksResponse,
} from '@/tools/clickup/types'
import type { ToolConfig } from '@/tools/types'

export const clickupListTasksTool: ToolConfig<
  ClickUpListTasksParams,
  ClickUpListTasksResponse
> = {
  id: 'clickup_list_tasks',
  name: 'ClickUp List Tasks',
  description: 'List all tasks in a ClickUp list with optional filters',
  version: '1.0.0',

  oauth: {
    required: true,
    provider: 'clickup',
  },

  params: {
    accessToken: {
      type: 'string',
      required: true,
      visibility: 'hidden',
      description: 'OAuth access token for ClickUp',
    },
    listId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'List ID to retrieve tasks from',
    },
    archived: {
      type: 'boolean',
      required: false,
      visibility: 'user-or-llm',
      description: 'Include archived tasks',
    },
    page: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'Page number for pagination',
    },
    order_by: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Order tasks by: id, created, updated, due_date',
    },
    reverse: {
      type: 'boolean',
      required: false,
      visibility: 'user-or-llm',
      description: 'Reverse the order',
    },
    subtasks: {
      type: 'boolean',
      required: false,
      visibility: 'user-or-llm',
      description: 'Include subtasks',
    },
    statuses: {
      type: 'array',
      required: false,
      visibility: 'user-or-llm',
      description: 'Filter by status names',
    },
    include_closed: {
      type: 'boolean',
      required: false,
      visibility: 'user-or-llm',
      description: 'Include closed tasks',
    },
    assignees: {
      type: 'array',
      required: false,
      visibility: 'user-or-llm',
      description: 'Filter by assignee user IDs',
    },
    tags: {
      type: 'array',
      required: false,
      visibility: 'user-or-llm',
      description: 'Filter by tag names',
    },
    due_date_gt: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'Filter tasks with due date greater than Unix timestamp (milliseconds)',
    },
    due_date_lt: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'Filter tasks with due date less than Unix timestamp (milliseconds)',
    },
    date_created_gt: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'Filter tasks created after Unix timestamp (milliseconds)',
    },
    date_created_lt: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'Filter tasks created before Unix timestamp (milliseconds)',
    },
    date_updated_gt: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'Filter tasks updated after Unix timestamp (milliseconds)',
    },
    date_updated_lt: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'Filter tasks updated before Unix timestamp (milliseconds)',
    },
  },

  request: {
    url: '/api/tools/clickup/list-tasks',
    method: 'POST',
    headers: () => ({
      'Content-Type': 'application/json',
    }),
    body: (params) => ({
      accessToken: params.accessToken,
      listId: params.listId,
      archived: params.archived,
      page: params.page,
      order_by: params.order_by,
      reverse: params.reverse,
      subtasks: params.subtasks,
      statuses: params.statuses,
      include_closed: params.include_closed,
      assignees: params.assignees,
      tags: params.tags,
      due_date_gt: params.due_date_gt,
      due_date_lt: params.due_date_lt,
      date_created_gt: params.date_created_gt,
      date_created_lt: params.date_created_lt,
      date_updated_gt: params.date_updated_gt,
      date_updated_lt: params.date_updated_lt,
    }),
  },

  transformResponse: async (response: Response) => {
    const data = await response.json()
    return {
      success: data.success ?? true,
      output: data.output ?? data,
      error: data.error,
    }
  },

  outputs: {
    success: { type: 'boolean', description: 'Operation success status' },
    ts: { type: 'string', description: 'Timestamp of the response' },
    tasks: {
      type: 'array',
      description: 'List of tasks',
    },
    last_page: {
      type: 'boolean',
      description: 'Whether this is the last page of results',
    },
  },
}
