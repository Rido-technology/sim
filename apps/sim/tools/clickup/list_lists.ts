import type {
  ClickUpListListsParams,
  ClickUpListListsResponse,
} from '@/tools/clickup/types'
import type { ToolConfig } from '@/tools/types'

export const clickupListListsTool: ToolConfig<
  ClickUpListListsParams,
  ClickUpListListsResponse
> = {
  id: 'clickup_list_lists',
  name: 'ClickUp List Lists',
  description: 'List all lists in a ClickUp space',
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
    spaceId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Space ID to list lists from',
    },
    archived: {
      type: 'boolean',
      required: false,
      visibility: 'user-or-llm',
      description: 'Include archived lists',
    },
  },

  request: {
    url: '/api/tools/clickup/list-lists',
    method: 'POST',
    headers: () => ({
      'Content-Type': 'application/json',
    }),
    body: (params) => ({
      accessToken: params.accessToken,
      spaceId: params.spaceId,
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
    lists: {
      type: 'array',
      description: 'List of lists in the space',
    },
  },
}
