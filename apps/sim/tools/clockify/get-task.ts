import type { ToolConfig } from '@/tools/types'
import type { ClockifyGetTaskParams, ClockifyGetTaskResponse } from './types'

export const clockifyGetTaskTool: ToolConfig<ClockifyGetTaskParams, ClockifyGetTaskResponse> = {
  id: 'clockify_get_task',
  name: 'Clockify Find Task',
  description: 'Find a specific task by ID, or list all tasks in a project',
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
      description: 'Project ID to look for tasks in',
    },
    taskId: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Task ID to retrieve (leave empty to list all tasks)',
    },
    name: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Filter tasks by name (partial match)',
    },
    page: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'Page number for pagination (default: 1)',
    },
    pageSize: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'Number of results per page (default: 50, max: 200)',
    },
  },

  request: {
    url: '/api/tools/clockify/get-task',
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
    id: { type: 'string', description: 'Task ID (single task mode)' },
    name: { type: 'string', description: 'Task name (single task mode)' },
    projectId: { type: 'string', description: 'Project ID' },
    status: { type: 'string', description: 'Task status' },
    tasks: { type: 'json', description: 'Array of tasks (list mode)' },
  },
}
