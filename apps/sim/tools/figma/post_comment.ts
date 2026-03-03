import type { FigmaPostCommentParams, FigmaPostCommentResponse } from '@/tools/figma/types'
import type { ToolConfig } from '@/tools/types'

export const figmaPostCommentTool: ToolConfig<FigmaPostCommentParams, FigmaPostCommentResponse> = {
  id: 'figma_post_comment',
  name: 'Figma Post Comment',
  description: 'Post a comment to a Figma file using a personal access token.',
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
      description: 'Figma file key to post the comment on.',
    },
    message: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Comment text.',
    },
    client_meta: {
      type: 'json',
      required: false,
      visibility: 'user-or-llm',
      description: 'Optional client_meta payload to attach position or node references.',
    },
  },

  request: {
    url: (params: FigmaPostCommentParams) =>
      `https://api.figma.com/v1/files/${encodeURIComponent(params.fileKey)}/comments`,
    method: 'POST',
    headers: (params: FigmaPostCommentParams) => ({
      'Content-Type': 'application/json',
      'X-Figma-Token': params.accessToken,
    }),
    body: (params: FigmaPostCommentParams) => {
      const body: Record<string, unknown> = {
        message: params.message,
      }
      if (params.client_meta !== undefined) {
        body.client_meta = params.client_meta
      }
      return body
    },
  },

  transformResponse: async (response: Response): Promise<FigmaPostCommentResponse> => {
    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        output: {
          comment: null,
          raw: data,
        },
        error: data?.message || `Figma API error: ${response.status} ${response.statusText}`,
      }
    }

    return {
      success: true,
      output: {
        comment: data,
        raw: data,
      },
    }
  },

  outputs: {
    comment: {
      type: 'json',
      description: 'Created comment object returned by Figma.',
    },
    raw: {
      type: 'json',
      description: 'Raw Figma response body for debugging.',
      optional: true,
    },
  },
}
