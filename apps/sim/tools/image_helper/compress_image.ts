import type {
  CompressImageParams,
  CompressImageResponse,
} from '@/tools/image_helper/types'
import type { ToolConfig } from '@/tools/types'

export const compressImageTool: ToolConfig<
  CompressImageParams,
  CompressImageResponse
> = {
  id: 'compress_image',
  name: 'Compress an Image',
  description:
    'Compresses an image with chosen quality and format (PNG or JPG). Input can be an image URL or a data URL from a previous step.',
  version: '1.0.0',

  params: {
    image: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description:
        'Image URL or data URL. Can be a URL or a file reference from a previous step.',
    },
    quality: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Quality preset: "high" (high quality) or "lossy" (smaller file).',
    },
    format: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Output format: "png" or "jpg".',
    },
    resultFileName: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Optional file name for the result.',
    },
  },

  request: {
    url: '/api/tools/image_helper/compress_image',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => ({
      image: params.image,
      quality: params.quality,
      format: params.format,
      resultFileName: params.resultFileName,
    }),
  },

  outputs: {
    dataUrl: {
      type: 'string',
      description: 'Base64 data URL of the compressed image.',
    },
    mimeType: {
      type: 'string',
      description: 'Output MIME type (image/png or image/jpeg).',
    },
    quality: {
      type: 'string',
      description: 'Quality preset used (high or lossy).',
    },
    format: {
      type: 'string',
      description: 'Format used (png or jpg).',
    },
    resultFileName: {
      type: 'string',
      description: 'Optional result file name.',
    },
  },
}
