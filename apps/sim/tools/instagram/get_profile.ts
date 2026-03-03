import { createLogger } from '@sim/logger'
import type { ToolConfig } from '@/tools/types'
import type {
  InstagramGetProfileParams,
  InstagramGetProfileResponse,
  InstagramProfile,
} from '@/tools/instagram/types'

const logger = createLogger('InstagramGetProfileTool')

export const instagramGetProfileTool: ToolConfig<
  InstagramGetProfileParams,
  InstagramGetProfileResponse
> = {
  id: 'instagram_get_profile',
  name: 'Instagram Get Profile',
  description: 'Get Instagram Business or Creator account profile linked to your Facebook Page',
  version: '1.0.0',

  params: {
    accessToken: {
      type: 'string',
      required: true,
      visibility: 'hidden',
      description: 'Meta Page Access Token with instagram_basic permission',
    },
  },

  request: {
    url: () =>
      'https://graph.facebook.com/v22.0/me?fields=instagram_business_account{id,username,name,profile_picture_url,media_count,followers_count}',
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
      const code = data?.error?.code

      const permissionHint =
        code === 100 ||
        rawMessage.includes('pages_read_engagement') ||
        rawMessage.includes('missing permission')
          ? ' Use a Page Access Token (not a User token) and ensure your Meta app has the permissions: pages_show_list, pages_read_engagement, and instagram_basic. The Facebook Page must be linked to an Instagram Business or Creator account. See https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/get-started'
          : ''

      const message = rawMessage + permissionHint
      logger.warn('Instagram get profile failed', { status: response.status, message: rawMessage })
      return {
        success: false,
        error: message,
        output: { profile: {} as InstagramProfile },
      }
    }

    const account = data?.instagram_business_account
    if (!account) {
      return {
        success: false,
        error: 'No Instagram account linked to this Page. Link an Instagram Business/Creator account in Meta Business Suite.',
        output: { profile: {} as InstagramProfile },
      }
    }

    const profile: InstagramProfile = {
      id: account.id,
      username: account.username ?? '',
      name: account.name,
      profile_picture_url: account.profile_picture_url,
      media_count: account.media_count,
      followers_count: account.followers_count,
    }

    return {
      success: true,
      output: { profile },
    }
  },

  outputs: {
    profile: {
      type: 'object',
      description: 'Instagram account profile',
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
}
