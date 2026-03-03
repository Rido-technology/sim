import { createLogger } from '@sim/logger'
import type { ToolConfig } from '@/tools/types'
import type {
  InstagramCommentItem,
  InstagramGetCommentsParams,
  InstagramGetCommentsResponse,
} from '@/tools/instagram/types'

const logger = createLogger('InstagramGetCommentsTool')

const GRAPH_VERSION = 'v22.0'
const GRAPH_BASE = 'https://graph.facebook.com'

export const instagramGetCommentsTool: ToolConfig<
  InstagramGetCommentsParams,
  InstagramGetCommentsResponse
> = {
  id: 'instagram_get_comments',
  name: 'Instagram Get Comments',
  description:
    'List comments on an Instagram post (media). Returns top-level comments; use Get Media by ID for post details. Requires instagram_basic or instagram_manage_comments.',
  version: '1.0.0',

  params: {
    accessToken: {
      type: 'string',
      required: true,
      visibility: 'hidden',
      description: 'Meta Page Access Token with instagram_basic or instagram_manage_comments',
    },
    mediaId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Instagram media ID (numeric) of the post to get comments for',
    },
    limit: {
      type: 'number',
      required: false,
      visibility: 'user-only',
      description: 'Max number of comments to return (default 25, max 50)',
    },
  },

  request: {
    url: (params) => {
      const limit = Math.min(Math.max(Number(params.limit) || 25, 1), 50)
      const fields = 'id,text,timestamp,username,from'
      const url = new URL(
        `${GRAPH_BASE}/${GRAPH_VERSION}/${encodeURIComponent(params.mediaId)}/comments`
      )
      url.searchParams.set('fields', fields)
      url.searchParams.set('limit', String(limit))
      return url.toString()
    },
    method: 'GET',
    headers: (params) => ({
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    }),
  },

  transformResponse: async (response: Response) => {
    const data = await response.json()

    if (!response.ok) {
      const message = data?.error?.message ?? `Request failed with status ${response.status}`
      logger.warn('Instagram get comments failed', { status: response.status, message })
      return {
        success: false,
        error: message,
        output: { comments: [] as InstagramCommentItem[] },
      }
    }

    const dataList = data?.data ?? []
    const comments: InstagramCommentItem[] = dataList.map((item: Record<string, unknown>) => ({
      id: item.id as string,
      text: item.text as string | undefined,
      timestamp: item.timestamp as string | undefined,
      username: item.username as string | undefined,
      from: item.from as { id: string; username?: string } | undefined,
    }))

    return {
      success: true,
      output: {
        comments,
        paging: data?.paging,
      },
    }
  },

  outputs: {
    comments: {
      type: 'array',
      description: 'List of comments on the post',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Comment ID' },
          text: { type: 'string', description: 'Comment text', optional: true },
          timestamp: { type: 'string', description: 'ISO timestamp', optional: true },
          username: { type: 'string', description: 'Commenter username', optional: true },
          from: {
            type: 'object',
            description: 'Commenter (id, username)',
            optional: true,
            properties: { id: { type: 'string' }, username: { type: 'string', optional: true } },
          },
        },
      },
    },
  },
}
