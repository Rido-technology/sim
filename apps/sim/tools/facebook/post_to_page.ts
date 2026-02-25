import type { ToolConfig } from '@/tools/types'
import type { FacebookPostToPageParams, FacebookResponse } from './types'
import { getPageAccessToken } from './utils'

export const facebookPostToPageTool: ToolConfig<FacebookPostToPageParams, FacebookResponse> = {
  id: 'facebook_post_to_page',
  name: 'Post to Facebook Page',
  description: 'Publish a post to a Facebook Page feed',
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
      description: 'The Facebook Page ID to post to',
    },
    message: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'The text content of the post',
    },
    link: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Optional URL to attach to the post',
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
      // Exchange User Token → Page Token
      const pageAccessToken = await getPageAccessToken(params.accessToken, params.pageId)

      const body: Record<string, string> = { message: params.message }
      if (params.link) body.link = params.link

      const response = await fetch(`https://graph.facebook.com/v19.0/${params.pageId}/feed`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${pageAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          output: {},
          error: data?.error?.message || `Failed to post: ${response.statusText}`,
        }
      }

      return {
        success: true,
        output: { id: data.id },
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
    id: { type: 'string', description: 'ID of the created post' },
  },
}
