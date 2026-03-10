import type { ToolConfig } from '@/tools/types'
import type { ClockifyCreateTaskParams, ClockifyCreateTaskResponse } from './types'

export const clockifyCreateTaskTool: ToolConfig<
  ClockifyCreateTaskParams,
  ClockifyCreateTaskResponse
> = {
  id: 'clockify_create_task',
  name: 'Clockify Create Task',
  description: 'Create a new task inside a Clockify project',
  version: '1.0.0',

  params: {
    apiKey: {
      type: 'string',
      required: true,
      visibility: 'user-only',
      description: 'Clockify API key from Profile Settings',
    },
    workspaceId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Clockify workspace ID',
    },
    projectId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Clockify project ID where the task will be created',
    },
    name: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Name of the task',
    },
    assigneeIds: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Comma-separated user IDs to assign to this task',
    },
    estimate: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Time estimate in ISO 8601 duration format (e.g. PT1H30M)',
    },
    status: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Task status: ACTIVE or DONE',
    },
  },

  request: {
    url: '/api/tools/clockify/create-task',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  transformResponse: async (response) => {
    const data = await response.json()
    if (data.error) throw new Error(data.error)
    return { success: true, output: data }
  },

  outputs: {
    id: { type: 'string', description: 'Task ID' },
    name: { type: 'string', description: 'Task name' },
    projectId: { type: 'string', description: 'Project ID' },
    status: { type: 'string', description: 'Task status (ACTIVE or DONE)' },
    estimate: { type: 'string', description: 'Time estimate (ISO 8601 duration)' },
    assigneeIds: { type: 'array', description: 'Assigned user IDs' },
  },
}
