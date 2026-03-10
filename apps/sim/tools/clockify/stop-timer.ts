import type { ToolConfig } from '@/tools/types'
import type { ClockifyStopTimerParams, ClockifyStopTimerResponse } from './types'

export const clockifyStopTimerTool: ToolConfig<
  ClockifyStopTimerParams,
  ClockifyStopTimerResponse
> = {
  id: 'clockify_stop_timer',
  name: 'Clockify Stop Timer',
  description: 'Stop the currently running timer for a user',
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
      required: false,
      visibility: 'user-or-llm',
      description: 'Clockify workspace ID (auto-resolved from API key if left empty)',
    },
    userId: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'User ID whose timer to stop (auto-resolved from API key if left empty)',
    },
    end: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'End time in ISO 8601 format (defaults to current time if left empty)',
    },
  },

  request: {
    url: '/api/tools/clockify/stop-timer',
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
    id: { type: 'string', description: 'Stopped time entry ID' },
    description: { type: 'string', description: 'Time entry description' },
    timeInterval: { type: 'json', description: 'Time interval with start, end, and duration' },
    projectId: { type: 'string', description: 'Associated project ID' },
    taskId: { type: 'string', description: 'Associated task ID' },
    workspaceId: { type: 'string', description: 'Workspace ID' },
  },
}
