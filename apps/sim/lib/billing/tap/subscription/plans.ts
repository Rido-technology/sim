export type TapSubscriptionPlan = 'pro' | 'team'

export interface TapSubscriptionPlanConfig {
  amount: number
  currency: 'USD'
}

export const TAP_SUBSCRIPTION_PLANS: Record<TapSubscriptionPlan, TapSubscriptionPlanConfig> = {
  pro: { amount: 20, currency: 'USD' },
  team: { amount: 40, currency: 'USD' },
}

