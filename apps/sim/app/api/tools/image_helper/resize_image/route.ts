import { randomUUID } from 'crypto'
import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import sharp from 'sharp'
import { checkInternalAuth } from '@/lib/auth/hybrid'

const logger = createLogger('ResizeImageAPI')

const ResizeImageSchema = z.object({
  image: z.string().min(1, 'Image URL or data URL is required'),
  width: z.number().min(1, 'Width must be positive'),
  height: z.number().min(1, 'Height must be positive'),
  maintainAspectRatioForHeight: z.boolean(),
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
    const params = ResizeImageSchema.parse(body)

    logger.info(`[${requestId}] Resizing image to ${params.width}x${params.height}, maintain aspect: ${params.maintainAspectRatioForHeight}`)

    const { buffer, mimeType } = await loadImageBuffer(params.image)
    const targetWidth = Math.max(1, params.width)
    const targetHeight = Math.max(1, params.height)
    const maintainAspect = params.maintainAspectRatioForHeight

    const meta = await sharp(buffer).metadata()
    const srcW = meta.width ?? targetWidth
    const srcH = meta.height ?? targetHeight

    let w = targetWidth
    let h = targetHeight
    if (maintainAspect) {
      const ratio = srcW / srcH
      h = Math.round(targetWidth / ratio)
    }

    const outBuffer = await sharp(buffer).resize(w, h).toBuffer()
    const outMeta = await sharp(outBuffer).metadata()
    const mime = mimeType || `image/${outMeta.format || 'png'}`
    const dataUrl = `data:${mime};base64,${outBuffer.toString('base64')}`

    logger.info(`[${requestId}] Image resized successfully to ${outMeta.width}x${outMeta.height}`)

    return NextResponse.json({
      success: true,
      output: {
        dataUrl,
        width: outMeta.width ?? w,
        height: outMeta.height ?? h,
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
    logger.error(`[${requestId}] Resize image failed:`, error)

    return NextResponse.json(
      {
        success: false,
        output: { dataUrl: '', width: 0, height: 0 },
        error: `Resize failed: ${errorMessage}`,
      },
      { status: 500 }
    )
  }
}