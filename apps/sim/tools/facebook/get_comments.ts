import type { ToolConfig } from '@/tools/types'
import type { FacebookGetCommentsParams, FacebookResponse } from './types'
import { getPageAccessToken } from './utils'

export const facebookGetCommentsTool: ToolConfig<FacebookGetCommentsParams, FacebookResponse> = {
  id: 'facebook_get_comments',
  name: 'Get Facebook Post Comments',
  description: 'Retrieve comments on a Facebook post',
  version: '1.0.0',

  oauth: {
    required: true,
    provider: 'facebook',
  },

  params: {
    accessToken: {
      type: 'string',
      required: true,
      visibility: 'hidden',
      description: 'Facebook User Access Token (will be exchanged for Page Access Token automatically)',
    },
    pageId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'The Facebook Page ID (needed to get the Page Access Token)',
    },
    postId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'The Facebook Post ID',
    },
  },

  // Placeholder request — overridden by directExecution
  request: {
    url: () => 'https://graph.facebook.com/v19.0/me',
    method: 'GET',
    headers: (params) => ({ Authorization: `Bearer ${params.accessToken}` }),
  },

  directExecution: async (params): Promise<FacebookResponse> => {
    try {
      const pageAccessToken = await getPageAccessToken(params.accessToken, params.pageId)

      const response = await fetch(
        `https://graph.facebook.com/v19.0/${params.postId}/comments?fields=id,message,created_time`,
        { headers: { Authorization: `Bearer ${pageAccessToken}` } }
      )

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          output: {},
          error: data?.error?.message || `Failed to get comments: ${response.statusText}`,
        }
      }

      return {
        success: true,
        output: { comments: data.data || [] },
      }
    } catch (error) {
      return {
        success: false,
        output: {},
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  },


  outputs: {
    comments: {
      type: 'array',
      description: 'List of comments on the post',
      items: {
        type: 'object',
        description: 'A single comment',
        properties: {
          id: { type: 'string', description: 'Comment ID' },
          message: { type: 'string', description: 'Comment content' },
          created_time: { type: 'string', description: 'Comment creation time' },
        },
      },
    },
  },
}
