import { randomUUID } from 'crypto'
import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import sharp from 'sharp'
import { checkInternalAuth } from '@/lib/auth/hybrid'

const logger = createLogger('CompressImageAPI')

const CompressImageSchema = z.object({
  image: z.string().min(1, 'Image URL or data URL is required'),
  quality: z.enum(['high', 'lossy']),
  format: z.enum(['png', 'jpg']),
  resultFileName: z.string().optional(),
})

const QUALITY_MAP: Record<string, number> = {
  high: 0.9,
  lossy: 0.6,
}

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
    const params = CompressImageSchema.parse(body)

    logger.info(`[${requestId}] Compressing image: ${params.quality} quality, ${params.format} format`)

    const { buffer, mimeType } = await loadImageBuffer(params.image)
    const qualityKey = params.quality.toLowerCase()
    const qualityNum = QUALITY_MAP[qualityKey] ?? 0.9
    const formatKey = params.format.toLowerCase()
    const isJpeg = formatKey === 'jpg' || formatKey === 'jpeg'

    let outBuffer: Buffer
    if (isJpeg) {
      outBuffer = await sharp(buffer)
        .jpeg({ quality: Math.round(qualityNum * 100) })
        .toBuffer()
    } else {
      outBuffer = await sharp(buffer)
        .png({ compressionLevel: Math.round((1 - qualityNum) * 9) })
        .toBuffer()
    }
    const outMime = isJpeg ? 'image/jpeg' : 'image/png'
    const dataUrl = `data:${outMime};base64,${outBuffer.toString('base64')}`

    logger.info(`[${requestId}] Image compressed successfully to ${outMime}`)

    return NextResponse.json({
      success: true,
      output: {
        dataUrl,
        mimeType: outMime,
        quality: qualityKey,
        format: isJpeg ? 'jpg' : 'png',
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
    logger.error(`[${requestId}] Compress image failed:`, error)

    return NextResponse.json(
      {
        success: false,
        output: {
          dataUrl: '',
          mimeType: '',
          quality: '',
          format: '',
        },
        error: `Compress failed: ${errorMessage}`,
      },
      { status: 500 }
    )
  }
}