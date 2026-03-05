import { randomUUID } from 'crypto'
import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import sharp from 'sharp'
import { checkInternalAuth } from '@/lib/auth/hybrid'

const logger = createLogger('CropImageAPI')

const CropImageSchema = z.object({
  image: z.string().min(1, 'Image URL or data URL is required'),
  left: z.number().min(0, 'Left must be non-negative'),
  top: z.number().min(0, 'Top must be non-negative'),
  width: z.number().min(1, 'Width must be positive'),
  height: z.number().min(1, 'Height must be positive'),
  resultFileName: z.string().optional(),
})

async function loadImageBuffer(
  imageParam: string
): Promise<{ buffer: Buffer; mimeType?: string }> {
  const trimmed = imageParam.trim()
  if (!trimmed) {
    throw new Error('Image input is required.')
  }

  if (trimmed.startsWith('data:')) {
    const match = trimmed.match(/^data:([^;]+);base64,(.+)$/)
    if (!match) {
      throw new Error('Invalid data URL format. Expected data:[mime];base64,...')
    }
    const mimeType = match[1].trim()
    const base64 = match[2]
    const buffer = Buffer.from(base64, 'base64')
    return { buffer, mimeType }
  }

  const res = await fetch(trimmed, {
    headers: { Accept: 'image/*' },
  })
  if (!res.ok) {
    throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`)
  }
  const contentType = res.headers.get('content-type')
  const mimeType = contentType?.split(';')[0]?.trim()
  const arrayBuffer = await res.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  return { buffer, mimeType }
}

export async function POST(request: NextRequest) {
  const requestId = randomUUID().slice(0, 8)

  const auth = await checkInternalAuth(request)
  if (!auth.success || !auth.userId) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const params = CropImageSchema.parse(body)

    logger.info(`[${requestId}] Cropping image: ${params.left},${params.top} ${params.width}x${params.height}`)

    const { buffer, mimeType } = await loadImageBuffer(params.image)
    const left = Math.max(0, params.left)
    const top = Math.max(0, params.top)
    const width = Math.max(1, params.width)
    const height = Math.max(1, params.height)

    const outBuffer = await sharp(buffer)
      .extract({ left, top, width, height })
      .toBuffer()
    const meta = await sharp(outBuffer).metadata()
    const outWidth = meta.width ?? width
    const outHeight = meta.height ?? height
    const mime = mimeType || `image/${meta.format || 'png'}`
    const dataUrl = `data:${mime};base64,${outBuffer.toString('base64')}`

    logger.info(`[${requestId}] Image cropped successfully to ${outWidth}x${outHeight}`)

    return NextResponse.json({
      success: true,
      output: {
        dataUrl,
        width: outWidth,
        height: outHeight,
        resultFileName: params.resultFileName?.trim() || undefined,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn(`[${requestId}] Invalid request data`, { errors: error.errors })
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error(`[${requestId}] Crop image failed:`, error)

    return NextResponse.json(
      {
        success: false,
        output: { dataUrl: '', width: 0, height: 0 },
        error: `Crop failed: ${errorMessage}`,
      },
      { status: 500 }
    )
  }
}