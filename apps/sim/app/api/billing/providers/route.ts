import { createLogger } from '@sim/logger'
import { NextResponse, type NextRequest } from 'next/server'
import { env } from '@/lib/core/config/env'
import { isBillingEnabled } from '@/lib/core/config/feature-flags'
import { hasValidTapCredentials } from '@/lib/billing/tap/tap-client'

const logger = createLogger('BillingProviders')

type PaymentProviderId = 'stripe' | 'tap'

export async function GET(_request: NextRequest) {
  try {
    if (!isBillingEnabled) {
      return NextResponse.json({ availableProviders: [] as PaymentProviderId[], defaultProvider: null })
    }

    const availableProviders: PaymentProviderId[] = []

    const stripeAvailable = Boolean(env.STRIPE_SECRET_KEY)
    if (stripeAvailable) availableProviders.push('stripe')

    const tapAvailable = hasValidTapCredentials()
    if (tapAvailable) availableProviders.push('tap')

    const defaultProvider: PaymentProviderId | null = availableProviders.includes('stripe')
      ? 'stripe'
      : availableProviders.includes('tap')
        ? 'tap'
        : null

    return NextResponse.json({ availableProviders, defaultProvider })
  } catch (error) {
    logger.error('Failed to resolve billing providers', { error })
    return NextResponse.json(
      { availableProviders: [] as PaymentProviderId[], defaultProvider: null },
      { status: 500 }
    )
  }
}

