import { createLogger } from '@sim/logger'
import { NextResponse } from 'next/server'
import QRCode from 'qrcode'

const logger = createLogger('qrcode:generate')

export async function POST(request: Request) {
  let body: { text?: unknown; errorCorrectionLevel?: unknown; size?: unknown }
  try {
    body = await request.json()
    const text = String(body.text ?? '')

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    const errorCorrectionLevel = (['L', 'M', 'Q', 'H'].includes(
      body.errorCorrectionLevel as string
    )
      ? body.errorCorrectionLevel
      : 'M') as 'L' | 'M' | 'Q' | 'H'

    const size = Number(body.size) > 0 ? Number(body.size) : 256

    const buffer = await QRCode.toBuffer(text, {
      errorCorrectionLevel,
      width: size,
      type: 'png',
    })

    logger.info('Generated QR code', { textLength: text.length, size })

    return NextResponse.json({
      qrCode: {
        name: 'qr-code.png',
        mimeType: 'image/png',
        data: buffer.toString('base64'),
        size: buffer.length,
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate QR code'
    logger.error('Failed to generate QR code', { error: errorMessage })
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
