import { createLogger } from '@sim/logger'
import type { ToolConfig } from '@/tools/types'
import type {
  InstagramGetPageParams,
  InstagramGetPageResponse,
  InstagramPageInfo,
  InstagramProfile,
} from '@/tools/instagram/types'

const logger = createLogger('InstagramGetPageTool')

const GRAPH_VERSION = 'v22.0'

export const instagramGetPageTool: ToolConfig<
  InstagramGetPageParams,
  InstagramGetPageResponse
> = {
  id: 'instagram_get_page',
  name: 'Instagram Get Page',
  description:
    'Get a Facebook Page and its linked Instagram Business/Creator account by Page ID. Omit page ID to get the current page (same as Get Profile context).',
  version: '1.0.0',

  params: {
    accessToken: {
      type: 'string',
      required: true,
      visibility: 'hidden',
      description: 'Meta Page Access Token with instagram_basic permission',
    },
    pageId: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description:
        'Facebook Page ID. Leave empty to use the page associated with the token (me).',
    },
  },

  request: {
    url: (params) => {
      const node = params.pageId?.trim() || 'me'
      const fields =
        'id,name,instagram_business_account{id,username,name,profile_picture_url,media_count,followers_count}'
      return `https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(node)}?fields=${fields}`
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
      const rawMessage =
        data?.error?.message ?? `Request failed with status ${response.status}`
      logger.warn('Instagram get page failed', { status: response.status, message: rawMessage })
      return {
        success: false,
        error: rawMessage,
        output: { page: {} as InstagramPageInfo },
      }
    }

    const account = data?.instagram_business_account
    const profile: InstagramProfile | undefined = account
      ? {
          id: account.id,
          username: account.username ?? '',
          name: account.name,
          profile_picture_url: account.profile_picture_url,
          media_count: account.media_count,
          followers_count: account.followers_count,
        }
      : undefined

    const page: InstagramPageInfo = {
      id: data.id,
      name: data.name,
      ...(profile && { instagram_business_account: profile }),
    }

    return {
      success: true,
      output: { page },
    }
  },

  outputs: {
    page: {
      type: 'object',
      description: 'Facebook Page with linked Instagram account',
      properties: {
        id: { type: 'string', description: 'Page ID' },
        name: { type: 'string', description: 'Page name', optional: true },
        instagram_business_account: {
          type: 'object',
          description: 'Linked Instagram Business/Creator account',
          optional: true,
          properties: {
            id: { type: 'string', description: 'Instagram user ID' },
            username: { type: 'string', description: 'Username' },
            name: { type: 'string', description: 'Display name', optional: true },
            profile_picture_url: { type: 'string', description: 'Profile picture URL', optional: true },
            media_count: { type: 'number', description: 'Number of media items', optional: true },
            followers_count: { type: 'number', description: 'Follower count', optional: true },
          },
        },
      },
    },
  },
}
