import type { ToolConfig } from '@/tools/types'
import type {
  InstagramCreatePostParams,
  InstagramCreatePostResponse,
} from '@/tools/instagram/types'

export const instagramCreatePostTool: ToolConfig<
  InstagramCreatePostParams,
  InstagramCreatePostResponse
> = {
  id: 'instagram_create_post',
  name: 'Instagram Create Post',
  description:
    'Publish a single image post to Instagram. Image must be hosted on a public URL (JPEG, 320–1440px width, 4:5 to 1.91:1 aspect ratio). Requires instagram_content_publish (or instagram_business_content_publish) permission.',
  version: '1.0.0',

  params: {
    accessToken: {
      type: 'string',
      required: true,
      visibility: 'hidden',
      description: 'Meta Page Access Token with instagram_content_publish permission',
    },
    imageUrl: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Public URL of the image to post (JPEG, max 8MB)',
    },
    caption: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Caption for the post',
    },
    altText: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Alternative text for accessibility',
    },
  },

  request: {
    url: () => '/api/tools/instagram/create-post',
    method: 'POST',
    headers: (params) => ({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
    body: (params) => ({
      accessToken: params.accessToken,
      imageUrl: params.imageUrl,
      caption: params.caption,
      altText: params.altText,
    }),
  },

  transformResponse: async (response: Response) => {
    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data?.error ?? `Request failed with status ${response.status}`,
        output: { mediaId: '', permalink: undefined },
      }
    }

    return {
      success: data.success ?? true,
      error: data.error,
      output: {
        mediaId: data.mediaId ?? '',
        permalink: data.permalink,
      },
    }
  },

  outputs: {
    mediaId: {
      type: 'string',
      description: 'Published Instagram media ID',
    },
    permalink: {
      type: 'string',
      description: 'Permalink URL to the post',
      optional: true,
    },
  },
}
