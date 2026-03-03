import type {
  ClickUpCreateTaskParams,
  ClickUpCreateTaskResponse,
} from '@/tools/clickup/types'
import type { ToolConfig } from '@/tools/types'

export const clickupCreateTaskTool: ToolConfig<
  ClickUpCreateTaskParams,
  ClickUpCreateTaskResponse
> = {
  id: 'clickup_create_task',
  name: 'ClickUp Create Task',
  description: 'Create a new task in a ClickUp list',
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
      description: 'List ID where the task will be created',
    },
    name: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Task name',
    },
    description: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Task description (supports markdown)',
    },
    assignees: {
      type: 'array',
      required: false,
      visibility: 'user-or-llm',
      description: 'Array of user IDs to assign to the task',
    },
    tags: {
      type: 'array',
      required: false,
      visibility: 'user-or-llm',
      description: 'Array of tag names',
    },
    status: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Task status',
    },
    priority: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'Priority: 1 (urgent), 2 (high), 3 (normal), 4 (low)',
    },
    due_date: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'Due date as Unix timestamp in milliseconds',
    },
    due_date_time: {
      type: 'boolean',
      required: false,
      visibility: 'user-or-llm',
      description: 'Include time in due date',
    },
    time_estimate: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'Time estimate in milliseconds',
    },
    start_date: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'Start date as Unix timestamp in milliseconds',
    },
    start_date_time: {
      type: 'boolean',
      required: false,
      visibility: 'user-or-llm',
      description: 'Include time in start date',
    },
    notify_all: {
      type: 'boolean',
      required: false,
      visibility: 'user-or-llm',
      description: 'Notify all assignees',
    },
    parent: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Parent task ID to create a subtask',
    },
    links_to: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Task ID to link to',
    },
    check_required_custom_fields: {
      type: 'boolean',
      required: false,
      visibility: 'user-or-llm',
      description: 'Check for required custom fields',
    },
    custom_fields: {
      type: 'array',
      required: false,
      visibility: 'user-or-llm',
      description: 'Array of custom field objects with id and value',
    },
  },

  request: {
    url: '/api/tools/clickup/create-task',
    method: 'POST',
    headers: () => ({
      'Content-Type': 'application/json',
    }),
    body: (params) => ({
      accessToken: params.accessToken,
      listId: params.listId,
      name: params.name,
      description: params.description,
      assignees: params.assignees,
      tags: params.tags,
      status: params.status,
      priority: params.priority,
      due_date: params.due_date,
      due_date_time: params.due_date_time,
      time_estimate: params.time_estimate,
      start_date: params.start_date,
      start_date_time: params.start_date_time,
      notify_all: params.notify_all,
      parent: params.parent,
      links_to: params.links_to,
      check_required_custom_fields: params.check_required_custom_fields,
      custom_fields: params.custom_fields,
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
    task: {
      type: 'object',
      description: 'Created task details',
    },
  },
}
