import type { ToolConfig } from '@/tools/types'
import type { FacebookGetPostsParams, FacebookResponse } from './types'
import { getPageAccessToken } from './utils'

export const facebookGetPostsTool: ToolConfig<FacebookGetPostsParams, FacebookResponse> = {
  id: 'facebook_get_posts',
  name: 'Get Facebook Page Posts',
  description: 'Retrieve recent posts from a Facebook Page',
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
      description: 'The Facebook Page ID',
    },
    limit: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'Number of posts to retrieve (default: 10)',
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
      const limit = params.limit || 10

      const response = await fetch(
        `https://graph.facebook.com/v19.0/${params.pageId}/posts?fields=id,message,created_time&limit=${limit}`,
        { headers: { Authorization: `Bearer ${pageAccessToken}` } }
      )

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          output: {},
          error: data?.error?.message || `Failed to get posts: ${response.statusText}`,
        }
      }

      return {
        success: true,
        output: { posts: data.data || [] },
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
    posts: {
      type: 'array',
      description: 'List of posts from the page',
      items: {
        type: 'object',
        description: 'A single Facebook post',
        properties: {
          id: { type: 'string', description: 'Post ID' },
          message: { type: 'string', description: 'Post content' },
          created_time: { type: 'string', description: 'Post creation time' },
        },
      },
    },
  },
}
