import { randomUUID } from 'crypto'
import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import sharp from 'sharp'
import { checkInternalAuth } from '@/lib/auth/hybrid'

const logger = createLogger('GetImageMetadataAPI')

const GetImageMetadataSchema = z.object({
  image: z.string().min(1, 'Image URL or data URL is required'),
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
    const params = GetImageMetadataSchema.parse(body)

    logger.info(`[${requestId}] Getting image metadata`)

    const { buffer, mimeType } = await loadImageBuffer(params.image)
    const meta = await sharp(buffer).metadata()
    const width = meta.width ?? 0
    const height = meta.height ?? 0
    const format = meta.format
    const resolvedMime = mimeType || (format ? `image/${format}` : undefined)

    logger.info(`[${requestId}] Image metadata retrieved: ${width}x${height}, ${resolvedMime}`)

    return NextResponse.json({
      success: true,
      output: {
        width,
        height,
        mimeType: resolvedMime,
        sizeBytes: buffer.length,
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
    logger.error(`[${requestId}] Get image metadata failed:`, error)

    return NextResponse.json(
      {
        success: false,
        output: { width: 0, height: 0 },
        error: `Get metadata failed: ${errorMessage}`,
      },
      { status: 500 }
    )
  }
}