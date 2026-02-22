/**
 * SSO provider identifiers grouped by vendor for maintainability.
 * The flat export is derived automatically from this registry.
 */
const SSO_PROVIDER_REGISTRY = {
  okta: ['okta', 'okta-saml', 'okta-prod', 'okta-dev', 'okta-staging', 'okta-test'],
  azure: ['azure-ad', 'azure-active-directory', 'azure-corp', 'azure-enterprise'],
  adfs: ['adfs', 'adfs-company', 'adfs-corp', 'adfs-enterprise'],
  auth0: ['auth0', 'auth0-prod', 'auth0-dev', 'auth0-staging'],
  onelogin: ['onelogin', 'onelogin-prod', 'onelogin-corp'],
  jumpcloud: ['jumpcloud', 'jumpcloud-prod', 'jumpcloud-corp'],
  ping: ['ping-identity', 'ping-federate', 'pingone'],
  shibboleth: ['shibboleth', 'shibboleth-idp'],
  google: ['google-workspace', 'google-sso'],
  saml: ['saml', 'saml2', 'saml-sso'],
  oidc: ['oidc', 'oidc-sso', 'openid-connect'],
  generic: ['custom-sso', 'enterprise-sso', 'company-sso'],
} as const

/**
 * Recognised SSO provider identifiers used for validation and autocomplete.
 * Derived from the vendor registry to ensure consistency.
 */
export const SSO_TRUSTED_PROVIDERS: string[] = Object.values(SSO_PROVIDER_REGISTRY).flat()
