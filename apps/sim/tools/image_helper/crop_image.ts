import type { CropImageParams, CropImageResponse } from '@/tools/image_helper/types'
import type { ToolConfig } from '@/tools/types'

function toNum(v: unknown): number {
  if (typeof v === 'number' && !Number.isNaN(v)) return v
  const n = Number(v)
  return Number.isNaN(n) ? 0 : n
}

export const cropImageTool: ToolConfig<CropImageParams, CropImageResponse> = {
  id: 'crop_image',
  name: 'Crop an Image',
  description:
    'Crops an image to a rectangle. Specify left, top, width, and height. Input can be an image URL or a data URL from a previous step.',
  version: '1.0.0',

  params: {
    image: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description:
        'Image URL or data URL. Can be a URL or a file reference from a previous step.',
    },
    left: {
      type: 'number',
      required: true,
      visibility: 'user-or-llm',
      description:
        'Horizontal position where cropping starts from the left side of the image (pixels).',
    },
    top: {
      type: 'number',
      required: true,
      visibility: 'user-or-llm',
      description:
        'Vertical position where cropping starts from the top of the image (pixels).',
    },
    width: {
      type: 'number',
      required: true,
      visibility: 'user-or-llm',
      description: 'Width of the cropped area in pixels.',
    },
    height: {
      type: 'number',
      required: true,
      visibility: 'user-or-llm',
      description: 'Height of the cropped area in pixels.',
    },
    resultFileName: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Optional file name for the result.',
    },
  },

  request: {
    url: '/api/tools/image_helper/crop_image',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => ({
      image: params.image,
      left: toNum(params.left),
      top: toNum(params.top),
      width: toNum(params.width),
      height: toNum(params.height),
      resultFileName: params.resultFileName,
    }),
  },

  outputs: {
    dataUrl: {
      type: 'string',
      description: 'Base64 data URL of the cropped image.',
    },
    width: {
      type: 'number',
      description: 'Width of the cropped image.',
    },
    height: {
      type: 'number',
      description: 'Height of the cropped image.',
    },
    resultFileName: {
      type: 'string',
      description: 'Optional result file name.',
    },
  },
}
