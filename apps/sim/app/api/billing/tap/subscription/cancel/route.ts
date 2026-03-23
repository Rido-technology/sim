import { createLogger } from '@sim/logger'
import { db } from '@sim/db'
import { subscription as subscriptionTable } from '@sim/db/schema'
import { and, eq } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { getTapApiBaseUrl, requireTapMerchantSecretKey } from '@/lib/billing/tap/tap-client'
import { isOrganizationOwnerOrAdmin } from '@/lib/billing/core/organization'

const logger = createLogger('TapCancelSubscriptionRoute')

const CancelSchema = z.object({
  referenceId: z.string().min(1),
  subscriptionId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const session = await getSession()

  try {
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = CancelSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid request' },
        { status: 400 }
      )
    }

    const { referenceId, subscriptionId } = parsed.data

    const isOwnerOrAdmin =
      referenceId === session.user.id ? true : await isOrganizationOwnerOrAdmin(session.user.id, referenceId)
    if (!isOwnerOrAdmin) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const subRows = await db
      .select()
      .from(subscriptionTable)
      .where(
        and(
          eq(subscriptionTable.paymentProvider, 'tap'),
          eq(subscriptionTable.status, 'active'),
          ...(subscriptionId ? [eq(subscriptionTable.id, subscriptionId)] : [eq(subscriptionTable.referenceId, referenceId)])
        )
      )
      .limit(1)

    const sub = subRows[0]
    if (!sub) {
      return NextResponse.json({ error: 'Active Tap subscription not found' }, { status: 404 })
    }

    await db
      .update(subscriptionTable)
      .set({ cancelAtPeriodEnd: true })
      .where(eq(subscriptionTable.id, sub.id))

    // Best-effort: Tap cancellation may depend on their current subscription/payment agreement model.
    // We attempt to stop future recurring charges by canceling the payment agreement, if available.
    if (sub.tapPaymentAgreementId) {
      try {
        const secretKey = requireTapMerchantSecretKey()
        const tapApiBaseUrl = getTapApiBaseUrl()

        const res = await fetch(`${tapApiBaseUrl}/v2/payment_agreements/${sub.tapPaymentAgreementId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${secretKey}`,
          },
        })

        if (!res.ok) {
          const text = await res.text().catch(() => '')
          logger.warn('Tap payment agreement cancel request failed', {
            status: res.status,
            text,
            tapPaymentAgreementId: sub.tapPaymentAgreementId,
          })
        }
      } catch (error) {
        logger.warn('Tap payment agreement cancel threw error', { error })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Failed to cancel Tap subscription', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

