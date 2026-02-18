'use client'

import { useQuery } from '@tanstack/react-query'
import { DEFAULT_PERMISSION_GROUP_CONFIG, type PermissionGroupConfig } from '@/lib/permission-groups/types'

export interface UserPermissionData {
  permissionGroupId: string | null
  groupName: string | null
  config: PermissionGroupConfig | null
}

/**
 * Query key factory for permission config queries
 */
export const permissionConfigKeys = {
  all: ['permissionConfig'] as const,
  user: (organizationId?: string) => 
    [...permissionConfigKeys.all, 'user', organizationId ?? 'none'] as const,
}

/**
 * Fetch user's permission configuration from API
 */
async function fetchUserPermissionConfig(
  organizationId: string
): Promise<UserPermissionData> {
  const response = await fetch(
    `/api/permission-groups/user?organizationId=${organizationId}`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch permission config')
  }

  return response.json()
}

/**
 * Hook to get user's permission configuration.
 * Fetches from API and returns the user's assigned permission group config.
 */
export function useUserPermissionConfig(organizationId?: string) {
  return useQuery({
    queryKey: permissionConfigKeys.user(organizationId),
    queryFn: () => fetchUserPermissionConfig(organizationId as string),
    enabled: Boolean(organizationId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => {
      // Normalize the response to always have a config
      return {
        permissionGroupId: data.permissionGroupId,
        groupName: data.groupName,
        config: data.config ?? DEFAULT_PERMISSION_GROUP_CONFIG,
      }
    },
  })
}
