import { db } from '@sim/db'
import { member, user } from '@sim/db/schema'
import { createLogger } from '@sim/logger'
import { ensureOrganizationForUser } from '@/lib/billing/organization'

const logger = createLogger('BackfillOrganizations')

async function backfillOrganizations() {
  const users = await db
    .select({ id: user.id, name: user.name, email: user.email })
    .from(user)

  const memberships = await db.select({ userId: member.userId }).from(member)
  const memberIds = new Set(memberships.map((entry) => entry.userId))

  const targets = users.filter((entry) => !memberIds.has(entry.id))

  logger.info('Backfill organizations starting', {
    totalUsers: users.length,
    missingMemberships: targets.length,
  })

  for (const entry of targets) {
    try {
      await ensureOrganizationForUser(entry.id, {
        organizationName: entry.name || undefined,
      })
    } catch (error) {
      logger.error('Failed to backfill organization', {
        userId: entry.id,
        error,
      })
    }
  }

  logger.info('Backfill organizations completed', {
    processed: targets.length,
  })
}

backfillOrganizations()
  .then(() => {
    process.exitCode = 0
  })
  .catch((error) => {
    logger.error('Backfill organizations failed', { error })
    process.exitCode = 1
  })
