import { createLogger } from '@sim/logger'
import type { ToolConfig } from '@/tools/types'
import type {
  InstagramReplyToCommentParams,
  InstagramReplyToCommentResponse,
} from '@/tools/instagram/types'

const logger = createLogger('InstagramReplyToCommentTool')

const GRAPH_VERSION = 'v22.0'
const GRAPH_BASE = 'https://graph.facebook.com'

export const instagramReplyToCommentTool: ToolConfig<
  InstagramReplyToCommentParams,
  InstagramReplyToCommentResponse
> = {
  id: 'instagram_reply_to_comment',
  name: 'Instagram Reply to Comment',
  description:
    'Reply to a comment on your Instagram media. Only works on comments on your Business/Creator account media. Requires instagram_manage_comments or instagram_basic. Cannot reply to hidden comments or to replies.',
  version: '1.0.0',

  params: {
    accessToken: {
      type: 'string',
      required: true,
      visibility: 'hidden',
      description: 'Meta Page Access Token with instagram_manage_comments or instagram_basic',
    },
    commentId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Instagram comment ID (numeric) to reply to',
    },
    message: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Reply text (max 300 characters)',
    },
  },

  request: {
    url: (params) => {
      const url = new URL(
        `${GRAPH_BASE}/${GRAPH_VERSION}/${encodeURIComponent(params.commentId)}/replies`
      )
      url.searchParams.set('message', params.message)
      return url.toString()
    },
    method: 'POST',
    headers: (params) => ({
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    }),
  },

  transformResponse: async (response: Response) => {
    const data = await response.json()

    if (!response.ok) {
      const message = data?.error?.message ?? `Request failed with status ${response.status}`
      logger.warn('Instagram reply to comment failed', { status: response.status, message })
      return {
        success: false,
        error: message,
        output: { commentId: '' },
      }
    }

    const commentId = data?.id ?? ''
    return {
      success: true,
      output: { commentId },
    }
  },

  outputs: {
    commentId: {
      type: 'string',
      description: 'ID of the created reply comment',
    },
  },
}
