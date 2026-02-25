import { createLogger } from '@sim/logger'

const logger = createLogger('FacebookUtils')

/**
 * Exchanges a User Access Token for the Page Access Token of a specific page.
 * Required because Facebook API page operations require a Page Access Token,
 * not the User Access Token obtained via OAuth.
 *
 * @param userAccessToken - The User Access Token obtained via OAuth
 * @param pageId - The Facebook Page ID
 * @returns The Page Access Token for the given page
 */
export async function getPageAccessToken(
  userAccessToken: string,
  pageId: string
): Promise<string> {
  const response = await fetch(
    `https://graph.facebook.com/v19.0/me/accounts?access_token=${userAccessToken}`
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error?.error?.message || `Failed to fetch pages: ${response.statusText}`)
  }

  const data = await response.json()
  const pages: Array<{ id: string; access_token: string; name: string }> = data.data || []

  const page = pages.find((p) => p.id === pageId)

  if (!page) {
    logger.warn('Page not found in user accounts', { pageId, availablePages: pages.map((p) => p.id) })
    throw new Error(
      `Page ${pageId} not found. Make sure you are an admin of this page and it is connected to your account.`
    )
  }

  return page.access_token
}
