import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { checkInternalAuth } from '@/lib/auth/hybrid'

export const dynamic = 'force-dynamic'

const logger = createLogger('ClickUpListSpacesAPI')

const CLICKUP_API_BASE = 'https://api.clickup.com/api/v2'

export async function POST(request: NextRequest) {
  try {
    const auth = await checkInternalAuth(request)
    if (!auth.success || !auth.userId) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
    }

    const { accessToken, teamId, archived } = await request.json()

    if (!accessToken) {
      logger.error('Missing access token in request')
      return NextResponse.json({ error: 'Access token is required' }, { status: 400 })
    }

    if (!teamId) {
      logger.error('Missing team ID in request')
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 })
    }

    const params = new URLSearchParams()
    if (archived !== undefined) {
      params.append('archived', String(archived))
    }

    const url = `${CLICKUP_API_BASE}/team/${teamId}/space${params.toString() ? `?${params.toString()}` : ''}`

    logger.info('Fetching ClickUp spaces', { teamId, archived })

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: accessToken,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      logger.error('ClickUp API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      })

      return NextResponse.json(
        {
          success: false,
          error: `ClickUp API error: ${response.status} ${response.statusText}`,
        },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      output: {
        ts: new Date().toISOString(),
        spaces: data.spaces || [],
      },
    })
  } catch (error) {
    logger.error('Error in ClickUp list spaces:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list spaces',
      },
      { status: 500 }
    )
  }
}
