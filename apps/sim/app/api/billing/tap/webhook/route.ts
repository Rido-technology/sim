import { createLogger } from '@sim/logger'
import { db } from '@sim/db'
import { subscription as subscriptionTable, userStats } from '@sim/db/schema'
import { and, eq } from 'drizzle-orm'
import { createHmac, randomUUID } from 'crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { ensureOrganizationForTeamSubscription, syncSubscriptionUsageLimits } from '@/lib/billing/organization'
import { resetUsageForSubscription } from '@/lib/billing/webhooks/invoices'
import { handleSubscriptionCreated } from '@/lib/billing/webhooks/subscription'
import { blockOrgMembers, unblockOrgMembers } from '@/lib/billing/organizations/membership'
import { sendPlanWelcomeEmail } from '@/lib/billing'
import { requireTapMerchantSecretKey } from '@/lib/billing/tap/tap-client'

const logger = createLogger('TapWebhook')

type BillingBlockReason = 'payment_failed' | 'dispute'

function getTapCurrencyDecimals(currency: string | undefined | null): number {
  // Tap uses standard decimal rules based on ISO currency.
  // Common 3-decimal currencies: BHD, JOD, KWD, OMR, TND.
  const c = (currency ?? '').toUpperCase()
  if (['BHD', 'JOD', 'KWD', 'OMR', 'TND'].includes(c)) return 3
  return 2
}

function normalizeAmount(amount: unknown, currency: string | undefined | null): string {
  const decimals = getTapCurrencyDecimals(currency)
  const num = typeof amount === 'string' ? Number.parseFloat(amount) : Number(amount)
  if (!Number.isFinite(num)) return '0'
  return num.toFixed(decimals)
}

function buildTapWebhookHmacPayload(payload: any): string {
  const obj = payload?.object
  const id = payload?.id ?? ''
  const amount = normalizeAmount(payload?.amount, payload?.currency)
  const currency = payload?.currency ?? ''
  const gatewayReference = payload?.reference?.gateway ?? ''
  const paymentReference = payload?.reference?.payment ?? ''
  const status = payload?.status ?? ''

  if (obj === 'invoice') {
    const updated = payload?.updated ?? ''
    const created = payload?.transaction?.created ?? payload?.created ?? ''
    return `x_id${id}x_amount${amount}x_currency${currency}x_updated${updated}x_status${status}x_created${created}`
  }

  const created = payload?.transaction?.created ?? payload?.created ?? ''
  return `x_id${id}x_amount${amount}x_currency${currency}x_gateway_reference${gatewayReference}x_payment_reference${paymentReference}x_status${status}x_created${created}`
}

function computeTapWebhookHash(payload: any, secret: string): string {
  const toBeHashedString = buildTapWebhookHmacPayload(payload)
  return createHmac('sha256', secret).update(toBeHashedString).digest('hex')
}

function isTapChargeSuccessful(payload: any): boolean {
  // Tap webhook examples use CAPTURED for successful charges.
  return payload?.status === 'CAPTURED'
}

function getTapWebhookMetadata(payload: any): {
  plan?: string
  referenceId?: string
  seats?: number
  provider?: string
} {
  const metadata = payload?.metadata ?? {}
  const plan = metadata?.udf1
  const referenceId = metadata?.udf2
  const provider = metadata?.udf3
  const seatsRaw = metadata?.udf4

  const seats =
    typeof seatsRaw === 'string' && seatsRaw.trim().length > 0
      ? Number.parseInt(seatsRaw, 10)
      : undefined

  return { plan, referenceId, seats, provider }
}

function getTapIdentifiers(payload: any): { tapCustomerId?: string; tapPaymentAgreementId?: string } {
  const paymentAgreementId = payload?.payment_agreement?.id
  const tapCustomerId = payload?.payment_agreement?.contract?.customer_id || payload?.customer?.id
  return { tapCustomerId, tapPaymentAgreementId: paymentAgreementId }
}

async function setProBillingBlocked(referenceId: string, blocked: boolean, reason: BillingBlockReason) {
  await db
    .update(userStats)
    .set({
      billingBlocked: blocked,
      billingBlockedReason: blocked ? reason : null,
    })
    .where(eq(userStats.userId, referenceId))
}

async function processTapPaymentSuccess(subscription: typeof subscriptionTable.$inferSelect) {
  if (subscription.plan === 'team') {
    // Unblock the org members if we were previously blocked for payment_failed.
    await unblockOrgMembers(subscription.referenceId, 'payment_failed')
  } else {
    await setProBillingBlocked(subscription.referenceId, false, 'payment_failed')
  }

  // Tap does not have a separate invoice-created webhook for us, so reset usage on captured charges.
  await resetUsageForSubscription({ plan: subscription.plan, referenceId: subscription.referenceId })
}

async function processTapPaymentFailure(subscription: typeof subscriptionTable.$inferSelect) {
  if (subscription.plan === 'team') {
    await blockOrgMembers(subscription.referenceId, 'payment_failed')
  } else {
    await setProBillingBlocked(subscription.referenceId, true, 'payment_failed')
  }
}

/**
 * Tap webhook endpoint
 * - Verifies webhook authenticity via the `hashstring` header.
 * - Creates/activates internal subscriptions on first successful charge.
 * - Updates usage limits on subsequent successful recurring charges.
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json().catch(() => null)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const providedHash = request.headers.get('hashstring')
    if (!providedHash) {
      return NextResponse.json({ error: 'Missing hashstring header' }, { status: 400 })
    }

    const tapSecret = requireTapMerchantSecretKey()
    const computedHash = computeTapWebhookHash(payload, tapSecret)

    if (computedHash.toLowerCase() !== providedHash.toLowerCase()) {
      logger.warn('Tap webhook hash validation failed', {
        computedHash,
        providedHash,
        payloadId: payload?.id,
        object: payload?.object,
      })
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
    }

    const { plan, referenceId, seats, provider } = getTapWebhookMetadata(payload)
    if (!plan || !referenceId || provider !== 'tap') {
      // Not a Sim-generated Tap event we care about.
      return NextResponse.json({ received: true })
    }

    const isSuccess = isTapChargeSuccessful(payload)
    const { tapCustomerId, tapPaymentAgreementId } = getTapIdentifiers(payload)

    // Handle threshold overage billing events (if overage Tap charges are configured with matching Tap metadata).
    // Expected metadata convention:
    // - udf1: 'overage_threshold_billing' | 'overage_threshold_billing_org'
    // - udf2: userId | organizationId
    // - udf3: 'tap'
    if (plan === 'overage_threshold_billing') {
      if (isSuccess) {
        await setProBillingBlocked(referenceId, false, 'payment_failed')
        await resetUsageForSubscription({ plan: 'pro', referenceId })
      } else {
        await setProBillingBlocked(referenceId, true, 'payment_failed')
      }
      return NextResponse.json({ received: true })
    }

    if (plan === 'overage_threshold_billing_org') {
      if (isSuccess) {
        await unblockOrgMembers(referenceId, 'payment_failed')
        await resetUsageForSubscription({ plan: 'team', referenceId })
      } else {
        await blockOrgMembers(referenceId, 'payment_failed')
      }
      return NextResponse.json({ received: true })
    }

    // Subscription upgrades only support pro/team plans.
    if (plan !== 'pro' && plan !== 'team') {
      return NextResponse.json({ received: true })
    }

    const existingSubscription = tapPaymentAgreementId
      ? await db
          .select()
          .from(subscriptionTable)
          .where(
            and(
              eq(subscriptionTable.paymentProvider, 'tap'),
              eq(subscriptionTable.tapPaymentAgreementId, tapPaymentAgreementId),
              eq(subscriptionTable.status, 'active')
            )
          )
          .limit(1)
      : await db
          .select()
          .from(subscriptionTable)
          .where(
            and(
              eq(subscriptionTable.paymentProvider, 'tap'),
              eq(subscriptionTable.referenceId, referenceId),
              eq(subscriptionTable.plan, plan),
              eq(subscriptionTable.status, 'active')
            )
          )
          .limit(1)

    if (existingSubscription.length > 0) {
      const sub = existingSubscription[0]

      const updatedPeriodStart = new Date()
      const updatedPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

      if (isSuccess) {
        await db
          .update(subscriptionTable)
          .set({
            periodStart: updatedPeriodStart,
            periodEnd: updatedPeriodEnd,
            tapCustomerId: tapCustomerId ?? sub.tapCustomerId,
          })
          .where(eq(subscriptionTable.id, sub.id))

        await processTapPaymentSuccess(sub)
      } else {
        await processTapPaymentFailure(sub)
      }

      return NextResponse.json({ received: true })
    }

    if (!isSuccess) {
      return NextResponse.json({ received: true })
    }

    const createdAt = new Date()
    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    const newSubscriptionId = randomUUID()

    await db.insert(subscriptionTable).values({
      id: newSubscriptionId,
      plan,
      referenceId,
      paymentProvider: 'tap',
      tapCustomerId: tapCustomerId ?? null,
      tapPaymentAgreementId: tapPaymentAgreementId ?? null,
      tapSubscriptionId: payload?.payment_agreement?.contract?.id ?? null,
      status: 'active',
      periodStart: createdAt,
      periodEnd,
      cancelAtPeriodEnd: false,
      seats: plan === 'team' ? seats ?? 1 : null,
    })

    const inserted = await db
      .select()
      .from(subscriptionTable)
      .where(eq(subscriptionTable.id, newSubscriptionId))
      .limit(1)

    const createdSubscription = inserted[0]

    // Ensure org creation & membership for team plans.
    const resolvedSubscription = plan === 'team'
      ? await ensureOrganizationForTeamSubscription({
          id: createdSubscription.id,
          plan: createdSubscription.plan,
          referenceId: createdSubscription.referenceId,
          status: createdSubscription.status || 'active',
          seats: createdSubscription.seats ?? undefined,
        })
      : createdSubscription

    await handleSubscriptionCreated({
      id: resolvedSubscription.id,
      referenceId: resolvedSubscription.referenceId,
      plan: resolvedSubscription.plan,
      status: resolvedSubscription.status || 'active',
    })

    await syncSubscriptionUsageLimits({
      id: resolvedSubscription.id,
      referenceId: resolvedSubscription.referenceId,
      plan: resolvedSubscription.plan,
      status: resolvedSubscription.status ?? 'active',
      seats: resolvedSubscription.seats ?? undefined,
    })

    await sendPlanWelcomeEmail(resolvedSubscription)

    return NextResponse.json({ received: true })
  } catch (error) {
    logger.error('Tap webhook processing failed', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

