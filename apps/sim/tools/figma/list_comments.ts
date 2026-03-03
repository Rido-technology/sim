import type {
  FigmaListFileCommentsParams,
  FigmaListFileCommentsResponse,
} from '@/tools/figma/types'
import type { ToolConfig } from '@/tools/types'

export const figmaListCommentsTool: ToolConfig<
  FigmaListFileCommentsParams,
  FigmaListFileCommentsResponse
> = {
  id: 'figma_list_comments',
  name: 'Figma List File Comments',
  description: 'List comments for a Figma file, optionally with pagination.',
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
      description: 'Figma file key to list comments for.',
    },
    cursor: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Cursor for pagination when there are many comment threads.',
    },
    as_number: {
      type: 'boolean',
      required: false,
      visibility: 'llm-only',
      description: 'If true, return only the number of threads in threadCount.',
    },
  },

  request: {
    url: (params: FigmaListFileCommentsParams) => {
      const search = new URLSearchParams()
      if (params.cursor) {
        search.set('cursor', params.cursor)
      }
      const qs = search.toString()
      const base = `https://api.figma.com/v1/files/${encodeURIComponent(params.fileKey)}/comments`
      return qs ? `${base}?${qs}` : base
    },
    method: 'GET',
    headers: (params: FigmaListFileCommentsParams) => ({
      'Content-Type': 'application/json',
      'X-Figma-Token': params.accessToken,
    }),
  },

  transformResponse: async (
    response: Response,
    params?: FigmaListFileCommentsParams
  ): Promise<FigmaListFileCommentsResponse> => {
    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        output: {
          comments: [],
          raw: data,
        },
        error: data?.message || `Figma API error: ${response.status} ${response.statusText}`,
      }
    }

    const comments = data?.comments ?? data
    const threadCount =
      params?.as_number && Array.isArray(comments) ? (comments as unknown[]).length : undefined

    return {
      success: true,
      output: {
        comments,
        threadCount,
        pagination: data?.pagination,
        raw: data,
      },
    }
  },

  outputs: {
    comments: {
      type: 'json',
      description: 'List of comment threads for the file.',
    },
    threadCount: {
      type: 'number',
      description: 'Number of comment threads when as_number is true.',
      optional: true,
    },
    pagination: {
      type: 'json',
      description: 'Pagination info for fetching additional comments.',
      optional: true,
    },
    raw: {
      type: 'json',
      description: 'Raw Figma response body for debugging.',
      optional: true,
    },
  },
}
