import { db } from '@sim/db'
import { member, organization, subscription, userStats } from '@sim/db/schema'
import { createLogger } from '@sim/logger'
import { and, eq, inArray, sql } from 'drizzle-orm'
import { DEFAULT_OVERAGE_THRESHOLD } from '@/lib/billing/constants'
import { calculateSubscriptionOverage } from '@/lib/billing/core/billing'
import { getPlanPricing } from '@/lib/billing/core/billing'
import { getHighestPrioritySubscription } from '@/lib/billing/core/subscription'
import { env } from '@/lib/core/config/env'
import { getBaseUrl } from '@/lib/core/utils/urls'
import { requireTapMerchantSecretKey, getTapApiBaseUrl } from '@/lib/billing/tap/tap-client'

const logger = createLogger('TapOverageBilling')

const OVERAGE_THRESHOLD = env.OVERAGE_THRESHOLD_DOLLARS || DEFAULT_OVERAGE_THRESHOLD

function parseDecimal(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0
  return Number.parseFloat(value.toString())
}

async function createTapOverageCharge(params: {
  customerId: string
  tapPaymentAgreementId: string
  tapSubscriptionId: string
  amount: number
  metadata: Record<string, string>
}): Promise<void> {
  const secretKey = requireTapMerchantSecretKey()
  const tapApiBaseUrl = getTapApiBaseUrl()
  const webhookUrl = `${getBaseUrl()}/api/billing/tap/webhook`

  const payload: Record<string, unknown> = {
    amount: params.amount.toFixed(2),
    currency: 'USD',
    customer_initiated: false,
    threeDSecure: false,
    payment_agreement: { id: params.tapPaymentAgreementId },
    customer: { id: params.customerId },
    // We store Tap's agreement contract ID in `tap_subscription_id`. Tap expects a card/source token id for merchant-initiated charges.
    // If Tap requires a different token field, this can be adjusted once verified in sandbox.
    source: { id: params.tapSubscriptionId },
    post: { url: webhookUrl },
    metadata: {
      udf1: params.metadata.udf1,
      udf2: params.metadata.udf2,
      udf3: params.metadata.udf3,
      udf4: params.metadata.udf4 ?? '',
    },
  }

  const res = await fetch(`${tapApiBaseUrl}/v2/charges/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    logger.error('Failed to create Tap overage charge', { status: res.status, text })
    throw new Error('Tap overage charge creation failed')
  }
}

export async function checkAndBillTapOverageThreshold(userId: string): Promise<void> {
  try {
    const threshold = OVERAGE_THRESHOLD
    const userSubscription = await getHighestPrioritySubscription(userId)

    if (!userSubscription || userSubscription.status !== 'active') {
      logger.debug('No active subscription for Tap threshold billing', { userId })
      return
    }

    if (!userSubscription.plan || userSubscription.plan === 'free' || userSubscription.plan === 'enterprise') {
      return
    }

    if (userSubscription.plan === 'team') {
      // Team handled by org-level function.
      await checkAndBillTapOrganizationOverageThreshold(userSubscription.referenceId)
      return
    }

    if (userSubscription.paymentProvider !== 'tap') return

    await db.transaction(async (tx) => {
      const statsRecords = await tx
        .select()
        .from(userStats)
        .where(eq(userStats.userId, userId))
        .for('update')
        .limit(1)

      if (statsRecords.length === 0) {
        logger.warn('User stats not found for Tap threshold billing', { userId })
        return
      }

      const stats = statsRecords[0]

      const currentOverage = await calculateSubscriptionOverage({
        id: userSubscription.id,
        plan: userSubscription.plan,
        referenceId: userSubscription.referenceId,
        seats: userSubscription.seats,
      })

      const billedOverageThisPeriod = parseDecimal(stats.billedOverageThisPeriod)
      const unbilledOverage = Math.max(0, currentOverage - billedOverageThisPeriod)

      if (unbilledOverage < threshold) {
        return
      }

      let amountToBill = unbilledOverage

      const creditBalance = Number.parseFloat(stats.creditBalance?.toString() || '0')
      let creditsApplied = 0

      if (creditBalance > 0) {
        creditsApplied = Math.min(creditBalance, amountToBill)

        await tx
          .update(userStats)
          .set({
            creditBalance: sql`GREATEST(0, ${userStats.creditBalance} - ${creditsApplied})`,
          })
          .where(eq(userStats.userId, userId))

        amountToBill = amountToBill - creditsApplied
      }

      if (amountToBill <= 0) {
        await tx
          .update(userStats)
          .set({
            billedOverageThisPeriod: sql`${userStats.billedOverageThisPeriod} + ${unbilledOverage}`,
          })
          .where(eq(userStats.userId, userId))
        return
      }

      const tapCustomerId = userSubscription.tapCustomerId
      const tapPaymentAgreementId = userSubscription.tapPaymentAgreementId
      const tapSubscriptionId = userSubscription.tapSubscriptionId

      if (!tapCustomerId || !tapPaymentAgreementId || !tapSubscriptionId) {
        logger.error('Tap subscription identifiers missing for overage', {
          userId,
          tapCustomerId,
          tapPaymentAgreementId,
          tapSubscriptionId,
        })
        return
      }

      const periodEnd = userSubscription.periodEnd
        ? Math.floor(userSubscription.periodEnd.getTime() / 1000)
        : Math.floor(Date.now() / 1000)
      const billingPeriod = new Date(periodEnd * 1000).toISOString().slice(0, 7)

      await createTapOverageCharge({
        customerId: tapCustomerId,
        tapPaymentAgreementId,
        tapSubscriptionId,
        amount: amountToBill,
        metadata: {
          udf1: 'overage_threshold_billing',
          udf2: userId,
          udf3: 'tap',
          udf4: billingPeriod,
        },
      })

      await tx
        .update(userStats)
        .set({
          billedOverageThisPeriod: sql`${userStats.billedOverageThisPeriod} + ${unbilledOverage}`,
        })
        .where(eq(userStats.userId, userId))
    })
  } catch (error) {
    logger.error('Error in Tap threshold billing check', { userId, error })
  }
}

export async function checkAndBillTapOrganizationOverageThreshold(organizationId: string): Promise<void> {
  try {
    const threshold = OVERAGE_THRESHOLD

    const orgSubscriptions = await db
      .select()
      .from(subscription)
      .where(and(eq(subscription.referenceId, organizationId), eq(subscription.status, 'active')))
      .limit(1)

    if (orgSubscriptions.length === 0) return

    const orgSubscription = orgSubscriptions[0]
    if (orgSubscription.plan !== 'team') return
    if (orgSubscription.paymentProvider !== 'tap') return

    const members = await db
      .select({ userId: member.userId, role: member.role })
      .from(member)
      .where(eq(member.organizationId, organizationId))

    if (members.length === 0) return

    const owner = members.find((m) => m.role === 'owner')
    if (!owner) return

    const nonOwnerIds = members.filter((m) => m.userId !== owner.userId).map((m) => m.userId)

    await db.transaction(async (tx) => {
      const ownerStatsLock = await tx
        .select()
        .from(userStats)
        .where(eq(userStats.userId, owner.userId))
        .for('update')
        .limit(1)

      const orgLock = await tx
        .select()
        .from(organization)
        .where(eq(organization.id, organizationId))
        .for('update')
        .limit(1)

      if (ownerStatsLock.length === 0 || orgLock.length === 0) return

      let totalTeamUsage = parseDecimal(ownerStatsLock[0].currentPeriodCost)
      const totalBilledOverage = parseDecimal(ownerStatsLock[0].billedOverageThisPeriod)

      if (nonOwnerIds.length > 0) {
        const memberStatsRows = await tx
          .select({
            currentPeriodCost: userStats.currentPeriodCost,
          })
          .from(userStats)
          .where(inArray(userStats.userId, nonOwnerIds))

        for (const stats of memberStatsRows) {
          totalTeamUsage += parseDecimal(stats.currentPeriodCost)
        }
      }

      // Org credits are stored on the org row.
      const orgCreditBalance = Number.parseFloat(orgLock[0].creditBalance?.toString() || '0')

      const { basePrice: basePricePerSeat } = getPlanPricing(orgSubscription.plan)
      const basePrice = basePricePerSeat * (orgSubscription.seats ?? 0)
      const currentOverage = Math.max(0, totalTeamUsage - basePrice)
      const unbilledOverage = Math.max(0, currentOverage - totalBilledOverage)

      if (unbilledOverage < threshold) return

      let amountToBill = unbilledOverage

      if (orgCreditBalance > 0) {
        const creditsApplied = Math.min(orgCreditBalance, amountToBill)

        await tx
          .update(organization)
          .set({
            creditBalance: sql`GREATEST(0, ${organization.creditBalance} - ${creditsApplied})`,
          })
          .where(eq(organization.id, organizationId))

        amountToBill = amountToBill - creditsApplied
      }

      if (amountToBill <= 0) {
        await tx
          .update(userStats)
          .set({
            billedOverageThisPeriod: sql`${userStats.billedOverageThisPeriod} + ${unbilledOverage}`,
          })
          .where(eq(userStats.userId, owner.userId))
        return
      }

      const tapCustomerId = orgSubscription.tapCustomerId
      const tapPaymentAgreementId = orgSubscription.tapPaymentAgreementId
      const tapSubscriptionId = orgSubscription.tapSubscriptionId

      if (!tapCustomerId || !tapPaymentAgreementId || !tapSubscriptionId) {
        logger.error('Tap org subscription identifiers missing for overage', {
          organizationId,
          tapCustomerId,
          tapPaymentAgreementId,
          tapSubscriptionId,
        })
        return
      }

      const periodEnd = orgSubscription.periodEnd
        ? Math.floor(orgSubscription.periodEnd.getTime() / 1000)
        : Math.floor(Date.now() / 1000)
      const billingPeriod = new Date(periodEnd * 1000).toISOString().slice(0, 7)

      await createTapOverageCharge({
        customerId: tapCustomerId,
        tapPaymentAgreementId,
        tapSubscriptionId,
        amount: amountToBill,
        metadata: {
          udf1: 'overage_threshold_billing_org',
          udf2: organizationId,
          udf3: 'tap',
          udf4: billingPeriod,
        },
      })

      await tx
        .update(userStats)
        .set({
          billedOverageThisPeriod: sql`${userStats.billedOverageThisPeriod} + ${unbilledOverage}`,
        })
        .where(eq(userStats.userId, owner.userId))
    })
  } catch (error) {
    logger.error('Error in Tap organization threshold billing check', { organizationId, error })
  }
}

