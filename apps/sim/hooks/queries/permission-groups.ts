import { createLogger } from '@sim/logger'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { PermissionGroupConfig } from '@/lib/permission-groups/types'

const logger = createLogger('PermissionGroupQueries')

export interface PermissionGroupSummary {
  id: string
  name: string
  description: string | null
  config: PermissionGroupConfig
  createdBy: string
  createdAt: string
  updatedAt: string
  autoAddNewMembers: boolean
  memberCount: number
  creatorName?: string | null
  creatorEmail?: string | null
}

export interface PermissionGroupMember {
  id: string
  userId: string
  assignedAt: string
  userName?: string | null
  userEmail?: string | null
  userImage?: string | null
}

export interface PermissionGroupCreateInput {
  organizationId: string
  name: string
  description?: string
  config?: PermissionGroupConfig
  autoAddNewMembers?: boolean
}

export interface PermissionGroupUpdateInput {
  id: string
  name?: string
  description?: string | null
  config?: PermissionGroupConfig
  autoAddNewMembers?: boolean
}

export interface PermissionGroupMemberInput {
  groupId: string
  userId: string
}

export interface PermissionGroupRemoveMemberInput {
  groupId: string
  memberId: string
}

export interface PermissionGroupBulkMemberInput {
  groupId: string
  userIds?: string[]
  addAllOrgMembers?: boolean
}

export const permissionGroupKeys = {
  all: ['permission-groups'] as const,
  list: (organizationId?: string) =>
    [...permissionGroupKeys.all, 'list', organizationId ?? 'none'] as const,
  detail: (groupId?: string) =>
    [...permissionGroupKeys.all, 'detail', groupId ?? 'none'] as const,
  members: (groupId?: string) =>
    [...permissionGroupKeys.all, 'members', groupId ?? 'none'] as const,
}

async function fetchPermissionGroups(organizationId: string) {
  const response = await fetch(`/api/permission-groups?organizationId=${organizationId}`)

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Failed to load permission groups')
  }

  const data = await response.json()
  return data.permissionGroups as PermissionGroupSummary[]
}

async function fetchPermissionGroupMembers(groupId: string) {
  const response = await fetch(`/api/permission-groups/${groupId}/members`)

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Failed to load permission group members')
  }

  const data = await response.json()
  return data.members as PermissionGroupMember[]
}

async function createPermissionGroup(input: PermissionGroupCreateInput) {
  const response = await fetch('/api/permission-groups', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Failed to create permission group')
  }

  const data = await response.json()
  return data.permissionGroup as PermissionGroupSummary
}

async function updatePermissionGroup(input: PermissionGroupUpdateInput) {
  const response = await fetch(`/api/permission-groups/${input.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Failed to update permission group')
  }

  const data = await response.json()
  return data.permissionGroup as PermissionGroupSummary
}

async function deletePermissionGroup(groupId: string) {
  const response = await fetch(`/api/permission-groups/${groupId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Failed to delete permission group')
  }

  return response.json() as Promise<{ success: boolean }>
}

async function addPermissionGroupMember(input: PermissionGroupMemberInput) {
  const response = await fetch(`/api/permission-groups/${input.groupId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: input.userId }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Failed to add member')
  }

  const data = await response.json()
  return data.member as PermissionGroupMember
}

async function removePermissionGroupMember(input: PermissionGroupRemoveMemberInput) {
  const response = await fetch(
    `/api/permission-groups/${input.groupId}/members?memberId=${input.memberId}`,
    {
      method: 'DELETE',
    }
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Failed to remove member')
  }

  return response.json() as Promise<{ success: boolean }>
}

async function bulkAddPermissionGroupMembers(input: PermissionGroupBulkMemberInput) {
  const response = await fetch(`/api/permission-groups/${input.groupId}/members/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userIds: input.userIds,
      addAllOrgMembers: input.addAllOrgMembers,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Failed to add members')
  }

  return response.json() as Promise<{ added: number; moved: number }>
}

/**
 * Fetch permission groups for an organization.
 */
export function usePermissionGroups(organizationId?: string) {
  return useQuery({
    queryKey: permissionGroupKeys.list(organizationId),
    queryFn: () => fetchPermissionGroups(organizationId as string),
    enabled: Boolean(organizationId),
    staleTime: 30 * 1000,
  })
}

/**
 * Fetch members for a permission group.
 */
export function usePermissionGroupMembers(groupId?: string) {
  return useQuery({
    queryKey: permissionGroupKeys.members(groupId),
    queryFn: () => fetchPermissionGroupMembers(groupId as string),
    enabled: Boolean(groupId),
    staleTime: 30 * 1000,
  })
}

/**
 * Create a permission group.
 */
export function useCreatePermissionGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPermissionGroup,
    onSuccess: (group) => {
      queryClient.invalidateQueries({ queryKey: permissionGroupKeys.list(group.organizationId) })
    },
    onError: (error) => {
      logger.error('Failed to create permission group', { error })
    },
  })
}

/**
 * Update a permission group.
 */
export function useUpdatePermissionGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updatePermissionGroup,
    onSuccess: (group) => {
      queryClient.invalidateQueries({ queryKey: permissionGroupKeys.list(group.organizationId) })
      queryClient.invalidateQueries({ queryKey: permissionGroupKeys.detail(group.id) })
    },
    onError: (error) => {
      logger.error('Failed to update permission group', { error })
    },
  })
}

/**
 * Delete a permission group.
 */
export function useDeletePermissionGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePermissionGroup,
    onSuccess: (_data, groupId) => {
      queryClient.invalidateQueries({ queryKey: permissionGroupKeys.all })
      queryClient.invalidateQueries({ queryKey: permissionGroupKeys.detail(groupId) })
    },
    onError: (error) => {
      logger.error('Failed to delete permission group', { error })
    },
  })
}

/**
 * Add a member to a permission group.
 */
export function useAddPermissionGroupMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addPermissionGroupMember,
    onSuccess: (_member, input) => {
      queryClient.invalidateQueries({ queryKey: permissionGroupKeys.members(input.groupId) })
      queryClient.invalidateQueries({ queryKey: permissionGroupKeys.all })
    },
    onError: (error) => {
      logger.error('Failed to add permission group member', { error })
    },
  })
}

/**
 * Remove a member from a permission group.
 */
export function useRemovePermissionGroupMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: removePermissionGroupMember,
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: permissionGroupKeys.members(input.groupId) })
      queryClient.invalidateQueries({ queryKey: permissionGroupKeys.all })
    },
    onError: (error) => {
      logger.error('Failed to remove permission group member', { error })
    },
  })
}

/**
 * Bulk add members to a permission group.
 */
export function useBulkAddPermissionGroupMembers() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: bulkAddPermissionGroupMembers,
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: permissionGroupKeys.members(input.groupId) })
      queryClient.invalidateQueries({ queryKey: permissionGroupKeys.all })
    },
    onError: (error) => {
      logger.error('Failed to bulk add permission group members', { error })
    },
  })
}
