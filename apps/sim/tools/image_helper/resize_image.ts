import type {
  ResizeImageParams,
  ResizeImageResponse,
} from '@/tools/image_helper/types'
import type { ToolConfig } from '@/tools/types'

function toNum(v: unknown): number {
  if (typeof v === 'number' && !Number.isNaN(v)) return v
  const n = Number(v)
  return Number.isNaN(n) ? 0 : n
}

export const resizeImageTool: ToolConfig<
  ResizeImageParams,
  ResizeImageResponse
> = {
  id: 'resize_image',
  name: 'Resize an Image',
  description:
    'Resizes an image to a target width and height. Optionally maintain aspect ratio for height. Input can be an image URL or a data URL from a previous step.',
  version: '1.0.0',

  params: {
    image: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description:
        'Image URL or data URL. Can be a URL or a file reference from a previous step.',
    },
    width: {
      type: 'number',
      required: true,
      visibility: 'user-or-llm',
      description: 'Target width in pixels.',
    },
    height: {
      type: 'number',
      required: true,
      visibility: 'user-or-llm',
      description:
        'Target height in pixels. Ignored when maintainAspectRatioForHeight is true.',
    },
    maintainAspectRatioForHeight: {
      type: 'boolean',
      required: true,
      visibility: 'user-or-llm',
      description:
        'When true, height is computed from width to maintain aspect ratio.',
    },
    resultFileName: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Optional file name for the result.',
    },
  },

  request: {
    url: '/api/tools/image_helper/resize_image',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => ({
      image: params.image,
      width: toNum(params.width),
      height: toNum(params.height),
      maintainAspectRatioForHeight:
        params.maintainAspectRatioForHeight === true ||
        (params.maintainAspectRatioForHeight as unknown) === 'true',
      resultFileName: params.resultFileName,
    }),
  },

  outputs: {
    dataUrl: {
      type: 'string',
      description: 'Base64 data URL of the resized image.',
    },
    width: {
      type: 'number',
      description: 'Width of the resized image.',
    },
    height: {
      type: 'number',
      description: 'Height of the resized image.',
    },
    resultFileName: {
      type: 'string',
      description: 'Optional result file name.',
    },
  },
}
