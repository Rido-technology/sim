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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

type FormData = typeof DEFAULT_FORM_DATA
type FieldErrors = Record<string, string[]>

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

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

const EMPTY_ERRORS: FieldErrors = {
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

// ---------------------------------------------------------------------------
// Validation helpers (pure – no state dependencies)
// ---------------------------------------------------------------------------

function validateProviderId(value: string): string[] {
  if (!value?.trim()) return ['Provider ID is required.']
  if (!/^[-a-z0-9]+$/i.test(value.trim())) return ['Use letters, numbers, and dashes only.']
  return []
}

function validateUrl(value: string, label: string): string[] {
  if (!value?.trim()) return [`${label} is required.`]
  try {
    const url = new URL(value.trim())
    const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
    if (url.protocol !== 'https:' && !isLocal) return [`${label} must use HTTPS.`]
  } catch {
    return [`Enter a valid URL for ${label}.`]
  }
  return []
}

function validateDomain(value: string): string[] {
  if (!value?.trim()) return ['Domain is required.']
  const t = value.trim()
  const out: string[] = []
  if (/^https?:\/\//i.test(t)) out.push('Do not include protocol (https://).')
  if (!/^[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(t))
    out.push('Enter the email domain of your users, e.g. yourcompany.com')
  return out
}

function validateRequired(label: string, value: string): string[] {
  return value?.trim() ? [] : [`${label} is required.`]
}

function runValidation(data: FormData): FieldErrors {
  const type = data.providerType || 'oidc'
  const base: FieldErrors = {
    ...EMPTY_ERRORS,
    providerId: validateProviderId(data.providerId),
    issuerUrl: validateUrl(data.issuerUrl, 'Issuer URL'),
    domain: validateDomain(data.domain),
  }

  if (type === 'oidc') {
    base.clientId = validateRequired('Client ID', data.clientId)
    base.clientSecret = validateRequired('Client Secret', data.clientSecret)
    if (!data.scopes?.trim()) base.scopes = ['Scopes are required for OIDC providers']
  } else {
    base.entryPoint = validateUrl(data.entryPoint, 'Entry Point URL')
    base.cert = validateRequired('Certificate', data.cert)
  }

  return base
}

function hasAnyErrors(errs: FieldErrors): boolean {
  return Object.values(errs).some((l) => l.length > 0)
}

function isFormValid(data: FormData): boolean {
  const baseFilled = ['providerId', 'issuerUrl', 'domain'].every(
    (f) => typeof data[f as keyof FormData] === 'string' && (data[f as keyof FormData] as string).trim() !== ''
  )
  if (!baseFilled) return false
  return data.providerType === 'oidc'
    ? data.clientId.trim() !== '' && data.clientSecret.trim() !== '' && data.scopes.trim() !== ''
    : data.entryPoint.trim() !== '' && data.cert.trim() !== ''
}

// ---------------------------------------------------------------------------
// Payload / config parsers
// ---------------------------------------------------------------------------

function buildSubmitPayload(data: FormData, orgId?: string): Record<string, unknown> {
  const type = data.providerType || 'oidc'
  const payload: Record<string, unknown> = {
    providerId: data.providerId,
    issuer: data.issuerUrl,
    domain: data.domain,
    providerType: type,
    orgId,
    mapping: { id: 'sub', email: 'email', name: 'name', image: 'picture' },
  }

  if (type === 'oidc') {
    payload.clientId = data.clientId
    payload.clientSecret = data.clientSecret
    payload.scopes = data.scopes.split(',').map((s) => s.trim())
  } else {
    payload.entryPoint = data.entryPoint
    payload.cert = data.cert
    payload.wantAssertionsSigned = data.wantAssertionsSigned
    if (data.callbackUrl) payload.callbackUrl = data.callbackUrl
    if (data.audience) payload.audience = data.audience
    if (data.idpMetadata) payload.idpMetadata = data.idpMetadata
    payload.mapping = {
      id: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
      email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
      name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
    }
  }

  return payload
}

function parseProviderConfig(provider: SSOProvider): FormData {
  let clientId = ''
  let clientSecret = ''
  let scopes = 'openid,profile,email'
  let entryPoint = ''
  let cert = ''
  let callbackUrl = ''
  let audience = ''
  let wantAssertionsSigned = true
  let idpMetadata = ''

  if (provider.providerType === 'oidc' && provider.oidcConfig) {
    const cfg = JSON.parse(provider.oidcConfig)
    clientId = cfg.clientId || ''
    clientSecret = cfg.clientSecret || ''
    scopes = cfg.scopes?.join(',') || 'openid,profile,email'
  } else if (provider.providerType === 'saml' && provider.samlConfig) {
    const cfg = JSON.parse(provider.samlConfig)
    entryPoint = cfg.entryPoint || ''
    cert = cfg.cert || ''
    callbackUrl = cfg.callbackUrl || ''
    audience = cfg.audience || ''
    wantAssertionsSigned = cfg.wantAssertionsSigned ?? true
    idpMetadata = cfg.idpMetadata || ''
  }

  return {
    providerType: provider.providerType,
    providerId: provider.providerId,
    issuerUrl: provider.issuer,
    domain: provider.domain,
    clientId,
    clientSecret,
    scopes,
    entryPoint,
    cert,
    callbackUrl,
    audience,
    wantAssertionsSigned,
    idpMetadata,
    showAdvanced: false,
  }
}

// ---------------------------------------------------------------------------
// SsoFieldGroup – reusable field wrapper
// ---------------------------------------------------------------------------

interface SsoFieldGroupProps {
  label: string
  hint?: string
  errors?: string[]
  showErrors?: boolean
  children: React.ReactNode
}

function SsoFieldGroup({ label, hint, errors = [], showErrors, children }: SsoFieldGroupProps) {
  return (
    <div className='flex flex-col gap-[8px]'>
      <span className='font-medium text-[13px] text-[var(--text-secondary)]'>{label}</span>
      {children}
      {hint && <p className='text-[13px] text-[var(--text-muted)]'>{hint}</p>}
      {showErrors && errors.length > 0 && (
        <p className='text-[#DC2626] text-[11px] leading-tight dark:text-[#F87171]'>
          {errors.join(' ')}
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// CallbackUrlRow – shared display for callback URLs
// ---------------------------------------------------------------------------

interface CallbackUrlRowProps {
  url: string
  copied: boolean
  onCopy: (url: string) => void
}

function CallbackUrlRow({ url, copied, onCopy }: CallbackUrlRowProps) {
  return (
    <div className='flex flex-col gap-[8px]'>
      <div className='flex items-center justify-between'>
        <span className='font-medium text-[13px] text-[var(--text-secondary)]'>Callback URL</span>
        <Button
          type='button'
          variant='ghost'
          onClick={() => onCopy(url)}
          className='h-[22px] w-[22px] rounded-[4px] p-0 text-[var(--text-muted)] hover:text-[var(--text-primary)]'
        >
          {copied ? <Check className='h-[13px] w-[13px]' /> : <Clipboard className='h-[13px] w-[13px]' />}
          <span className='sr-only'>Copy callback URL</span>
        </Button>
      </div>
      <div className='flex h-9 items-center rounded-[6px] border bg-[var(--surface-1)] px-[10px]'>
        <code className='flex-1 truncate font-mono text-[13px] text-[var(--text-primary)]'>{url}</code>
      </div>
      <p className='text-[13px] text-[var(--text-muted)]'>Configure this in your identity provider</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// OidcFields
// ---------------------------------------------------------------------------

interface OidcFieldsProps {
  formData: FormData
  errors: FieldErrors
  showErrors: boolean
  showClientSecret: boolean
  onShowSecretToggle: () => void
  onFocusSecret: () => void
  onBlurSecret: () => void
  onChange: (field: keyof FormData, value: string) => void
}

function OidcFields({
  formData,
  errors,
  showErrors,
  showClientSecret,
  onShowSecretToggle,
  onFocusSecret,
  onBlurSecret,
  onChange,
}: OidcFieldsProps) {
  return (
    <>
      <SsoFieldGroup label='Client ID' errors={errors.clientId} showErrors={showErrors}>
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
          onChange={(e) => onChange('clientId', e.target.value)}
          className={cn('h-9', showErrors && errors.clientId.length > 0 && 'border-[var(--text-error)] focus:border-[var(--text-error)]')}
        />
      </SsoFieldGroup>

      <SsoFieldGroup label='Client Secret' errors={errors.clientSecret} showErrors={showErrors}>
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
            onFocus={(e) => { e.target.removeAttribute('readOnly'); onFocusSecret() }}
            onBlurCapture={onBlurSecret}
            onChange={(e) => onChange('clientSecret', e.target.value)}
            style={!showClientSecret ? ({ WebkitTextSecurity: 'disc' } as React.CSSProperties) : undefined}
            className={cn('h-9 pr-[36px]', showErrors && errors.clientSecret.length > 0 && 'border-[var(--text-error)] focus:border-[var(--text-error)]')}
          />
          <Button
            type='button'
            variant='ghost'
            onClick={onShowSecretToggle}
            className='-translate-y-1/2 absolute top-1/2 right-[8px] h-6 w-6 p-0 text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            aria-label={showClientSecret ? 'Hide client secret' : 'Show client secret'}
          >
            {showClientSecret ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
          </Button>
        </div>
      </SsoFieldGroup>

      <SsoFieldGroup
        label='Scopes'
        errors={errors.scopes}
        showErrors={showErrors}
        hint='Comma-separated list of OIDC scopes to request'
      >
        <Input
          type='text'
          placeholder='openid,profile,email'
          value={formData.scopes}
          autoComplete='off'
          autoCapitalize='none'
          spellCheck={false}
          onChange={(e) => onChange('scopes', e.target.value)}
          className={cn('h-9', showErrors && errors.scopes.length > 0 && 'border-[var(--text-error)] focus:border-[var(--text-error)]')}
        />
      </SsoFieldGroup>
    </>
  )
}

// ---------------------------------------------------------------------------
// SamlFields
// ---------------------------------------------------------------------------

interface SamlFieldsProps {
  formData: FormData
  errors: FieldErrors
  showErrors: boolean
  onChange: (field: keyof FormData, value: string) => void
}

function SamlFields({ formData, errors, showErrors, onChange }: SamlFieldsProps) {
  return (
    <>
      <SsoFieldGroup label='Entry Point URL' errors={errors.entryPoint} showErrors={showErrors}>
        <Input
          type='url'
          placeholder='https://idp.example.com/sso/saml'
          value={formData.entryPoint}
          autoComplete='off'
          autoCapitalize='none'
          spellCheck={false}
          onChange={(e) => onChange('entryPoint', e.target.value)}
          className={cn('h-9', showErrors && errors.entryPoint.length > 0 && 'border-[var(--text-error)] focus:border-[var(--text-error)]')}
        />
      </SsoFieldGroup>

      <SsoFieldGroup label='Identity Provider Certificate' errors={errors.cert} showErrors={showErrors}>
        <Textarea
          placeholder={'-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----'}
          value={formData.cert}
          autoComplete='off'
          autoCapitalize='none'
          spellCheck={false}
          onChange={(e) => onChange('cert', e.target.value)}
          className={cn('min-h-[80px] font-mono', showErrors && errors.cert.length > 0 && 'border-[var(--text-error)] focus:border-[var(--text-error)]')}
          rows={3}
        />
      </SsoFieldGroup>

      <div className='flex flex-col gap-[8px]'>
        <button
          type='button'
          onClick={() => onChange('showAdvanced', formData.showAdvanced ? 'false' : 'true')}
          className='flex w-fit items-center gap-[6px] text-[13px] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
        >
          <ChevronDown className={cn('h-4 w-4 transition-transform', formData.showAdvanced && 'rotate-180')} />
          Advanced Options
        </button>

        {formData.showAdvanced && (
          <div className='flex flex-col gap-[16px] pt-[8px]'>
            <SsoFieldGroup label='Audience (Entity ID)'>
              <Input
                type='text'
                placeholder='Enter Audience'
                value={formData.audience}
                autoComplete='off'
                autoCapitalize='none'
                spellCheck={false}
                onChange={(e) => onChange('audience', e.target.value)}
                className='h-9'
              />
            </SsoFieldGroup>

            <SsoFieldGroup label='Callback URL Override'>
              <Input
                type='url'
                placeholder='Enter Callback URL'
                value={formData.callbackUrl}
                autoComplete='off'
                autoCapitalize='none'
                spellCheck={false}
                onChange={(e) => onChange('callbackUrl', e.target.value)}
                className='h-9'
              />
            </SsoFieldGroup>

            <SsoFieldGroup label='Require signed SAML assertions'>
              <Switch
                checked={formData.wantAssertionsSigned}
                onCheckedChange={(checked) => onChange('wantAssertionsSigned', checked ? 'true' : 'false')}
              />
            </SsoFieldGroup>

            <SsoFieldGroup label='IDP Metadata XML'>
              <Textarea
                placeholder='Paste IDP metadata XML here (optional)'
                value={formData.idpMetadata}
                autoComplete='off'
                autoCapitalize='none'
                spellCheck={false}
                onChange={(e) => onChange('idpMetadata', e.target.value)}
                className='min-h-[60px] font-mono'
                rows={2}
              />
            </SsoFieldGroup>
          </div>
        )}
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// SsoProviderView – read-only existing-provider display
// ---------------------------------------------------------------------------

interface SsoProviderViewProps {
  provider: SSOProvider
  copied: boolean
  onCopy: (url: string) => void
  onEdit: () => void
}

function SsoProviderView({ provider, copied, onCopy, onEdit }: SsoProviderViewProps) {
  const providerCallbackUrl = `${getBaseUrl()}/api/auth/sso/callback/${provider.providerId}`

  const fields: Array<{ label: string; value: string; mono?: boolean }> = [
    { label: 'Provider ID', value: provider.providerId },
    { label: 'Provider Type', value: provider.providerType.toUpperCase() },
    { label: 'Domain', value: provider.domain },
    { label: 'Issuer URL', value: provider.issuer, mono: true },
  ]

  return (
    <div className='flex h-full flex-col gap-[16px]'>
      <div className='min-h-0 flex-1 overflow-y-auto'>
        <div className='flex flex-col gap-[16px]'>
          {fields.map(({ label, value, mono }) => (
            <div key={label} className='flex flex-col gap-[8px]'>
              <span className='font-medium text-[13px] text-[var(--text-secondary)]'>{label}</span>
              <p className={cn('text-[14px] text-[var(--text-primary)]', mono && 'break-all font-mono text-[13px]')}>
                {value}
              </p>
            </div>
          ))}
          <CallbackUrlRow url={providerCallbackUrl} copied={copied} onCopy={onCopy} />
        </div>
      </div>
      <div className='mt-auto flex items-center justify-end'>
        <Button onClick={onEdit} variant='tertiary'>Edit</Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// SsoSkeleton
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// SSO – main exported component
// ---------------------------------------------------------------------------

export function SSO() {
  const { data: session } = useSession()
  const { data: orgsData } = useOrganizations()
  const { data: subscriptionData } = useSubscriptionData()
  const { data: providersData, isLoading: isLoadingProviders } = useSSOProviders()

  const activeOrganization = orgsData?.activeOrganization
  const providers = (providersData as { providers?: SSOProvider[] } | undefined)?.providers || []
  const existingProvider = providers[0] as SSOProvider | undefined

  const userEmail = session?.user?.email
  const userId = session?.user?.id
  const userRole = getUserRole(orgsData?.activeOrganization, userEmail)
  const canManageSSO = userRole === 'owner' || userRole === 'admin'
  const subscriptionStatus = getSubscriptionStatus(subscriptionData?.data)

  const isSSOProviderOwner =
    !isBillingEnabled && userId ? providers.some((p: any) => p.userId === userId) : null

  const configureSSOMutation = useConfigureSSO()

  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA)
  const [errors, setErrors] = useState<FieldErrors>(EMPTY_ERRORS)
  const [showErrors, setShowErrors] = useState(false)
  const [showClientSecret, setShowClientSecret] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

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

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => {
      const processed: unknown = field === 'wantAssertionsSigned' || field === 'showAdvanced'
        ? value === 'true'
        : value
      const next = { ...prev, [field]: processed } as FormData
      if (field === 'providerType') setShowErrors(false)
      setErrors(runValidation(next))
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setShowErrors(true)

    const validation = runValidation(formData)
    setErrors(validation)
    if (hasAnyErrors(validation)) return

    try {
      const payload = buildSubmitPayload(formData, activeOrganization?.id)
      await configureSSOMutation.mutateAsync(payload as any)
      logger.info('SSO provider configured', { providerId: formData.providerId })
      setFormData(DEFAULT_FORM_DATA)
      setErrors(EMPTY_ERRORS)
      setShowErrors(false)
      setIsEditing(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred'
      setSubmitError(message)
      logger.error('Failed to configure SSO provider', { error: err })
    }
  }

  const handleEdit = () => {
    if (!existingProvider) return
    try {
      setFormData(parseProviderConfig(existingProvider))
      setIsEditing(true)
      setSubmitError(null)
      setShowErrors(false)
    } catch (err) {
      logger.error('Failed to parse provider config', { error: err })
      setSubmitError('Failed to load provider configuration')
    }
  }

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  if (isLoadingProviders) return <SsoSkeleton />

  if (existingProvider && !isEditing) {
    return <SsoProviderView provider={existingProvider} copied={copied} onCopy={copyToClipboard} onEdit={handleEdit} />
  }

  const callbackUrl = `${getBaseUrl()}/api/auth/sso/callback/${formData.providerId || existingProvider?.providerId || 'provider-id'}`

  return (
    <form onSubmit={handleSubmit} autoComplete='off' className='flex h-full flex-col gap-[16px]'>
      {/* Honeypot inputs to prevent browser autofill */}
      <input type='text' name='fakeusernameremembered' autoComplete='username' style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }} tabIndex={-1} readOnly />
      <input type='password' name='fakepasswordremembered' autoComplete='current-password' style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }} tabIndex={-1} readOnly />
      <input type='email' name='fakeemailremembered' autoComplete='email' style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }} tabIndex={-1} readOnly />
      <input type='text' name='hidden' style={{ display: 'none' }} autoComplete='false' />

      <div className='min-h-0 flex-1 overflow-y-auto'>
        <div className='flex flex-col gap-[16px]'>
          <SsoFieldGroup label='Provider Type'>
            <Combobox
              value={formData.providerType}
              onChange={(value: string) => handleInputChange('providerType', value as 'oidc' | 'saml')}
              options={[{ label: 'OIDC', value: 'oidc' }, { label: 'SAML', value: 'saml' }]}
              placeholder='Select provider type'
              editable={false}
              className='h-9'
            />
            <p className='text-[13px] text-[var(--text-muted)]'>
              {formData.providerType === 'oidc'
                ? 'OpenID Connect (Okta, Azure AD, Auth0, etc.)'
                : 'Security Assertion Markup Language (ADFS, Shibboleth, etc.)'}
            </p>
          </SsoFieldGroup>

          <SsoFieldGroup label='Provider ID' errors={errors.providerId} showErrors={showErrors}>
            <Combobox
              value={formData.providerId}
              onChange={(value: string) => handleInputChange('providerId', value)}
              options={SSO_TRUSTED_PROVIDERS.map((id) => ({ label: id, value: id }))}
              placeholder='Select a provider ID'
              editable={true}
              className={cn('h-9', showErrors && errors.providerId.length > 0 && 'border-[var(--text-error)] focus:border-[var(--text-error)]')}
            />
          </SsoFieldGroup>

          <SsoFieldGroup label='Issuer URL' errors={errors.issuerUrl} showErrors={showErrors}>
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
              className={cn('h-9', showErrors && errors.issuerUrl.length > 0 && 'border-[var(--text-error)] focus:border-[var(--text-error)]')}
            />
          </SsoFieldGroup>

          <SsoFieldGroup
            label='Email Domain'
            hint='The email address domain of users who will sign in (e.g. yourcompany.com)'
            errors={errors.domain}
            showErrors={showErrors}
          >
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
              className={cn('h-9', showErrors && errors.domain.length > 0 && 'border-[var(--text-error)] focus:border-[var(--text-error)]')}
            />
          </SsoFieldGroup>

          {formData.providerType === 'oidc' ? (
            <OidcFields
              formData={formData}
              errors={errors}
              showErrors={showErrors}
              showClientSecret={showClientSecret}
              onShowSecretToggle={() => setShowClientSecret((s) => !s)}
              onFocusSecret={() => setShowClientSecret(true)}
              onBlurSecret={() => setShowClientSecret(false)}
              onChange={handleInputChange}
            />
          ) : (
            <SamlFields formData={formData} errors={errors} showErrors={showErrors} onChange={handleInputChange} />
          )}

          <CallbackUrlRow url={callbackUrl} copied={copied} onCopy={copyToClipboard} />
        </div>
      </div>

      <div className='mt-auto flex items-center justify-end gap-[8px]'>
        {submitError && <p className='mr-auto text-[12px] text-[var(--text-error)]'>{submitError}</p>}
        <Button
          type='submit'
          variant='tertiary'
          disabled={configureSSOMutation.isPending || hasAnyErrors(errors) || !isFormValid(formData)}
        >
          {configureSSOMutation.isPending
            ? isEditing ? 'Updating...' : 'Saving...'
            : isEditing ? 'Update' : 'Save'}
        </Button>
      </div>
    </form>
  )
}