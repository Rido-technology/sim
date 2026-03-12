'use client'

import { useQuery } from '@tanstack/react-query'

/**
 * SSO Query Keys - Stub Implementation
 */
export const ssoKeys = {
  all: ['sso'] as const,
  providers: () => [...ssoKeys.all, 'providers'] as const,
}

/**
 * Hook to fetch SSO providers
 * Stub implementation - returns empty data
 */
export function useSSOProviders() {
  return useQuery({
    queryKey: ssoKeys.providers(),
    queryFn: async () => ({ providers: [] }),
    staleTime: 5 * 60 * 1000,
    enabled: false,
  })
}

/**
 * Configure SSO provider mutation
 * Stub implementation - disabled
 */
export function useConfigureSSO() {
  return {
    mutate: () => {
      console.warn('SSO configuration is not available in this build')
    },
    isPending: false,
    error: null,
  }
}
