import type { ToolConfig } from '@/tools/types'
import type { ClockifyStartTimerParams, ClockifyStartTimerResponse } from './types'

export const clockifyStartTimerTool: ToolConfig<
  ClockifyStartTimerParams,
  ClockifyStartTimerResponse
> = {
  id: 'clockify_start_timer',
  name: 'Clockify Start Timer',
  description: 'Start a running timer (time entry without an end time)',
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
    description: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Description of the task being timed',
    },
    projectId: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Project ID to associate with this timer',
    },
    taskId: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Task ID to associate with this timer',
    },
    tagIds: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Comma-separated tag IDs',
    },
  },

  request: {
    url: '/api/tools/clockify/start-timer',
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
    id: { type: 'string', description: 'Running timer entry ID' },
    description: { type: 'string', description: 'Timer description' },
    timeInterval: { type: 'json', description: 'Time interval (start only, end is null)' },
    projectId: { type: 'string', description: 'Associated project ID' },
    taskId: { type: 'string', description: 'Associated task ID' },
    workspaceId: { type: 'string', description: 'Workspace ID' },
  },
}
