import { createLogger } from '@sim/logger'
import type { ToolConfig } from '@/tools/types'
import type {
  InstagramGetMediaByIdParams,
  InstagramGetMediaByIdResponse,
  InstagramMediaItem,
} from '@/tools/instagram/types'

const logger = createLogger('InstagramGetMediaByIdTool')

const GRAPH_VERSION = 'v22.0'

export const instagramGetMediaByIdTool: ToolConfig<
  InstagramGetMediaByIdParams,
  InstagramGetMediaByIdResponse
> = {
  id: 'instagram_get_media_by_id',
  name: 'Instagram Get Media by ID',
  description:
    'Get a single Instagram media (post, reel, story) by its numeric media ID. Use Get Media to list media and obtain IDs.',
  version: '1.0.0',

  params: {
    accessToken: {
      type: 'string',
      required: true,
      visibility: 'hidden',
      description: 'Meta Page Access Token with instagram_basic permission',
    },
    mediaId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Instagram media ID (numeric, from Get Media or API). Not the shortcode from the URL.',
    },
  },

  request: {
    url: (params) => {
      const fields = 'id,caption,media_type,media_url,permalink,timestamp'
      return `https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(params.mediaId)}?fields=${fields}`
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
      logger.warn('Instagram get media by id failed', { status: response.status, message })
      return {
        success: false,
        error: message,
        output: { media: {} as InstagramMediaItem },
      }
    }

    const media: InstagramMediaItem = {
      id: data.id,
      caption: data.caption,
      media_type: data.media_type ?? 'UNKNOWN',
      media_url: data.media_url,
      permalink: data.permalink,
      timestamp: data.timestamp,
    }

    return {
      success: true,
      output: { media },
    }
  },

  outputs: {
    media: {
      type: 'object',
      description: 'The requested media item',
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
}
