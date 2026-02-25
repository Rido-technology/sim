import type { ToolConfig } from '@/tools/types'
import type { FacebookGetMyPagesParams, FacebookResponse } from './types'

export const facebookGetMyPagesTool: ToolConfig<FacebookGetMyPagesParams, FacebookResponse> = {
  id: 'facebook_get_my_pages',
  name: 'Get My Facebook Pages',
  description: 'Retrieve all Facebook Pages managed by the authenticated user',
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
      description: 'Facebook User Access Token',
    },
  },

  // Placeholder request — overridden by directExecution
  request: {
    url: () => 'https://graph.facebook.com/v19.0/me/accounts',
    method: 'GET',
    headers: (params) => ({ Authorization: `Bearer ${params.accessToken}` }),
  },

  directExecution: async (params): Promise<FacebookResponse> => {
    try {
      const response = await fetch(
        'https://graph.facebook.com/v19.0/me/accounts?fields=id,name,category,followers_count,fan_count',
        { headers: { Authorization: `Bearer ${params.accessToken}` } }
      )

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          output: {},
          error: data?.error?.message || `Failed to get pages: ${response.statusText}`,
        }
      }

      const pages = (data.data || []).map(
        (page: { id: string; name: string; category?: string; followers_count?: number; fan_count?: number }) => ({
          id: page.id,
          name: page.name,
          category: page.category,
          followersCount: page.followers_count,
          fanCount: page.fan_count,
        })
      )

      return {
        success: true,
        output: {
          pages,
          success: true,
        },
      }
    } catch (error: unknown) {
      return {
        success: false,
        output: {},
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  },
}
