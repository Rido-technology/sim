import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { generateRequestId } from '@/lib/core/utils/request'

export const dynamic = 'force-dynamic'

const logger = createLogger('DiscourseCategoriesAPI')

export async function GET(request: NextRequest) {
  const requestId = generateRequestId()

  try {
    const session = await getSession()

    if (!session?.user?.id) {
      logger.warn(`[${requestId}] Unauthenticated request rejected`)
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const siteUrl = searchParams.get('siteUrl')
    const apiKey = searchParams.get('apiKey')
    const apiUsername = searchParams.get('apiUsername')

    if (!siteUrl || !apiKey || !apiUsername) {
      return NextResponse.json(
        { error: 'siteUrl, apiKey, and apiUsername are required' },
        { status: 400 }
      )
    }

    const baseUrl = siteUrl.replace(/\/$/, '')
    const url = `${baseUrl}/categories.json`

    logger.info(`[${requestId}] Fetching Discourse categories`, { siteUrl: baseUrl })

    const response = await fetch(url, {
      headers: {
        'Api-Key': apiKey,
        'Api-Username': apiUsername,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      logger.error(`[${requestId}] Discourse API error: ${response.status}`, { error: errorText })
      return NextResponse.json(
        { error: `Failed to fetch categories: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const categoryList = data.category_list?.categories || []

    const categories = categoryList.map((cat: { id: number; name: string; slug: string }) => ({
      id: String(cat.id),
      label: cat.name,
    }))

    logger.info(`[${requestId}] Successfully fetched ${categories.length} categories`)

    return NextResponse.json({ categories }, { status: 200 })
  } catch (error) {
    logger.error(`[${requestId}] Error fetching Discourse categories`, error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
