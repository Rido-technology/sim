import type {
  FigmaListProjectFilesParams,
  FigmaListProjectFilesResponse,
} from '@/tools/figma/types'
import type { ToolConfig } from '@/tools/types'

export const figmaListProjectFilesTool: ToolConfig<
  FigmaListProjectFilesParams,
  FigmaListProjectFilesResponse
> = {
  id: 'figma_list_project_files',
  name: 'Figma List Project Files',
  description: 'List files in a Figma project using a personal access token.',
  version: '1.0.0',

  params: {
    accessToken: {
      type: 'string',
      required: true,
      visibility: 'hidden',
      description: 'Figma personal access token (used as X-Figma-Token).',
    },
    projectId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Figma project ID.',
    },
  },

  request: {
    url: (params: FigmaListProjectFilesParams) =>
      `https://api.figma.com/v1/projects/${encodeURIComponent(params.projectId)}/files`,
    method: 'GET',
    headers: (params: FigmaListProjectFilesParams) => ({
      'Content-Type': 'application/json',
      'X-Figma-Token': params.accessToken,
    }),
  },

  transformResponse: async (response: Response): Promise<FigmaListProjectFilesResponse> => {
    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        output: {
          files: [],
          raw: data,
        },
        error: data?.message || `Figma API error: ${response.status} ${response.statusText}`,
      }
    }

    return {
      success: true,
      output: {
        files: data?.files ?? data,
        raw: data,
      },
    }
  },

  outputs: {
    files: {
      type: 'json',
      description: 'Files in the specified Figma project.',
    },
    raw: {
      type: 'json',
      description: 'Raw Figma response body for debugging.',
      optional: true,
    },
  },
}
