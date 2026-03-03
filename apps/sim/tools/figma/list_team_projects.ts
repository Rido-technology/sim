import type {
  FigmaListTeamProjectsParams,
  FigmaListTeamProjectsResponse,
} from '@/tools/figma/types'
import type { ToolConfig } from '@/tools/types'

export const figmaListTeamProjectsTool: ToolConfig<
  FigmaListTeamProjectsParams,
  FigmaListTeamProjectsResponse
> = {
  id: 'figma_list_team_projects',
  name: 'Figma List Team Projects',
  description: 'List all projects in a Figma team using a personal access token.',
  version: '1.0.0',

  params: {
    accessToken: {
      type: 'string',
      required: true,
      visibility: 'hidden',
      description:
        'Figma personal access token with projects:read scope (sent as X-Figma-Token header).',
    },
    teamId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Figma team ID (from the team URL).',
    },
  },

  request: {
    url: (params: FigmaListTeamProjectsParams) =>
      `https://api.figma.com/v1/teams/${encodeURIComponent(params.teamId)}/projects`,
    method: 'GET',
    headers: (params: FigmaListTeamProjectsParams) => ({
      'Content-Type': 'application/json',
      'X-Figma-Token': params.accessToken,
    }),
  },

  transformResponse: async (
    response: Response,
    _params?: FigmaListTeamProjectsParams
  ): Promise<FigmaListTeamProjectsResponse> => {
    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        output: {
          projects: [],
          raw: data,
        },
        error: data?.message || `Figma API error: ${response.status} ${response.statusText}`,
      }
    }

    const projects =
      Array.isArray(data?.projects) && data.projects.length > 0
        ? data.projects.map((project: any) => ({
            id: String(project.id ?? project.key ?? ''),
            name: String(project.name ?? ''),
            description: typeof project.description === 'string' ? project.description : null,
            created_at: typeof project.created_at === 'string' ? project.created_at : undefined,
            updated_at: typeof project.updated_at === 'string' ? project.updated_at : undefined,
            archived: typeof project.archived === 'boolean' ? project.archived : undefined,
          }))
        : []

    return {
      success: true,
      output: {
        projects,
        raw: data,
      },
    }
  },

  outputs: {
    projects: {
      type: 'array',
      description: 'Projects in the specified Figma team.',
      items: {
        type: 'object',
        description: 'Figma project',
        properties: {
          id: { type: 'string', description: 'Project ID' },
          name: { type: 'string', description: 'Project name' },
          description: {
            type: 'string',
            description: 'Project description (if any)',
            optional: true,
          },
          created_at: {
            type: 'string',
            description: 'Project creation timestamp',
            optional: true,
          },
          updated_at: {
            type: 'string',
            description: 'Last update timestamp for the project',
            optional: true,
          },
          archived: {
            type: 'boolean',
            description: 'Whether the project is archived',
            optional: true,
          },
        },
      },
    },
    raw: {
      type: 'json',
      description: 'Raw response body from Figma for debugging.',
      optional: true,
    },
  },
}
