import type {
  ClickUpUpdateTaskParams,
  ClickUpUpdateTaskResponse,
} from '@/tools/clickup/types'
import type { ToolConfig } from '@/tools/types'

export const clickupUpdateTaskTool: ToolConfig<
  ClickUpUpdateTaskParams,
  ClickUpUpdateTaskResponse
> = {
  id: 'clickup_update_task',
  name: 'ClickUp Update Task',
  description: 'Update an existing ClickUp task',
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
    taskId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Task ID to update',
    },
    name: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'New task name',
    },
    description: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'New task description (supports markdown)',
    },
    status: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'New task status',
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
    assignees: {
      type: 'object',
      required: false,
      visibility: 'user-or-llm',
      description: 'Object with add and rem arrays of user IDs',
    },
    archived: {
      type: 'boolean',
      required: false,
      visibility: 'user-or-llm',
      description: 'Archive or unarchive the task',
    },
  },

  request: {
    url: '/api/tools/clickup/update-task',
    method: 'POST',
    headers: () => ({
      'Content-Type': 'application/json',
    }),
    body: (params) => ({
      accessToken: params.accessToken,
      taskId: params.taskId,
      name: params.name,
      description: params.description,
      status: params.status,
      priority: params.priority,
      due_date: params.due_date,
      due_date_time: params.due_date_time,
      time_estimate: params.time_estimate,
      start_date: params.start_date,
      start_date_time: params.start_date_time,
      assignees: params.assignees,
      archived: params.archived,
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
      description: 'Updated task details',
    },
  },
}
