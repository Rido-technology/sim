import { createLogger } from '@sim/logger'
import type { ToolConfig } from '@/tools/types'
import type {
  InstagramGetMediaParams,
  InstagramGetMediaResponse,
  InstagramMediaItem,
} from '@/tools/instagram/types'

const logger = createLogger('InstagramGetMediaTool')

export const instagramGetMediaTool: ToolConfig<
  InstagramGetMediaParams,
  InstagramGetMediaResponse
> = {
  id: 'instagram_get_media',
  name: 'Instagram Get Media',
  description: 'List recent media (posts, stories) from your Instagram Business or Creator account',
  version: '1.0.0',

  params: {
    accessToken: {
      type: 'string',
      required: true,
      visibility: 'hidden',
      description: 'Meta Page Access Token with instagram_basic permission',
    },
    limit: {
      type: 'number',
      required: false,
      visibility: 'user-only',
      description: 'Max number of media items to return (default 25, max 50)',
    },
  },

  request: {
    url: (params) => {
      const limit = Math.min(Math.max(Number(params.limit) || 25, 1), 50)
      return `https://graph.facebook.com/v22.0/me?fields=instagram_business_account{media.limit(${limit}){id,caption,media_type,media_url,permalink,timestamp}}`
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
      const message = data?.error?.message ?? `Request failed with status ${response.status}`
      logger.warn('Instagram get media failed', { status: response.status, message })
      return {
        success: false,
        error: message,
        output: { media: [] as InstagramMediaItem[] },
      }
    }

    const account = data?.instagram_business_account
    const mediaData = account?.media?.data ?? []
    const media: InstagramMediaItem[] = mediaData.map((item: Record<string, unknown>) => ({
      id: item.id as string,
      caption: item.caption as string | undefined,
      media_type: (item.media_type as string) ?? 'UNKNOWN',
      media_url: item.media_url as string | undefined,
      permalink: item.permalink as string | undefined,
      timestamp: item.timestamp as string | undefined,
    }))

    return {
      success: true,
      output: {
        media,
        paging: account?.media?.paging,
      },
    }
  },

  outputs: {
    media: {
      type: 'array',
      description: 'List of media items',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Media ID' },
          caption: { type: 'string', description: 'Caption', optional: true },
          media_type: { type: 'string', description: 'IMAGE, VIDEO, or CAROUSEL_ALBUM' },
          media_url: { type: 'string', description: 'Media URL', optional: true },
          permalink: { type: 'string', description: 'Permalink to post', optional: true },
          timestamp: { type: 'string', description: 'ISO timestamp', optional: true },
        },
      },
    },
  },
}
