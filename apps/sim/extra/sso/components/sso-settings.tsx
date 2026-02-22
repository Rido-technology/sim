'use client'

import { useState } from 'react'
import { createLogger } from '@sim/logger'
import { Check, ChevronDown, Clipboard, Eye, EyeOff } from 'lucide-react'
import { Button, Combobox, Input, Switch, Textarea } from '@/components/emcn'
import { Skeleton } from '@/components/ui'
import { useSession } from '@/lib/auth/auth-client'
import { getSubscriptionStatus } from '@/lib/billing/client/utils'
import { isBillingEnabled } from '@/lib/core/config/feature-flags'
import { cn } from '@/lib/core/utils/cn'
import { getBaseUrl } from '@/lib/core/utils/urls'
import { getUserRole } from '@/lib/workspaces/organization/utils'
import { SSO_TRUSTED_PROVIDERS } from '@/extra/sso/providers'
import { useConfigureSSO, useSSOProviders } from '@/extra/sso/hooks'
import { useOrganizations } from '@/hooks/queries/organization'
import { useSubscriptionData } from '@/hooks/queries/subscription'

const logger = createLogger('SSO')

interface SSOProvider {
  id: string
  providerId: string
  domain: string
  issuer: string
  organizationId: string
  userId?: string
  oidcConfig?: string
  samlConfig?: string
  providerType: 'oidc' | 'saml'
}

const DEFAULT_FORM_DATA = {
  providerType: 'oidc' as 'oidc' | 'saml',
  providerId: '',
  issuerUrl: '',
  domain: '',
  clientId: '',
  clientSecret: '',
  scopes: 'openid,profile,email',
  entryPoint: '',
  cert: '',
  callbackUrl: '',
  audience: '',
  wantAssertionsSigned: true,
  idpMetadata: '',
  showAdvanced: false,
}

const DEFAULT_ERRORS: Record<string, string[]> = {
  providerType: [],
  providerId: [],
  issuerUrl: [],
  domain: [],
  clientId: [],
  clientSecret: [],
  entryPoint: [],
  cert: [],
  scopes: [],
  callbackUrl: [],
  audience: [],
}

export function SSO() {
  const { data: session } = useSession()
  const { data: orgsData } = useOrganizations()
  const { data: subscriptionData } = useSubscriptionData()
  const { data: providersData, isLoading: isLoadingProviders } = useSSOProviders()

  const activeOrganization = orgsData?.activeOrganization
  const providers = providersData?.providers || []
  const existingProvider = providers[0] as SSOProvider | undefined

  const userEmail = session?.user?.email
  const userId = session?.user?.id
  const userRole = getUserRole(orgsData?.activeOrganization, userEmail)
  const isOwner = userRole === 'owner'
  const isAdmin = userRole === 'admin'
  const canManageSSO = isOwner || isAdmin
  const subscriptionStatus = getSubscriptionStatus(subscriptionData?.data)

  const isSSOProviderOwner =
    !isBillingEnabled && userId ? providers.some((p: any) => p.userId === userId) : null

  const configureSSOMutation = useConfigureSSO()

  const [error, setError] = useState<string | null>(null)
  const [showClientSecret, setShowClientSecret] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA)
  const [errors, setErrors] = useState<Record<string, string[]>>(DEFAULT_ERRORS)
  const [showErrors, setShowErrors] = useState(false)

  if (isBillingEnabled) {
    if (!activeOrganization) {
      return (
        <div className='flex h-full items-center justify-center text-[13px] text-[var(--text-muted)]'>
          You must be part of an organization to configure Single Sign-On.
        </div>
      )
    }


    if (!canManageSSO) {
      return (
        <div className='flex h-full items-center justify-center text-[13px] text-[var(--text-muted)]'>
          Only organization owners and admins can configure Single Sign-On settings.
        </div>
      )
    }
  } else {
    if (!isLoadingProviders && isSSOProviderOwner === false && providers.length > 0) {
      return (
        <div className='flex h-full items-center justify-center text-[13px] text-[var(--text-muted)]'>
          Only the user who configured SSO can manage these settings.
        </div>
      )
    }
  }

  const validateProviderId = (value: string): string[] => {
    if (!value || !value.trim()) return ['Provider ID is required.']
    if (!/^[-a-z0-9]+$/i.test(value.trim())) return ['Use letters, numbers, and dashes only.']
    return []
  }

  const validateIssuerUrl = (value: string): string[] => {
    if (!value || !value.trim()) return ['Issuer URL is required.']
    try {
      const url = new URL(value.trim())
      const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
      if (url.protocol !== 'https:' && !isLocalhost) {
        return ['Issuer URL must use HTTPS.']
      }
    } catch {
      return ['Enter a valid issuer URL like https://your-identity-provider.com/oauth2/default']
    }
    return []
  }

  const validateDomain = (value: string): string[] => {
    if (!value || !value.trim()) return ['Domain is required.']
    const trimmed = value.trim()
    const out: string[] = []
    if (/^https?:\/\//i.test(trimmed)) out.push('Do not include protocol (https://).')
    if (!/^[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(trimmed))
      out.push('Enter the email domain of your users, e.g. yourcompany.com')
    return out
  }

  const validateRequired = (label: string, value: string): string[] => {
    if (!value || !value.trim()) return [`${label} is required.`]
    return []
  }

  const runValidation = (data: typeof formData) => {
    const providerType = data.providerType || 'oidc'
    const next: Record<string, string[]> = {
      providerType: [],
      providerId: validateProviderId(data.providerId),
      issuerUrl: validateIssuerUrl(data.issuerUrl),
      domain: validateDomain(data.domain),
      clientId: [],
      clientSecret: [],
      entryPoint: [],
      cert: [],
      scopes: [],
      callbackUrl: [],
      audience: [],
    }

    if (providerType === 'oidc') {
      next.clientId = validateRequired('Client ID', data.clientId)
      next.clientSecret = validateRequired('Client Secret', data.clientSecret)
      if (!data.scopes?.trim()) next.scopes = ['Scopes are required for OIDC providers']
    } else if (providerType === 'saml') {
      next.entryPoint = validateIssuerUrl(data.entryPoint || '')
      if (!next.entryPoint.length && !data.entryPoint)
        next.entryPoint = ['Entry Point URL is required for SAML providers']
      next.cert = validateRequired('Certificate', data.cert)
    }

    setErrors(next)
    return next
  }

  const hasAnyErrors = (errs: Record<string, string[]>) =>
    Object.values(errs).some((l) => l.length > 0)

  const isFormValid = () => {
    const allFilled = ['providerId', 'issuerUrl', 'domain'].every((f) => {
      const v = formData[f as keyof typeof formData]
      return typeof v === 'string' && v.trim() !== ''
    })

    const providerType = formData.providerType || 'oidc'

    if (providerType === 'oidc') {
      return (
        allFilled &&
        formData.clientId.trim() !== '' &&
        formData.clientSecret.trim() !== '' &&
        formData.scopes.trim() !== ''
      )
    }

    if (providerType === 'saml') {
      return allFilled && formData.entryPoint.trim() !== '' && formData.cert.trim() !== ''
    }

    return false
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setShowErrors(true)

    const validation = runValidation(formData)
    if (hasAnyErrors(validation)) return

    try {
      const providerType = formData.providerType || 'oidc'

      const requestBody: any = {
        providerId: formData.providerId,
        issuer: formData.issuerUrl,
        domain: formData.domain,
        providerType,
        orgId: activeOrganization?.id,
        mapping: { id: 'sub', email: 'email', name: 'name', image: 'picture' },
      }

      if (providerType === 'oidc') {
        requestBody.clientId = formData.clientId
        requestBody.clientSecret = formData.clientSecret
        requestBody.scopes = formData.scopes.split(',').map((s) => s.trim())
      } else if (providerType === 'saml') {
        requestBody.entryPoint = formData.entryPoint
        requestBody.cert = formData.cert
        requestBody.wantAssertionsSigned = formData.wantAssertionsSigned
        if (formData.callbackUrl) requestBody.callbackUrl = formData.callbackUrl
        if (formData.audience) requestBody.audience = formData.audience
        if (formData.idpMetadata) requestBody.idpMetadata = formData.idpMetadata
        requestBody.mapping = {
          id: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
          email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
          name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
        }
      }

      await configureSSOMutation.mutateAsync(requestBody)

      logger.info('SSO provider configured', { providerId: formData.providerId })
      setFormData(DEFAULT_FORM_DATA)
      setErrors(DEFAULT_ERRORS)
      setShowErrors(false)
      setIsEditing(false)
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(message)
      logger.error('Failed to configure SSO provider', { error: err })
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => {
      let processed: any = value
      if (field === 'wantAssertionsSigned' || field === 'showAdvanced') {
        processed = value === 'true'
      }
      const next = { ...prev, [field]: processed }
      if (field === 'providerType') setShowErrors(false)
      runValidation(next)
      return next
    })
  }

  const callbackUrl = `${getBaseUrl()}/api/auth/sso/callback/${formData.providerId || existingProvider?.providerId || 'provider-id'}`

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  const handleEdit = () => {
    if (!existingProvider) return
    try {
      let clientId = ''
      let clientSecret = ''
      let scopes = 'openid,profile,email'
      let entryPoint = ''
      let cert = ''
      let callbackUrlValue = ''
      let audience = ''
      let wantAssertionsSigned = true
      let idpMetadata = ''

      if (existingProvider.providerType === 'oidc' && existingProvider.oidcConfig) {
        const cfg = JSON.parse(existingProvider.oidcConfig)
        clientId = cfg.clientId || ''
        clientSecret = cfg.clientSecret || ''
        scopes = cfg.scopes?.join(',') || 'openid,profile,email'
      } else if (existingProvider.providerType === 'saml' && existingProvider.samlConfig) {
        const cfg = JSON.parse(existingProvider.samlConfig)
        entryPoint = cfg.entryPoint || ''
        cert = cfg.cert || ''
        callbackUrlValue = cfg.callbackUrl || ''
        audience = cfg.audience || ''
        wantAssertionsSigned = cfg.wantAssertionsSigned ?? true
        idpMetadata = cfg.idpMetadata || ''
      }

      setFormData({
        providerType: existingProvider.providerType,
        providerId: existingProvider.providerId,
        issuerUrl: existingProvider.issuer,
        domain: existingProvider.domain,
        clientId,
        clientSecret,
        scopes,
        entryPoint,
        cert,
        callbackUrl: callbackUrlValue,
        audience,
        wantAssertionsSigned,
        idpMetadata,
        showAdvanced: false,
      })
      setIsEditing(true)
      setError(null)
      setShowErrors(false)
    } catch (err) {
      logger.error('Failed to parse provider config', { error: err })
      setError('Failed to load provider configuration')
    }
  }

  if (isLoadingProviders) return <SsoSkeleton />

  if (existingProvider && !isEditing) {
    const providerCallbackUrl = `${getBaseUrl()}/api/auth/sso/callback/${existingProvider.providerId}`

    return (
      <div className='flex h-full flex-col gap-[16px]'>
        <div className='min-h-0 flex-1 overflow-y-auto'>
          <div className='flex flex-col gap-[16px]'>
            <div className='flex flex-col gap-[8px]'>
              <span className='font-medium text-[13px] text-[var(--text-secondary)]'>
                Provider ID
              </span>
              <p className='text-[14px] text-[var(--text-primary)]'>
                {existingProvider.providerId}
              </p>
            </div>

            <div className='flex flex-col gap-[8px]'>
              <span className='font-medium text-[13px] text-[var(--text-secondary)]'>
                Provider Type
              </span>
              <p className='text-[14px] text-[var(--text-primary)]'>
                {existingProvider.providerType.toUpperCase()}
              </p>
            </div>

            <div className='flex flex-col gap-[8px]'>
              <span className='font-medium text-[13px] text-[var(--text-secondary)]'>Domain</span>
              <p className='text-[14px] text-[var(--text-primary)]'>{existingProvider.domain}</p>
            </div>

            <div className='flex flex-col gap-[8px]'>
              <span className='font-medium text-[13px] text-[var(--text-secondary)]'>
                Issuer URL
              </span>
              <p className='break-all font-mono text-[13px] text-[var(--text-primary)]'>
                {existingProvider.issuer}
              </p>
            </div>

            <div className='flex flex-col gap-[8px]'>
              <div className='flex items-center justify-between'>
                <span className='font-medium text-[13px] text-[var(--text-secondary)]'>
                  Callback URL
                </span>
                <Button
                  type='button'
                  variant='ghost'
                  onClick={() => copyToClipboard(providerCallbackUrl)}
                  className='h-[22px] w-[22px] rounded-[4px] p-0 text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                >
                  {copied ? (
                    <Check className='h-[13px] w-[13px]' />
                  ) : (
                    <Clipboard className='h-[13px] w-[13px]' />
                  )}
                  <span className='sr-only'>Copy callback URL</span>
                </Button>
              </div>
              <div className='flex h-9 items-center rounded-[6px] border bg-[var(--surface-1)] px-[10px]'>
                <code className='flex-1 truncate font-mono text-[13px] text-[var(--text-primary)]'>
                  {providerCallbackUrl}
                </code>
              </div>
              <p className='text-[13px] text-[var(--text-muted)]'>
                Configure this in your identity provider
              </p>
            </div>
          </div>
        </div>

        <div className='mt-auto flex items-center justify-end'>
          <Button onClick={handleEdit} variant='tertiary'>
            Edit
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} autoComplete='off' className='flex h-full flex-col gap-[16px]'>
      {/* Hidden honeypot inputs to prevent browser autofill */}
      <input
        type='text'
        name='fakeusernameremembered'
        autoComplete='username'
        style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
        tabIndex={-1}
        readOnly
      />
      <input
        type='password'
        name='fakepasswordremembered'
        autoComplete='current-password'
        style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
        tabIndex={-1}
        readOnly
      />
      <input
        type='email'
        name='fakeemailremembered'
        autoComplete='email'
        style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
        tabIndex={-1}
        readOnly
      />
      <input type='text' name='hidden' style={{ display: 'none' }} autoComplete='false' />

      <div className='min-h-0 flex-1 overflow-y-auto'>
        <div className='flex flex-col gap-[16px]'>
          {/* Provider Type */}
          <div className='flex flex-col gap-[8px]'>
            <span className='font-medium text-[13px] text-[var(--text-secondary)]'>
              Provider Type
            </span>
            <Combobox
              value={formData.providerType}
              onChange={(value: string) =>
                handleInputChange('providerType', value as 'oidc' | 'saml')
              }
              options={[
                { label: 'OIDC', value: 'oidc' },
                { label: 'SAML', value: 'saml' },
              ]}
              placeholder='Select provider type'
              editable={false}
              className='h-9'
            />
            <p className='text-[13px] text-[var(--text-muted)]'>
              {formData.providerType === 'oidc'
                ? 'OpenID Connect (Okta, Azure AD, Auth0, etc.)'
                : 'Security Assertion Markup Language (ADFS, Shibboleth, etc.)'}
            </p>
          </div>

          {/* Provider ID */}
          <div className='flex flex-col gap-[8px]'>
            <span className='font-medium text-[13px] text-[var(--text-secondary)]'>
              Provider ID
            </span>
            <Combobox
              value={formData.providerId}
              onChange={(value: string) => handleInputChange('providerId', value)}
              options={SSO_TRUSTED_PROVIDERS.map((id) => ({ label: id, value: id }))}
              placeholder='Select a provider ID'
              editable={true}
              className={cn(
                'h-9',
                showErrors &&
                  errors.providerId.length > 0 &&
                  'border-[var(--text-error)] focus:border-[var(--text-error)]'
              )}
            />
            {showErrors && errors.providerId.length > 0 && (
              <p className='text-[#DC2626] text-[11px] leading-tight dark:text-[#F87171]'>
                {errors.providerId.join(' ')}
              </p>
            )}
          </div>

          {/* Issuer URL */}
          <div className='flex flex-col gap-[8px]'>
            <span className='font-medium text-[13px] text-[var(--text-secondary)]'>Issuer URL</span>
            <Input
              type='url'
              placeholder='https://your-identity-provider.com/oauth2/default'
              value={formData.issuerUrl}
              name='sso_issuer_endpoint'
              autoComplete='off'
              autoCapitalize='none'
              spellCheck={false}
              readOnly
              onFocus={(e) => e.target.removeAttribute('readOnly')}
              onChange={(e) => handleInputChange('issuerUrl', e.target.value)}
              className={cn(
                'h-9',
                showErrors &&
                  errors.issuerUrl.length > 0 &&
                  'border-[var(--text-error)] focus:border-[var(--text-error)]'
              )}
            />
            {showErrors && errors.issuerUrl.length > 0 && (
              <p className='text-[#DC2626] text-[11px] leading-tight dark:text-[#F87171]'>
                {errors.issuerUrl.join(' ')}
              </p>
            )}
          </div>

          {/* Domain */}
          <div className='flex flex-col gap-[8px]'>
            <span className='font-medium text-[13px] text-[var(--text-secondary)]'>
              Email Domain
            </span>
            <Input
              type='text'
              placeholder='yourcompany.com'
              value={formData.domain}
              name='sso_identity_domain'
              autoComplete='off'
              autoCapitalize='none'
              spellCheck={false}
              readOnly
              onFocus={(e) => e.target.removeAttribute('readOnly')}
              onChange={(e) => handleInputChange('domain', e.target.value)}
              className={cn(
                'h-9',
                showErrors &&
                  errors.domain.length > 0 &&
                  'border-[var(--text-error)] focus:border-[var(--text-error)]'
              )}
            />
            <p className='text-[13px] text-[var(--text-muted)]'>
              The email address domain of users who will sign in (e.g. yourcompany.com)
            </p>
            {showErrors && errors.domain.length > 0 && (
              <p className='text-[#DC2626] text-[11px] leading-tight dark:text-[#F87171]'>
                {errors.domain.join(' ')}
              </p>
            )}
          </div>

          {/* OIDC fields */}
          {formData.providerType === 'oidc' ? (
            <>
              <div className='flex flex-col gap-[8px]'>
                <span className='font-medium text-[13px] text-[var(--text-secondary)]'>
                  Client ID
                </span>
                <Input
                  type='text'
                  placeholder='Enter Client ID'
                  value={formData.clientId}
                  name='sso_client_identifier'
                  autoComplete='off'
                  autoCapitalize='none'
                  spellCheck={false}
                  readOnly
                  onFocus={(e) => e.target.removeAttribute('readOnly')}
                  onChange={(e) => handleInputChange('clientId', e.target.value)}
                  className={cn(
                    'h-9',
                    showErrors &&
                      errors.clientId.length > 0 &&
                      'border-[var(--text-error)] focus:border-[var(--text-error)]'
                  )}
                />
                {showErrors && errors.clientId.length > 0 && (
                  <p className='text-[#DC2626] text-[11px] leading-tight dark:text-[#F87171]'>
                    {errors.clientId.join(' ')}
                  </p>
                )}
              </div>

              <div className='flex flex-col gap-[8px]'>
                <span className='font-medium text-[13px] text-[var(--text-secondary)]'>
                  Client Secret
                </span>
                <div className='relative'>
                  <Input
                    type='text'
                    placeholder='Enter Client Secret'
                    value={formData.clientSecret}
                    name='sso_client_key'
                    autoComplete='off'
                    autoCapitalize='none'
                    spellCheck={false}
                    readOnly
                    onFocus={(e) => {
                      e.target.removeAttribute('readOnly')
                      setShowClientSecret(true)
                    }}
                    onBlurCapture={() => setShowClientSecret(false)}
                    onChange={(e) => handleInputChange('clientSecret', e.target.value)}
                    style={
                      !showClientSecret
                        ? ({ WebkitTextSecurity: 'disc' } as React.CSSProperties)
                        : undefined
                    }
                    className={cn(
                      'h-9 pr-[36px]',
                      showErrors &&
                        errors.clientSecret.length > 0 &&
                        'border-[var(--text-error)] focus:border-[var(--text-error)]'
                    )}
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    onClick={() => setShowClientSecret((s) => !s)}
                    className='-translate-y-1/2 absolute top-1/2 right-[8px] h-6 w-6 p-0 text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    aria-label={showClientSecret ? 'Hide client secret' : 'Show client secret'}
                  >
                    {showClientSecret ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </Button>
                </div>
                {showErrors && errors.clientSecret.length > 0 && (
                  <p className='text-[#DC2626] text-[11px] leading-tight dark:text-[#F87171]'>
                    {errors.clientSecret.join(' ')}
                  </p>
                )}
              </div>

              <div className='flex flex-col gap-[8px]'>
                <span className='font-medium text-[13px] text-[var(--text-secondary)]'>Scopes</span>
                <Input
                  type='text'
                  placeholder='openid,profile,email'
                  value={formData.scopes}
                  autoComplete='off'
                  autoCapitalize='none'
                  spellCheck={false}
                  onChange={(e) => handleInputChange('scopes', e.target.value)}
                  className={cn(
                    'h-9',
                    showErrors &&
                      errors.scopes.length > 0 &&
                      'border-[var(--text-error)] focus:border-[var(--text-error)]'
                  )}
                />
                {showErrors && errors.scopes.length > 0 && (
                  <p className='text-[#DC2626] text-[11px] leading-tight dark:text-[#F87171]'>
                    {errors.scopes.join(' ')}
                  </p>
                )}
                <p className='text-[13px] text-[var(--text-muted)]'>
                  Comma-separated list of OIDC scopes to request
                </p>
              </div>
            </>
          ) : (
            <>
              <div className='flex flex-col gap-[8px]'>
                <span className='font-medium text-[13px] text-[var(--text-secondary)]'>
                  Entry Point URL
                </span>
                <Input
                  type='url'
                  placeholder='https://idp.example.com/sso/saml'
                  value={formData.entryPoint}
                  autoComplete='off'
                  autoCapitalize='none'
                  spellCheck={false}
                  onChange={(e) => handleInputChange('entryPoint', e.target.value)}
                  className={cn(
                    'h-9',
                    showErrors &&
                      errors.entryPoint.length > 0 &&
                      'border-[var(--text-error)] focus:border-[var(--text-error)]'
                  )}
                />
                {showErrors && errors.entryPoint.length > 0 && (
                  <p className='text-[#DC2626] text-[11px] leading-tight dark:text-[#F87171]'>
                    {errors.entryPoint.join(' ')}
                  </p>
                )}
              </div>

              <div className='flex flex-col gap-[8px]'>
                <span className='font-medium text-[13px] text-[var(--text-secondary)]'>
                  Identity Provider Certificate
                </span>
                <Textarea
                  placeholder='-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----'
                  value={formData.cert}
                  autoComplete='off'
                  autoCapitalize='none'
                  spellCheck={false}
                  onChange={(e) => handleInputChange('cert', e.target.value)}
                  className={cn(
                    'min-h-[80px] font-mono',
                    showErrors &&
                      errors.cert.length > 0 &&
                      'border-[var(--text-error)] focus:border-[var(--text-error)]'
                  )}
                  rows={3}
                />
                {showErrors && errors.cert.length > 0 && (
                  <p className='text-[#DC2626] text-[11px] leading-tight dark:text-[#F87171]'>
                    {errors.cert.join(' ')}
                  </p>
                )}
              </div>

              <div className='flex flex-col gap-[8px]'>
                <button
                  type='button'
                  onClick={() =>
                    handleInputChange('showAdvanced', formData.showAdvanced ? 'false' : 'true')
                  }
                  className='flex w-fit items-center gap-[6px] text-[13px] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                >
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform',
                      formData.showAdvanced && 'rotate-180'
                    )}
                  />
                  Advanced Options
                </button>

                {formData.showAdvanced && (
                  <div className='flex flex-col gap-[16px] pt-[8px]'>
                    <div className='flex flex-col gap-[8px]'>
                      <span className='font-medium text-[13px] text-[var(--text-secondary)]'>
                        Audience (Entity ID)
                      </span>
                      <Input
                        type='text'
                        placeholder='Enter Audience'
                        value={formData.audience}
                        autoComplete='off'
                        autoCapitalize='none'
                        spellCheck={false}
                        onChange={(e) => handleInputChange('audience', e.target.value)}
                        className='h-9'
                      />
                    </div>

                    <div className='flex flex-col gap-[8px]'>
                      <span className='font-medium text-[13px] text-[var(--text-secondary)]'>
                        Callback URL Override
                      </span>
                      <Input
                        type='url'
                        placeholder='Enter Callback URL'
                        value={formData.callbackUrl}
                        autoComplete='off'
                        autoCapitalize='none'
                        spellCheck={false}
                        onChange={(e) => handleInputChange('callbackUrl', e.target.value)}
                        className='h-9'
                      />
                    </div>

                    <div className='flex flex-col gap-[8px]'>
                      <span className='font-medium text-[13px] text-[var(--text-secondary)]'>
                        Require signed SAML assertions
                      </span>
                      <Switch
                        checked={formData.wantAssertionsSigned}
                        onCheckedChange={(checked) =>
                          handleInputChange('wantAssertionsSigned', checked ? 'true' : 'false')
                        }
                      />
                    </div>

                    <div className='flex flex-col gap-[8px]'>
                      <span className='font-medium text-[13px] text-[var(--text-secondary)]'>
                        IDP Metadata XML
                      </span>
                      <Textarea
                        placeholder='Paste IDP metadata XML here (optional)'
                        value={formData.idpMetadata}
                        autoComplete='off'
                        autoCapitalize='none'
                        spellCheck={false}
                        onChange={(e) => handleInputChange('idpMetadata', e.target.value)}
                        className='min-h-[60px] font-mono'
                        rows={2}
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Callback URL display */}
          <div className='flex flex-col gap-[8px]'>
            <div className='flex items-center justify-between'>
              <span className='font-medium text-[13px] text-[var(--text-secondary)]'>
                Callback URL
              </span>
              <Button
                type='button'
                variant='ghost'
                onClick={() => copyToClipboard(callbackUrl)}
                className='h-[22px] w-[22px] rounded-[4px] p-0 text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              >
                {copied ? (
                  <Check className='h-[13px] w-[13px]' />
                ) : (
                  <Clipboard className='h-[13px] w-[13px]' />
                )}
                <span className='sr-only'>Copy callback URL</span>
              </Button>
            </div>
            <div className='flex h-9 items-center rounded-[6px] border bg-[var(--surface-1)] px-[10px]'>
              <code className='flex-1 truncate font-mono text-[13px] text-[var(--text-primary)]'>
                {callbackUrl}
              </code>
            </div>
            <p className='text-[13px] text-[var(--text-muted)]'>
              Configure this in your identity provider
            </p>
          </div>
        </div>
      </div>

      <div className='mt-auto flex items-center justify-end gap-[8px]'>
        {error && <p className='mr-auto text-[12px] text-[var(--text-error)]'>{error}</p>}
        <Button
          type='submit'
          variant='tertiary'
          disabled={configureSSOMutation.isPending || hasAnyErrors(errors) || !isFormValid()}
        >
          {configureSSOMutation.isPending
            ? isEditing
              ? 'Updating...'
              : 'Saving...'
            : isEditing
              ? 'Update'
              : 'Save'}
        </Button>
      </div>
    </form>
  )
}

function SsoSkeleton() {
  return (
    <div className='flex h-full flex-col gap-[16px]'>
      <div className='min-h-0 flex-1 overflow-y-auto'>
        <div className='flex flex-col gap-[16px]'>
          {[80, 70, 60, 50, 60, 80].map((w, i) => (
            <div key={i} className='flex flex-col gap-[8px]'>
              <Skeleton className={`h-[13px] w-[${w}px]`} />
              <Skeleton className='h-9 w-full' />
            </div>
          ))}
        </div>
      </div>
      <div className='mt-auto flex items-center justify-end'>
        <Skeleton className='h-9 w-[60px]' />
      </div>
    </div>
  )
}
