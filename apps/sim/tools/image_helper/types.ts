import type { ToolResponse } from '@/tools/types'

export interface ImageToBase64Params {
  image: string
  overrideMimeType?: string
}

export interface ImageToBase64Response extends ToolResponse {
  output: {
    dataUrl: string
    mimeType: string
  }
}

export interface GetImageMetadataParams {
  image: string
}

export interface GetImageMetadataResponse extends ToolResponse {
  output: {
    width: number
    height: number
    mimeType?: string
    sizeBytes?: number
  }
}

export interface CropImageParams {
  image: string
  left: number
  top: number
  width: number
  height: number
  resultFileName?: string
}

export interface CropImageResponse extends ToolResponse {
  output: {
    dataUrl: string
    width: number
    height: number
    resultFileName?: string
  }
}

export interface RotateImageParams {
  image: string
  degree: number
  resultFileName?: string
}

export interface RotateImageResponse extends ToolResponse {
  output: {
    dataUrl: string
    width: number
    height: number
    resultFileName?: string
  }
}

export interface ResizeImageParams {
  image: string
  width: number
  height: number
  maintainAspectRatioForHeight: boolean | string
  resultFileName?: string
}

export interface ResizeImageResponse extends ToolResponse {
  output: {
    dataUrl: string
    width: number
    height: number
    resultFileName?: string
  }
}

export type CompressQuality = 'high' | 'lossy'
export type CompressFormat = 'png' | 'jpg'

export interface CompressImageParams {
  image: string
  quality: CompressQuality
  format: CompressFormat
  resultFileName?: string
}

export interface CompressImageResponse extends ToolResponse {
  output: {
    dataUrl: string
    mimeType: string
    quality: string
    format: string
    resultFileName?: string
  }
}
