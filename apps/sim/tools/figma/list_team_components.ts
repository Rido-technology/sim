import type {
  FigmaListTeamComponentsParams,
  FigmaListTeamComponentsResponse,
} from '@/tools/figma/types'
import type { ToolConfig } from '@/tools/types'

export const figmaListTeamComponentsTool: ToolConfig<
  FigmaListTeamComponentsParams,
  FigmaListTeamComponentsResponse
> = {
  id: 'figma_list_team_components',
  name: 'Figma List Team Components',
  description: 'List components in a Figma team using a personal access token.',
  version: '1.0.0',

  params: {
    accessToken: {
      type: 'string',
      required: true,
      visibility: 'hidden',
      description: 'Figma personal access token (used as X-Figma-Token).',
    },
    teamId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Figma team ID.',
    },
    cursor: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Cursor for paginating through components.',
    },
  },

  request: {
    url: (params: FigmaListTeamComponentsParams) => {
      const search = new URLSearchParams()
      if (params.cursor) {
        search.set('cursor', params.cursor)
      }
      const qs = search.toString()
      const base = `https://api.figma.com/v1/teams/${encodeURIComponent(params.teamId)}/components`
      return qs ? `${base}?${qs}` : base
    },
    method: 'GET',
    headers: (params: FigmaListTeamComponentsParams) => ({
      'Content-Type': 'application/json',
      'X-Figma-Token': params.accessToken,
    }),
  },

  transformResponse: async (response: Response): Promise<FigmaListTeamComponentsResponse> => {
    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        output: {
          components: [],
          raw: data,
        },
        error: data?.message || `Figma API error: ${response.status} ${response.statusText}`,
      }
    }

    return {
      success: true,
      output: {
        components: data?.meta ?? data,
        pagination: data?.pagination,
        raw: data,
      },
    }
  },

  outputs: {
    components: {
      type: 'json',
      description: 'Components in the specified Figma team.',
    },
    pagination: {
      type: 'json',
      description: 'Pagination info for fetching additional components.',
      optional: true,
    },
    raw: {
      type: 'json',
      description: 'Raw Figma response body for debugging.',
      optional: true,
    },
  },
}
