import { createLogger } from '@sim/logger'
import { getBaseUrl } from '@/lib/core/utils/urls'
import { getTapApiBaseUrl, requireTapMerchantSecretKey } from '@/lib/billing/tap/tap-client'
import type { TapSubscriptionPlan } from '@/lib/billing/tap/subscription/plans'
import { TAP_SUBSCRIPTION_PLANS } from '@/lib/billing/tap/subscription/plans'

const logger = createLogger('TapSubscriptionUpgrade')

export interface CreateTapSubscriptionUpgradeInput {
  plan: TapSubscriptionPlan
  referenceId: string
  seats?: number
  successUrl: string
  cancelUrl: string
  user: {
    email: string
    name?: string | null
  }
}

function splitName(name?: string | null): { firstName: string; lastName: string } {
  const trimmed = (name ?? '').trim()
  if (!trimmed) return { firstName: 'User', lastName: '' }
  const parts = trimmed.split(/\s+/g).filter(Boolean)
  const firstName = parts[0] || 'User'
  const lastName = parts.length > 1 ? parts.slice(1).join(' ') : ''
  return { firstName, lastName }
}

export interface CreateTapSubscriptionUpgradeResult {
  url: string
}

export async function createTapSubscriptionUpgradeCharge(
  input: CreateTapSubscriptionUpgradeInput
): Promise<CreateTapSubscriptionUpgradeResult> {
  const { plan, referenceId, seats, successUrl, cancelUrl, user } = input

  const credsKey = requireTapMerchantSecretKey()
  const tapApiBaseUrl = getTapApiBaseUrl()

  const planConfig = TAP_SUBSCRIPTION_PLANS[plan]
  const { firstName, lastName } = splitName(user.name)

  const webhookUrl = `${getBaseUrl()}/api/billing/tap/webhook`

  const payload: Record<string, unknown> = {
    amount: planConfig.amount,
    currency: planConfig.currency,
    customer_initiated: true,
    threeDSecure: true,
    save_card: true,
    description: `Sim ${plan} subscription`,
    redirect: { url: successUrl },
    post: { url: webhookUrl },
    metadata: {
      udf1: plan,
      udf2: referenceId,
      udf3: 'tap',
      udf4: seats ? String(seats) : '',
      udf5: cancelUrl,
    },
    customer: {
      first_name: firstName,
      last_name: lastName || undefined,
      email: user.email,
    },
    source: {
      id: "src_all"
    }
  }

  const res = await fetch(`${tapApiBaseUrl}/v2/charges/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${credsKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    logger.error('Tap charge creation failed', { status: res.status, text })
    throw new Error(`Tap charge creation failed (${res.status})`)
  }

  const data: any = await res.json().catch(() => ({}))

  const url = data?.transaction?.url || data?.redirect?.url || data?.transaction?.redirect?.url

  if (!url || typeof url !== 'string' || !/^https?:\/\//i.test(url)) {
    logger.error('Tap charge response missing valid checkout redirect URL', {
      availableKeys: Object.keys(data || {}),
      transactionKeys: Object.keys(data?.transaction || {}),
      redirectKeys: Object.keys(data?.redirect || {}),
    })
    throw new Error('Tap charge succeeded but no redirect URL was returned')
  }

  return { url }
}

