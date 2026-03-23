import { createLogger } from '@sim/logger'
import { db } from '@sim/db'
import { subscription as subscriptionTable } from '@sim/db/schema'
import { and, eq } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { isOrganizationOwnerOrAdmin } from '@/lib/billing/core/organization'

const logger = createLogger('TapRestoreSubscriptionRoute')

const RestoreSchema = z.object({
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
    const parsed = RestoreSchema.safeParse(body)
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
      .set({ cancelAtPeriodEnd: false })
      .where(eq(subscriptionTable.id, sub.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Failed to restore Tap subscription', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

