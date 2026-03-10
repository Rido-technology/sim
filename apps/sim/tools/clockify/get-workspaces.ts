import type { ToolConfig } from '@/tools/types'
import type { ClockifyGetWorkspacesParams, ClockifyGetWorkspacesResponse } from './types'

export const clockifyGetWorkspacesTool: ToolConfig<
  ClockifyGetWorkspacesParams,
  ClockifyGetWorkspacesResponse
> = {
  id: 'clockify_get_workspaces',
  name: 'Clockify Get Workspaces',
  description: 'Get list of all workspaces for the authenticated user',
  version: '1.0.0',

  params: {
    apiKey: {
      type: 'string',
      required: true,
      visibility: 'user-only',
      description: 'Clockify API key from Profile Settings',
    },
  },

  request: {
    url: '/api/tools/clockify/get-workspaces',
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
    workspaces: { type: 'array', description: 'List of workspaces' },
  },
}