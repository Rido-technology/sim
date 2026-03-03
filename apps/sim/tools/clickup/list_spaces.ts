import type {
  ClickUpListSpacesParams,
  ClickUpListSpacesResponse,
} from '@/tools/clickup/types'
import type { ToolConfig } from '@/tools/types'

export const clickupListSpacesTool: ToolConfig<
  ClickUpListSpacesParams,
  ClickUpListSpacesResponse
> = {
  id: 'clickup_list_spaces',
  name: 'ClickUp List Spaces',
  description: 'List all spaces in a ClickUp workspace',
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
      required: true,
      visibility: 'user-or-llm',
      description: 'Team ID (workspace ID) to list spaces from',
    },
    archived: {
      type: 'boolean',
      required: false,
      visibility: 'user-or-llm',
      description: 'Include archived spaces',
    },
  },

  request: {
    url: '/api/tools/clickup/list-spaces',
    method: 'POST',
    headers: () => ({
      'Content-Type': 'application/json',
    }),
    body: (params) => ({
      accessToken: params.accessToken,
      teamId: params.teamId,
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
    spaces: {
      type: 'array',
      description: 'List of spaces in the workspace',
    },
  },
}
