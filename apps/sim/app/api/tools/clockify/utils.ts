const CLOCKIFY_BASE = 'https://api.clockify.me/api/v1'

/**
 * Makes an authenticated request to the Clockify API.
 */
export async function clockifyFetch(
  path: string,
  apiKey: string,
  method = 'GET',
  body?: unknown
): Promise<unknown> {
  const fullUrl = `${CLOCKIFY_BASE}${path}`
  console.log(`[clockifyFetch] ${method} ${fullUrl}`, { 
    body, 
    apiKeyLength: apiKey?.length,
    apiKeyPrefix: apiKey?.substring(0, 8) + '...'
  })
  
  const res = await fetch(fullUrl, {
    method,
    headers: {
      'X-Api-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  console.log(`[clockifyFetch] Response status: ${res.status} ${res.statusText}`)
  console.log(`[clockifyFetch] Response headers:`, Object.fromEntries(res.headers.entries()))

  if (!res.ok) {
    const text = await res.text()
    console.log(`[clockifyFetch] Error response:`, text)
    throw new Error(`Clockify API error ${res.status}: ${text}`)
  }

  if (res.status === 204) {
    console.log(`[clockifyFetch] 204 No Content - returning null`)
    return null
  }
  
  // Handle empty responses
  const text = await res.text()
  console.log(`[clockifyFetch] Response text length: ${text.length}`)
  console.log(`[clockifyFetch] Response text:`, text)
  
  if (!text || text.trim() === '') {
    console.log(`[clockifyFetch] Empty response - returning null`)
    return null
  }
  
  try {
    const parsed = JSON.parse(text)
    console.log(`[clockifyFetch] Successfully parsed JSON`)
    return parsed
  } catch (error) {
    console.error(`[clockifyFetch] JSON parse error:`, error)
    console.error(`[clockifyFetch] Raw response:`, text)
    throw new Error(`Invalid JSON response from Clockify API: ${text}`)
  }
}

/**
 * Resolves the authenticated user's ID and default workspace via GET /user.
 */
export async function resolveUser(
  apiKey: string
): Promise<{ userId: string; workspaceId: string }> {
  const user = (await clockifyFetch('/user', apiKey)) as { id: string; defaultWorkspace: string }
  return { userId: user.id, workspaceId: user.defaultWorkspace }
}
