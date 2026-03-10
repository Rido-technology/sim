import { QrCodeIcon } from '@/components/icons'
import type { BlockConfig } from '@/blocks/types'

export const QrCodeBlock: BlockConfig = {
  type: 'qrcode',
  name: 'QR Code',
  description: 'Convert text or URL to a QR code image',
  longDescription:
    'Generate QR code PNG images from any text or URL with customizable error correction and size settings',
  docsLink: 'https://docs.sim.ai/tools/qrcode',
  category: 'tools',
  bgColor: '#1A1A1A',
  icon: QrCodeIcon,

  subBlocks: [
    {
      id: 'text',
      title: 'Content',
      type: 'long-input',
      placeholder: 'Enter text or URL to encode as QR code',
      required: true,
    },
    {
      id: 'errorCorrectionLevel',
      title: 'Error Correction',
      type: 'dropdown',
      options: [
        { label: 'Low (7%)', id: 'L' },
        { label: 'Medium (15%)', id: 'M' },
        { label: 'Quartile (25%)', id: 'Q' },
        { label: 'High (30%)', id: 'H' },
      ],
      value: () => 'M',
    },
    {
      id: 'size',
      title: 'Size (px)',
      type: 'short-input',
      placeholder: '256',
    },
  ],

  tools: {
    access: ['qrcode_generate'],
    config: {
      tool: () => 'qrcode_generate',
    },
  },

  inputs: {
    text: { type: 'string', description: 'Text or URL to encode' },
    errorCorrectionLevel: { type: 'string', description: 'Error correction level (L/M/Q/H)' },
    size: { type: 'number', description: 'QR code size in pixels' },
  },

  outputs: {
    qrCode: {
      type: 'file',
      description: 'Generated QR code image (PNG)',
    },
  },
}
