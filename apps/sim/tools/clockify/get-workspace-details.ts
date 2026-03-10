import type { ToolConfig } from '@/tools/types'
import type { ClockifyGetWorkspaceDetailsParams, ClockifyGetWorkspaceDetailsResponse } from './types'

export const clockifyGetWorkspaceDetailsTool: ToolConfig<
  ClockifyGetWorkspaceDetailsParams,
  ClockifyGetWorkspaceDetailsResponse
> = {
  id: 'clockify_get_workspace_details',
  name: 'Clockify Get Workspace Details',
  description: 'Get detailed information about a specific workspace',
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
      description: 'Workspace ID to get details for',
    },
  },

  request: {
    url: '/api/tools/clockify/get-workspace-details',
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
    id: { type: 'string', description: 'Workspace ID' },
    name: { type: 'string', description: 'Workspace name' },
    hourlyRate: { type: 'json', description: 'Workspace hourly rate' },
    memberships: { type: 'array', description: 'Workspace memberships' },
    workspaceSettings: { type: 'json', description: 'Workspace settings' },
    imageUrl: { type: 'string', description: 'Workspace image URL' },
    featureSubscriptionType: { type: 'string', description: 'Feature subscription type' },
  },
}