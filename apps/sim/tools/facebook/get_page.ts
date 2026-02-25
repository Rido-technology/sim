import type { ToolConfig } from '@/tools/types'
import type { FacebookGetPageParams, FacebookResponse } from './types'

export const facebookGetPageTool: ToolConfig<FacebookGetPageParams, FacebookResponse> = {
  id: 'facebook_get_page',
  name: 'Get Facebook Page Info',
  description: 'Retrieve information about a Facebook Page',
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
      description: 'Facebook access token',
    },
    pageId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'The Facebook Page ID',
    },
  },

  request: {
    url: (params) =>
      `https://graph.facebook.com/v19.0/${params.pageId}?fields=id,name,followers_count,fan_count`,
    method: 'GET',
    headers: (params) => ({
      Authorization: `Bearer ${params.accessToken}`,
    }),
  },

  transformResponse: async (response): Promise<FacebookResponse> => {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        output: {},
        error: errorData?.error?.message || `Failed to get page: ${response.statusText}`,
      }
    }

    const data = await response.json()

    return {
      success: true,
      output: {
        id: data.id,
        name: data.name,
        followersCount: data.followers_count,
        fanCount: data.fan_count,
      },
    }
  },

  outputs: {
    id: { type: 'string', description: 'Page ID' },
    name: { type: 'string', description: 'Page name' },
    followersCount: { type: 'number', description: 'Number of followers' },
    fanCount: { type: 'number', description: 'Number of fans (likes)' },
  },
}
