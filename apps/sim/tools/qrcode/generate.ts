import type { ToolConfig } from '@/tools/types'
import type { QrCodeGenerateParams } from './types'

export const qrCodeGenerateTool: ToolConfig<QrCodeGenerateParams> = {
  id: 'qrcode_generate',
  name: 'Generate QR Code',
  description: 'Convert text or URL to a QR code PNG image',
  version: '1.0.0',

  params: {
    text: {
      type: 'string',
      required: true,
      description: 'Text or URL to encode as a QR code',
    },
    errorCorrectionLevel: {
      type: 'string',
      required: false,
      description: 'Error correction level: L (7%), M (15%), Q (25%), H (30%)',
    },
    size: {
      type: 'number',
      required: false,
      description: 'Width/height of the QR code in pixels (default: 256)',
    },
  },

  request: {
    url: '/api/tools/qrcode/generate',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    const QRCode = await import('qrcode')
    const text = String(params.text ?? '')

    if (!text) {
      return { success: false, output: {}, error: 'Text is required' }
    }

    const errorCorrectionLevel = (['L', 'M', 'Q', 'H'].includes(
      params.errorCorrectionLevel as string
    )
      ? params.errorCorrectionLevel
      : 'M') as 'L' | 'M' | 'Q' | 'H'

    const size = Number(params.size) > 0 ? Number(params.size) : 256

    const buffer = await QRCode.toBuffer(text, {
      errorCorrectionLevel,
      width: size,
      type: 'png',
    })

    return {
      success: true,
      output: {
        qrCode: {
          name: 'qr-code.png',
          mimeType: 'image/png',
          data: buffer.toString('base64'),
          size: buffer.length,
        },
      },
    }
  },

  outputs: {
    qrCode: {
      type: 'file',
      description: 'Generated QR code image (PNG)',
      fileConfig: {
        mimeType: 'image/png',
        extension: 'png',
      },
    },
  },
}
