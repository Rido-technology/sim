'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { organizationKeys } from '@/hooks/queries/organization'

/**
 * Query key factories for SSO provider queries.
 */
export const ssoKeys = {
  all: ['sso'] as const,
  providers: () => [...ssoKeys.all, 'providers'] as const,
}

async function loadSSOProviders() {
  const response = await fetch('/api/auth/sso/providers')
  if (!response.ok) {
    throw new Error('Failed to fetch SSO providers')
  }
  return response.json()
}

/**
 * Fetches the list of configured SSO providers.
 */
export function useSSOProviders() {
  return useQuery({
    queryKey: ssoKeys.providers(),
    queryFn: loadSSOProviders,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  })
}

interface ConfigureSSOParams {
  provider: string
  domain: string
  clientId: string
  clientSecret: string
  orgId?: string
}

/**
 * Mutation to register or update an SSO provider configuration.
 */
export function useConfigureSSO() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (config: ConfigureSSOParams) => {
      const response = await fetch('/api/auth/sso/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to configure SSO')
      }

      return response.json()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ssoKeys.providers() })

      if (variables.orgId) {
        queryClient.invalidateQueries({ queryKey: organizationKeys.detail(variables.orgId) })
        queryClient.invalidateQueries({ queryKey: organizationKeys.lists() })
      }
    },
  })
}
