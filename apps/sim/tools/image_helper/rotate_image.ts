import type {
  RotateImageParams,
  RotateImageResponse,
} from '@/tools/image_helper/types'
import type { ToolConfig } from '@/tools/types'

function toNum(v: unknown): number {
  const n = Number(v)
  return Number.isNaN(n) ? 0 : n
}

export const rotateImageTool: ToolConfig<
  RotateImageParams,
  RotateImageResponse
> = {
  id: 'rotate_image',
  name: 'Rotate an Image',
  description:
    'Rotates an image by a given angle in degrees. Input can be an image URL or a data URL from a previous step.',
  version: '1.0.0',

  params: {
    image: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description:
        'Image URL or data URL. Can be a URL or a file reference from a previous step.',
    },
    degree: {
      type: 'number',
      required: true,
      visibility: 'user-or-llm',
      description: 'Rotation angle in degrees (e.g. 90, 180, 270).',
    },
    resultFileName: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Optional file name for the result.',
    },
  },

  request: {
    url: '/api/tools/image_helper/rotate_image',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => ({
      image: params.image,
      degree: toNum(params.degree),
      resultFileName: params.resultFileName,
    }),
  },

  outputs: {
    dataUrl: {
      type: 'string',
      description: 'Base64 data URL of the rotated image.',
    },
    width: {
      type: 'number',
      description: 'Width of the rotated image.',
    },
    height: {
      type: 'number',
      description: 'Height of the rotated image.',
    },
    resultFileName: {
      type: 'string',
      description: 'Optional result file name.',
    },
  },
}
