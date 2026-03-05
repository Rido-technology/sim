import { randomUUID } from 'crypto'
import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import sharp from 'sharp'
import { checkInternalAuth } from '@/lib/auth/hybrid'

const logger = createLogger('ImageToBase64API')

const ImageToBase64Schema = z.object({
  image: z.string().min(1, 'Image URL or data URL is required'),
  overrideMimeType: z.string().optional(),
})

const DEFAULT_MIME = 'image/png'

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
    const params = ImageToBase64Schema.parse(body)

    logger.info(`[${requestId}] Converting image to base64`)

    const { buffer, mimeType: sourceMime } = await loadImageBuffer(params.image)
    const outMime = params.overrideMimeType?.trim() || sourceMime || DEFAULT_MIME

    const pipeline = sharp(buffer)
    let outBuffer: Buffer
    if (outMime === 'image/jpeg' || outMime === 'image/jpg') {
      outBuffer = await pipeline.jpeg().toBuffer()
    } else if (outMime === 'image/png') {
      outBuffer = await pipeline.png().toBuffer()
    } else if (outMime === 'image/webp') {
      outBuffer = await pipeline.webp().toBuffer()
    } else {
      outBuffer = await pipeline.png().toBuffer()
    }
    const actualMime = outMime === 'image/jpg' ? 'image/jpeg' : outMime
    const dataUrl = `data:${actualMime};base64,${outBuffer.toString('base64')}`

    logger.info(`[${requestId}] Image converted successfully to ${actualMime}`)

    return NextResponse.json({
      success: true,
      output: {
        dataUrl,
        mimeType: actualMime,
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
    logger.error(`[${requestId}] Image to base64 conversion failed:`, error)

    return NextResponse.json(
      {
        success: false,
        output: { dataUrl: '', mimeType: '' },
        error: `Image conversion failed: ${errorMessage}`,
      },
      { status: 500 }
    )
  }
}