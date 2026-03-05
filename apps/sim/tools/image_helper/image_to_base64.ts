import type { ImageToBase64Params, ImageToBase64Response } from '@/tools/image_helper/types'
import type { ToolConfig } from '@/tools/types'

export const imageToBase64Tool: ToolConfig<
  ImageToBase64Params,
  ImageToBase64Response
> = {
  id: 'image_to_base64',
  name: 'Image to Base64',
  description:
    'Converts an image to a URL-like Base64 string (data URL). Input can be an image URL or a data URL from a previous step.',
  version: '1.0.0',

  params: {
    image: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description:
        'Image URL or data URL. Can be a URL or a file reference (e.g. data URL) from a previous step.',
    },
    overrideMimeType: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Optional MIME type for the output (e.g. image/png, image/jpeg).',
    },
  },

  request: {
    url: '/api/tools/image_helper/image_to_base64',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => ({
      image: params.image,
      overrideMimeType: params.overrideMimeType,
    }),
  },

  outputs: {
    dataUrl: {
      type: 'string',
      description: 'Base64 data URL of the image.',
    },
    mimeType: {
      type: 'string',
      description: 'Resolved MIME type of the output image.',
    },
  },
}
