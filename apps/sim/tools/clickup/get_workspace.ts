import type {
  ClickUpGetWorkspaceParams,
  ClickUpGetWorkspaceResponse,
} from '@/tools/clickup/types'
import type { ToolConfig } from '@/tools/types'

export const clickupGetWorkspaceTool: ToolConfig<
  ClickUpGetWorkspaceParams,
  ClickUpGetWorkspaceResponse
> = {
  id: 'clickup_get_workspace',
  name: 'ClickUp Get Workspace',
  description: 'Get authorized workspaces (teams) for the authenticated user',
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
    teamId: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Optional team ID to get specific workspace',
    },
  },

  request: {
    url: '/api/tools/clickup/get-workspace',
    method: 'POST',
    headers: () => ({
      'Content-Type': 'application/json',
    }),
    body: (params) => ({
      accessToken: params.accessToken,
      teamId: params.teamId,
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
    teams: {
      type: 'array',
      description: 'List of authorized workspaces/teams',
    },
  },
}
