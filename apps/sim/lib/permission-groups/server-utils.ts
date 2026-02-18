import { db } from '@sim/db'
import { member, permissionGroup, permissionGroupMember } from '@sim/db/schema'
import { createLogger } from '@sim/logger'
import { and, eq } from 'drizzle-orm'
import {
  DEFAULT_PERMISSION_GROUP_CONFIG,
  parsePermissionGroupConfig,
  type PermissionGroupConfig,
} from '@/lib/permission-groups/types'
import type { ExecutionContext } from '@/executor/types'

const logger = createLogger('PermissionGroups')

/**
 * Error thrown when invitations are not allowed.
 */
export class InvitationsNotAllowedError extends Error {
  constructor() {
    super('Invitations are not allowed based on your permission group settings')
    this.name = 'InvitationsNotAllowedError'
  }
}

/**
 * Gets the user's permission group configuration.
 * Returns the permission config if user is assigned to a group, otherwise returns default (permissive) config.
 */
export async function getUserPermissionConfig(
  userId?: string,
  ctx?: ExecutionContext | { organizationId?: string }
): Promise<PermissionGroupConfig> {
  if (!userId) {
    return DEFAULT_PERMISSION_GROUP_CONFIG
  }

  // Check if context already has cached permission config
  if (ctx && 'permissionConfig' in ctx && ctx.permissionConfig) {
    return ctx.permissionConfig
  }

  try {
    const contextOrganizationId = ctx && 'organizationId' in ctx ? ctx.organizationId : undefined
    let organizationId = contextOrganizationId

    if (!organizationId) {
      const [membership] = await db
        .select({ organizationId: member.organizationId })
        .from(member)
        .where(eq(member.userId, userId))
        .limit(1)

      organizationId = membership?.organizationId
    }

    if (!organizationId) {
      return DEFAULT_PERMISSION_GROUP_CONFIG
    }

    if (contextOrganizationId) {
      const [membership] = await db
        .select({ id: member.id })
        .from(member)
        .where(and(eq(member.userId, userId), eq(member.organizationId, organizationId)))
        .limit(1)

      if (!membership) {
        return DEFAULT_PERMISSION_GROUP_CONFIG
      }
    }

    // Find user's permission group assignment
    const [groupMembership] = await db
      .select({
        permissionGroupId: permissionGroupMember.permissionGroupId,
        config: permissionGroup.config,
        groupName: permissionGroup.name,
      })
      .from(permissionGroupMember)
      .innerJoin(permissionGroup, eq(permissionGroupMember.permissionGroupId, permissionGroup.id))
      .where(
        and(
          eq(permissionGroupMember.userId, userId),
          eq(permissionGroup.organizationId, organizationId)
        )
      )
      .limit(1)

    if (!groupMembership) {
      return DEFAULT_PERMISSION_GROUP_CONFIG
    }

    const config = parsePermissionGroupConfig(groupMembership.config)

    // Cache in context if available
    if (ctx && 'permissionConfig' in ctx) {
      ;(ctx as any).permissionConfig = config
      ;(ctx as any).permissionConfigLoaded = true
    }

    return config
  } catch (error) {
    // On error, return default config to avoid blocking operations
    logger.error('Failed to get user permission config', { error })
    return DEFAULT_PERMISSION_GROUP_CONFIG
  }
}


/**
 * Validates if a user can use a specific model provider.
 * Throws error if user's permission group restricts this provider.
 */
export async function validateModelProvider(
  userId?: string,
  model?: string,
  ctx?: ExecutionContext | { organizationId?: string }
): Promise<void> {
  if (!userId || !model) return

  const config = await getUserPermissionConfig(userId, ctx)
  
  // null means allow all providers
  if (config.allowedModelProviders === null) return

  // Extract provider from model (e.g., "openai" from "gpt-4")
  const provider = model.split('/')[0] || model.split(':')[0] || model

  if (!config.allowedModelProviders.includes(provider)) {
    throw new Error(
      `Model provider "${provider}" is not allowed. Allowed providers: ${config.allowedModelProviders.join(', ')}`
    )
  }
}


export async function validateBlockType(
  userId?: string,
  blockType?: string,
  ctx?: ExecutionContext | { organizationId?: string }
): Promise<void> {
  if (!userId || !blockType) return

  // Always allow start_trigger
  if (blockType === 'start_trigger') return

  const config = await getUserPermissionConfig(userId, ctx)
  
  // null means allow all integrations
  if (config.allowedIntegrations === null) return

  if (!config.allowedIntegrations.includes(blockType)) {
    throw new Error(
      `Block type "${blockType}" is not allowed. Allowed integrations: ${config.allowedIntegrations.join(', ')}`
    )
  }
}


export async function validateOAuthProvider(
  userId?: string,
  provider?: string,
  ctx?: ExecutionContext | { organizationId?: string }
): Promise<void> {
  if (!userId || !provider) return

  const config = await getUserPermissionConfig(userId, ctx)
  
  // null means allow all providers
  if (config.allowedModelProviders === null) return

  if (!config.allowedModelProviders.includes(provider)) {
    throw new Error(
      `OAuth provider "${provider}" is not allowed. Allowed providers: ${config.allowedModelProviders.join(', ')}`
    )
  }
}


export async function validateCustomToolsAllowed(
  userId?: string,
  ctx?: ExecutionContext | { organizationId?: string }
): Promise<void> {
  if (!userId) return

  const config = await getUserPermissionConfig(userId, ctx)
  
  if (config.disableCustomTools) {
    throw new Error('Custom tools are not allowed for your permission group')
  }
}


export async function validateMcpToolsAllowed(
  userId?: string,
  ctx?: ExecutionContext | { organizationId?: string }
): Promise<void> {
  if (!userId) return

  const config = await getUserPermissionConfig(userId, ctx)
  
  if (config.disableMcpTools) {
    throw new Error('MCP tools are not allowed for your permission group')
  }
}


export async function validateSkillsAllowed(
  userId?: string,
  ctx?: ExecutionContext | { organizationId?: string }
): Promise<void> {
  if (!userId) return

  const config = await getUserPermissionConfig(userId, ctx)
  
  if (config.disableSkills) {
    throw new Error('Skills are not allowed for your permission group')
  }
}


export async function validateInvitationsAllowed(
  userId?: string,
  organizationId?: string
): Promise<void> {
  if (!userId || !organizationId) return

  const config = await getUserPermissionConfig(userId, { organizationId })
  
  if (config.disableInvitations) {
    throw new InvitationsNotAllowedError()
  }
}
