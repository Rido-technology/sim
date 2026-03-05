import { ImageHelperIcon } from '@/components/icons'
import type { BlockConfig } from '@/blocks/types'

const OPERATIONS = [
  { label: 'Image to Base64', id: 'image_to_base64' },
  { label: 'Get Image Metadata', id: 'get_image_metadata' },
  { label: 'Crop an Image', id: 'crop_image' },
  { label: 'Rotate an Image', id: 'rotate_image' },
  { label: 'Resize an Image', id: 'resize_image' },
  { label: 'Compress an Image', id: 'compress_image' },
] as const

export const ImageHelperBlock: BlockConfig = {
  type: 'image_helper',
  name: 'Image Helper',
  description: 'Convert, inspect, crop, rotate, resize, and compress images.',
  longDescription:
    'Use the Image Helper block to convert images to Base64, get metadata, crop, rotate, resize, or compress images. Input can be an image URL or a data URL from a previous step.',
  category: 'tools',
  bgColor: '#6366F1',
  icon: ImageHelperIcon,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: OPERATIONS.map((o) => ({ label: o.label, id: o.id })),
      value: () => 'image_to_base64',
    },
    {
      id: 'image',
      title: 'Image',
      type: 'short-input',
      placeholder:
        'Paste image URL or data URL, or reference a file from a previous block',
      required: true,
      condition: { field: 'operation', value: OPERATIONS.map((o) => o.id) },
    },
    {
      id: 'overrideMimeType',
      title: 'Override MIME Type',
      type: 'short-input',
      placeholder: 'e.g. image/png, image/jpeg (optional)',
      condition: { field: 'operation', value: 'image_to_base64' },
    },
    {
      id: 'left',
      title: 'Left',
      type: 'short-input',
      placeholder: 'Pixels from left',
      required: true,
      condition: { field: 'operation', value: 'crop_image' },
    },
    {
      id: 'top',
      title: 'Top',
      type: 'short-input',
      placeholder: 'Pixels from top',
      required: true,
      condition: { field: 'operation', value: 'crop_image' },
    },
    {
      id: 'cropWidth',
      title: 'Width',
      type: 'short-input',
      placeholder: 'Cropped width (px)',
      required: true,
      condition: { field: 'operation', value: 'crop_image' },
    },
    {
      id: 'cropHeight',
      title: 'Height',
      type: 'short-input',
      placeholder: 'Cropped height (px)',
      required: true,
      condition: { field: 'operation', value: 'crop_image' },
    },
    {
      id: 'degree',
      title: 'Degree',
      type: 'short-input',
      placeholder: 'e.g. 90, 180, 270',
      required: true,
      condition: { field: 'operation', value: 'rotate_image' },
    },
    {
      id: 'resizeWidth',
      title: 'Width',
      type: 'short-input',
      placeholder: 'Target width (px)',
      required: true,
      condition: { field: 'operation', value: 'resize_image' },
    },
    {
      id: 'resizeHeight',
      title: 'Height',
      type: 'short-input',
      placeholder: 'Target height (px)',
      required: true,
      condition: { field: 'operation', value: 'resize_image' },
    },
    {
      id: 'maintainAspectRatioForHeight',
      title: 'Maintain aspect ratio for height',
      type: 'switch',
      required: true,
      condition: { field: 'operation', value: 'resize_image' },
    },
    {
      id: 'quality',
      title: 'Quality',
      type: 'dropdown',
      options: [
        { label: 'High quality', id: 'high' },
        { label: 'Lossy quality', id: 'lossy' },
      ],
      value: () => 'high',
      required: true,
      condition: { field: 'operation', value: 'compress_image' },
    },
    {
      id: 'format',
      title: 'Format',
      type: 'dropdown',
      options: [
        { label: 'PNG', id: 'png' },
        { label: 'JPG', id: 'jpg' },
      ],
      value: () => 'png',
      required: true,
      condition: { field: 'operation', value: 'compress_image' },
    },
    {
      id: 'cropResultFileName',
      title: 'Result File Name',
      type: 'short-input',
      placeholder: 'Optional file name',
      condition: { field: 'operation', value: 'crop_image' },
    },
    {
      id: 'rotateResultFileName',
      title: 'Result File Name',
      type: 'short-input',
      placeholder: 'Optional file name',
      condition: { field: 'operation', value: 'rotate_image' },
    },
    {
      id: 'resizeResultFileName',
      title: 'Result File Name',
      type: 'short-input',
      placeholder: 'Optional file name',
      condition: { field: 'operation', value: 'resize_image' },
    },
    {
      id: 'compressResultFileName',
      title: 'Result File Name',
      type: 'short-input',
      placeholder: 'Optional file name',
      condition: { field: 'operation', value: 'compress_image' },
    },
  ],
  tools: {
    access: [
      'image_to_base64',
      'get_image_metadata',
      'crop_image',
      'rotate_image',
      'resize_image',
      'compress_image',
    ],
    config: {
      tool: (params) => {
        const op = params.operation as string
        if (
          [
            'image_to_base64',
            'get_image_metadata',
            'crop_image',
            'rotate_image',
            'resize_image',
            'compress_image',
          ].includes(op)
        ) {
          return op
        }
        return 'image_to_base64'
      },
      params: (params) => {
        const operation = params.operation as string
        const image = params.image as string

        switch (operation) {
          case 'image_to_base64':
            return {
              image,
              overrideMimeType: (params.overrideMimeType as string)?.trim(),
            }
          case 'get_image_metadata':
            return { image }
          case 'crop_image':
            return {
              image,
              left: Number(params.left) || 0,
              top: Number(params.top) || 0,
              width: Number(params.cropWidth) || 0,
              height: Number(params.cropHeight) || 0,
              resultFileName: (params.cropResultFileName as string)?.trim(),
            }
          case 'rotate_image':
            return {
              image,
              degree: Number(params.degree) || 0,
              resultFileName: (params.rotateResultFileName as string)?.trim(),
            }
          case 'resize_image':
            return {
              image,
              width: Number(params.resizeWidth) || 0,
              height: Number(params.resizeHeight) || 0,
              maintainAspectRatioForHeight:
                params.maintainAspectRatioForHeight === true ||
                params.maintainAspectRatioForHeight === 'true',
              resultFileName: (params.resizeResultFileName as string)?.trim(),
            }
          case 'compress_image':
            return {
              image,
              quality: (params.quality as string) || 'high',
              format: (params.format as string) || 'png',
              resultFileName: (params.compressResultFileName as string)?.trim(),
            }
          default:
            return { image, overrideMimeType: (params.overrideMimeType as string)?.trim() }
        }
      },
    },
  },
  inputs: {
    operation: {
      type: 'string',
      description:
        'Operation: image_to_base64, get_image_metadata, crop_image, rotate_image, resize_image, or compress_image.',
    },
    image: {
      type: 'string',
      description:
        'Image URL or data URL. Can be a reference from a previous block output.',
    },
    overrideMimeType: {
      type: 'string',
      description: 'Optional MIME type override for Image to Base64.',
    },
    left: { type: 'string', description: 'Crop left position (pixels).' },
    top: { type: 'string', description: 'Crop top position (pixels).' },
    cropWidth: { type: 'string', description: 'Crop width (pixels).' },
    cropHeight: { type: 'string', description: 'Crop height (pixels).' },
    degree: { type: 'string', description: 'Rotation angle in degrees.' },
    resizeWidth: { type: 'string', description: 'Resize target width (pixels).' },
    resizeHeight: {
      type: 'string',
      description: 'Resize target height (pixels).',
    },
    maintainAspectRatioForHeight: {
      type: 'boolean',
      description: 'When true, height is computed from width to keep aspect ratio.',
    },
    quality: {
      type: 'string',
      description: 'Compress quality: high or lossy.',
    },
    format: { type: 'string', description: 'Compress format: png or jpg.' },
    cropResultFileName: { type: 'string', description: 'Optional result file name (crop).' },
    rotateResultFileName: { type: 'string', description: 'Optional result file name (rotate).' },
    resizeResultFileName: { type: 'string', description: 'Optional result file name (resize).' },
    compressResultFileName: {
      type: 'string',
      description: 'Optional result file name (compress).',
    },
  },
  outputs: {
    dataUrl: {
      type: 'string',
      description:
        'Base64 data URL of the image (image_to_base64, crop, rotate, resize, compress).',
    },
    mimeType: {
      type: 'string',
      description: 'MIME type of the output image.',
    },
    width: {
      type: 'number',
      description: 'Image width in pixels (metadata, crop, rotate, resize).',
    },
    height: {
      type: 'number',
      description: 'Image height in pixels (metadata, crop, rotate, resize).',
    },
    sizeBytes: {
      type: 'number',
      description: 'Size of the image in bytes (get_image_metadata).',
    },
    resultFileName: {
      type: 'string',
      description: 'Optional result file name when provided.',
    },
    quality: { type: 'string', description: 'Quality preset used (compress).' },
    format: { type: 'string', description: 'Format used (compress).' },
    success: { type: 'boolean', description: 'Whether the operation succeeded.' },
    error: { type: 'string', description: 'Error message if the operation failed.' },
  },
}
