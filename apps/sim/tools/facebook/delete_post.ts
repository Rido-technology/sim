import type { ToolConfig } from '@/tools/types'
import type { FacebookDeletePostParams, FacebookResponse } from './types'
import { getPageAccessToken } from './utils'

export const facebookDeletePostTool: ToolConfig<FacebookDeletePostParams, FacebookResponse> = {
  id: 'facebook_delete_post',
  name: 'Delete Facebook Post',
  description: 'Delete a post from a Facebook Page',
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
      description: 'The Facebook Post ID to delete',
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

      const response = await fetch(`https://graph.facebook.com/v19.0/${params.postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${pageAccessToken}` },
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          output: {},
          error: data?.error?.message || `Failed to delete post: ${response.statusText}`,
        }
      }

      return {
        success: true,
        output: { deleted: data.success === true },
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
    deleted: { type: 'boolean', description: 'Whether the post was successfully deleted' },
  },
}
