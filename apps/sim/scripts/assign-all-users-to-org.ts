import { randomUUID } from 'crypto'
import { db } from '@sim/db'
import { member, organization, session, user } from '@sim/db/schema'
import { createLogger } from '@sim/logger'
import { asc } from 'drizzle-orm'

const logger = createLogger('AssignUsersToOrg')

const ORGANIZATION_NAME = 'rido'
const ORGANIZATION_SLUG = 'rido'

async function ensureOrganization(): Promise<string> {
  const existing = await db
    .select({ id: organization.id })
    .from(organization)
    .orderBy(asc(organization.createdAt))
    .limit(1)

  if (existing.length > 0) {
    return existing[0].id
  }

  const organizationId = `org_${randomUUID()}`
  await db.insert(organization).values({
    id: organizationId,
    name: ORGANIZATION_NAME,
    slug: ORGANIZATION_SLUG,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  logger.info('Created organization', { organizationId })
  return organizationId
}

async function assignAllUsersToOrganization() {
  const organizationId = await ensureOrganization()

  const users = await db.select({ id: user.id }).from(user)
  const now = new Date()

  await db.transaction(async (tx) => {
    await tx.delete(member)

    if (users.length > 0) {
      await tx.insert(member).values(
        users.map((entry) => ({
          id: randomUUID(),
          userId: entry.id,
          organizationId,
          role: 'owner',
          createdAt: now,
        }))
      )
    }

    await tx.update(session).set({ activeOrganizationId: organizationId })
  })

  logger.info('Assigned all users to organization', {
    organizationId,
    usersProcessed: users.length,
  })
}

assignAllUsersToOrganization()
  .then(() => {
    process.exitCode = 0
  })
  .catch((error) => {
    logger.error('Failed to assign users to organization', { error })
    process.exitCode = 1
  })
