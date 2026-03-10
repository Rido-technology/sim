import type { ToolConfig } from '@/tools/types'
import type { ClockifyGetCurrentTimerParams, ClockifyGetCurrentTimerResponse } from './types'

export const clockifyGetCurrentTimerTool: ToolConfig<
  ClockifyGetCurrentTimerParams,
  ClockifyGetCurrentTimerResponse
> = {
  id: 'clockify_get_current_timer',
  name: 'Clockify Get Current Timer',
  description: 'Find the currently running timer for a user',
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
      description: 'Clockify workspace ID (auto-resolved if empty)',
    },
    userId: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'User ID to check timer for (auto-resolved if empty)',
    },
  },

  request: {
    url: '/api/tools/clockify/get-current-timer',
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
    id: { type: 'string', description: 'Running timer ID (null if none)' },
    description: { type: 'string', description: 'Timer description' },
    timeInterval: { type: 'json', description: 'Time interval (start, null end)' },
    projectId: { type: 'string', description: 'Associated project ID' },
    taskId: { type: 'string', description: 'Associated task ID' },
    isRunning: { type: 'boolean', description: 'Whether a timer is currently running' },
  },
}
