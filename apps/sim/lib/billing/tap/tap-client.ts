import { createLogger } from '@sim/logger'
import { env } from '@/lib/core/config/env'

const logger = createLogger('TapClient')

export function hasValidTapCredentials(): boolean {
  return Boolean(env.TAP_MERCHANT_SECRET_KEY)
}

export function getTapMerchantSecretKey(): string | null {
  if (!env.TAP_MERCHANT_SECRET_KEY) return null
  return env.TAP_MERCHANT_SECRET_KEY
}

export function getTapApiBaseUrl(): string {
  return env.TAP_API_BASE_URL || 'https://api.tap.company'
}

export function getTapEcommerceSecretKey(): string | null {
  if (!env.TAP_ECOMMERCE_SECRET_KEY) return null
  return env.TAP_ECOMMERCE_SECRET_KEY
}

export function requireTapMerchantSecretKey(): string {
  const key = getTapMerchantSecretKey()
  if (!key) {
    logger.error('Tap merchant secret key missing')
    throw new Error('Tap merchant secret key is not available. Set TAP_MERCHANT_SECRET_KEY.')
  }
  return key
}

