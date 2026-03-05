import type {
  GetImageMetadataParams,
  GetImageMetadataResponse,
} from '@/tools/image_helper/types'
import type { ToolConfig } from '@/tools/types'

export const getImageMetadataTool: ToolConfig<
  GetImageMetadataParams,
  GetImageMetadataResponse
> = {
  id: 'get_image_metadata',
  name: 'Get Image Metadata',
  description:
    'Returns metadata for an image (dimensions, format, size). Input can be an image URL or a data URL from a previous step.',
  version: '1.0.0',

  params: {
    image: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description:
        'Image URL or data URL. Can be a URL or a file reference from a previous step.',
    },
  },

  request: {
    url: '/api/tools/image_helper/get_image_metadata',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => ({
      image: params.image,
    }),
  },

  outputs: {
    width: {
      type: 'number',
      description: 'Image width in pixels.',
    },
    height: {
      type: 'number',
      description: 'Image height in pixels.',
    },
    mimeType: {
      type: 'string',
      description: 'Detected or resolved MIME type.',
    },
    sizeBytes: {
      type: 'number',
      description: 'Size of the image data in bytes.',
    },
  },
}
