import type { FigmaGetFileParams, FigmaGetFileResponse } from '@/tools/figma/types'
import type { ToolConfig } from '@/tools/types'

export const figmaGetFileTool: ToolConfig<FigmaGetFileParams, FigmaGetFileResponse> = {
  id: 'figma_get_file',
  name: 'Figma Get File',
  description: 'Fetch a Figma file JSON by file key using a personal access token.',
  version: '1.0.0',

  params: {
    accessToken: {
      type: 'string',
      required: true,
      visibility: 'hidden',
      description: 'Figma personal access token (used as X-Figma-Token).',
    },
    fileKey: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Figma file key from the URL.',
    },
  },

  request: {
    url: (params: FigmaGetFileParams) =>
      `https://api.figma.com/v1/files/${encodeURIComponent(params.fileKey)}`,
    method: 'GET',
    headers: (params: FigmaGetFileParams) => ({
      'Content-Type': 'application/json',
      'X-Figma-Token': params.accessToken,
    }),
  },

  transformResponse: async (response: Response): Promise<FigmaGetFileResponse> => {
    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        output: {
          file: null,
        },
        error: data?.message || `Figma API error: ${response.status} ${response.statusText}`,
      }
    }

    return {
      success: true,
      output: {
        file: data,
      },
    }
  },

  outputs: {
    file: {
      type: 'json',
      description: 'Raw Figma file JSON including document, components, and styles.',
    },
  },
}
