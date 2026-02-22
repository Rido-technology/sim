import postgres from 'postgres'

const sql = postgres('postgresql://postgres:postgres@localhost:5432/simstudio')

const rows = await sql`
  SELECT id, provider_id, domain, issuer, oidc_config, saml_config, user_id, organization_id
  FROM sso_provider
  ORDER BY id DESC
  LIMIT 5
`

console.log('Total rows found:', rows.length)

for (const r of rows) {
  const oidc = r.oidc_config ? JSON.parse(r.oidc_config) : null
  const saml = r.saml_config ? JSON.parse(r.saml_config) : null
  const providerType = oidc ? 'oidc' : saml ? 'saml' : 'unknown'
  console.log('\n--- provider ---')
  console.log('id                :', r.id)
  console.log('providerId        :', r.provider_id)
  console.log('domain            :', r.domain)
  console.log('issuer            :', r.issuer)
  console.log('userId            :', r.user_id)
  console.log('organizationId    :', r.organization_id)
  console.log('providerType      :', providerType)
  if (oidc) {
    console.log('clientId          :', oidc.clientId)
    console.log('clientSecret ok   :', !!oidc.clientSecret)
    console.log('pkce              :', oidc.pkce)
    console.log('scopes            :', oidc.scopes)
    console.log('authorizationEP   :', oidc.authorizationEndpoint)
    console.log('tokenEndpoint     :', oidc.tokenEndpoint)
    console.log('userInfoEndpoint  :', oidc.userInfoEndpoint)
    console.log('jwksEndpoint      :', oidc.jwksEndpoint)
  } else if (saml) {
    console.log('entryPoint        :', saml.entryPoint)
    console.log('cert ok           :', !!saml.cert)
    console.log('callbackUrl       :', saml.callbackUrl)
  } else {
    console.log('config            : (empty)')
  }
}

await sql.end()
