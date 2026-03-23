import { z } from 'zod'
import { NextResponse, type NextRequest } from 'next/server'
import { createLogger } from '@sim/logger'
import { getSession } from '@/lib/auth'
import { hasValidTapCredentials } from '@/lib/billing/tap/tap-client'
import type { TapSubscriptionPlan } from '@/lib/billing/tap/subscription/plans'
import { createTapSubscriptionUpgradeCharge } from '@/lib/billing/tap/subscription/upgrade'

const logger = createLogger('TapUpgradeRoute')

const UpgradeSchema = z.object({
  plan: z.enum(['pro', 'team']),
  referenceId: z.string().min(1),
  seats: z.number().int().min(1).optional(),
  successUrl: z.string().min(1).url(),
  cancelUrl: z.string().min(1).url(),
})

export async function POST(request: NextRequest) {
  const session = await getSession()

  try {
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!hasValidTapCredentials()) {
      return NextResponse.json(
        { error: 'Tap is not configured. Set TAP_MERCHANT_SECRET_KEY.' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const parsed = UpgradeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid request' },
        { status: 400 }
      )
    }

    const { plan, referenceId, seats, successUrl, cancelUrl } = parsed.data
    const userEmail = session.user.email
    const userName = session.user.name

    if (!userEmail || typeof userEmail !== 'string') {
      return NextResponse.json({ error: 'User email is required for Tap charges' }, { status: 400 })
    }

    const result = await createTapSubscriptionUpgradeCharge({
      plan: plan as TapSubscriptionPlan,
      referenceId,
      seats,
      successUrl,
      cancelUrl,
      user: { email: userEmail, name: userName },
    })

    return NextResponse.json({ url: result.url })
  } catch (error) {
    logger.error('Failed to create Tap subscription upgrade', { error })
    return NextResponse.json({ error: 'Failed to initiate Tap payment' }, { status: 500 })
  }
}

