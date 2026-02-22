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

/** SSO API endpoint constants. */
const SSO_API = {
  providers: '/api/auth/sso/providers',
  register: '/api/auth/sso/register',
} as const

/**
 * Fetches the raw SSO provider list from the API.
 */
async function fetchSSOProviders(): Promise<unknown> {
  const res = await fetch(SSO_API.providers)
  if (!res.ok) throw new Error('Failed to fetch SSO providers')
  return res.json()
}

/**
 * Posts a new or updated SSO provider configuration to the API.
 */
async function postSSOConfig(body: ConfigureSSOParams): Promise<unknown> {
  const res = await fetch(SSO_API.register, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error((err as { message?: string }).message || 'Failed to configure SSO')
  }
  return res.json()
}

/**
 * Fetches the list of configured SSO providers.
 */
export function useSSOProviders() {
  return useQuery({
    queryKey: ssoKeys.providers(),
    queryFn: fetchSSOProviders,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  })
}

export interface ConfigureSSOParams {
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
    mutationFn: (config: ConfigureSSOParams) => postSSOConfig(config),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ssoKeys.providers() })
      if (variables.orgId) {
        queryClient.invalidateQueries({ queryKey: organizationKeys.detail(variables.orgId) })
        queryClient.invalidateQueries({ queryKey: organizationKeys.lists() })
      }
    },
  })
}
