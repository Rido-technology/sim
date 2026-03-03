import { createLogger } from '@sim/logger'
import type { ToolConfig } from '@/tools/types'
import type {
  InstagramCreateCommentParams,
  InstagramCreateCommentResponse,
} from '@/tools/instagram/types'

const logger = createLogger('InstagramCreateCommentTool')

const GRAPH_VERSION = 'v22.0'
const GRAPH_BASE = 'https://graph.facebook.com'

export const instagramCreateCommentTool: ToolConfig<
  InstagramCreateCommentParams,
  InstagramCreateCommentResponse
> = {
  id: 'instagram_create_comment',
  name: 'Instagram Create Comment',
  description:
    'Create a comment on your Instagram media (post). Only works on media owned by your Business/Creator account. Requires instagram_manage_comments or instagram_basic. Comment max 300 characters.',
  version: '1.0.0',

  params: {
    accessToken: {
      type: 'string',
      required: true,
      visibility: 'hidden',
      description: 'Meta Page Access Token with instagram_manage_comments or instagram_basic',
    },
    mediaId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Instagram media ID (numeric) of the post to comment on',
    },
    message: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Comment text (max 300 characters, max 4 hashtags, max 1 URL)',
    },
  },

  request: {
    url: (params) => {
      const url = new URL(
        `${GRAPH_BASE}/${GRAPH_VERSION}/${encodeURIComponent(params.mediaId)}/comments`
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
      logger.warn('Instagram create comment failed', { status: response.status, message })
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
      description: 'ID of the created comment',
    },
  },
}
