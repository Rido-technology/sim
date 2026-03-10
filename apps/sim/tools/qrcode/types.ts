export interface QrCodeGenerateParams {
  text: string
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
  size?: number
}

export interface QrCodeFileData {
  name: string
  mimeType: string
  data: string
  size: number
}
