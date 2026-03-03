import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { checkInternalAuth } from '@/lib/auth/hybrid'

export const dynamic = 'force-dynamic'

const logger = createLogger('ClickUpGetTaskAPI')

const CLICKUP_API_BASE = 'https://api.clickup.com/api/v2'

export async function POST(request: NextRequest) {
  try {
    const auth = await checkInternalAuth(request)
    if (!auth.success || !auth.userId) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
    }

    const { accessToken, taskId, custom_task_ids, team_id, include_subtasks } =
      await request.json()

    if (!accessToken) {
      logger.error('Missing access token in request')
      return NextResponse.json({ error: 'Access token is required' }, { status: 400 })
    }

    if (!taskId) {
      logger.error('Missing task ID in request')
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    const params = new URLSearchParams()
    if (custom_task_ids !== undefined) {
      params.append('custom_task_ids', String(custom_task_ids))
      if (team_id) {
        params.append('team_id', team_id)
      }
    }
    if (include_subtasks !== undefined) {
      params.append('include_subtasks', String(include_subtasks))
    }

    const url = `${CLICKUP_API_BASE}/task/${taskId}${params.toString() ? `?${params.toString()}` : ''}`

    logger.info('Fetching ClickUp task', { taskId })

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
        task: data,
      },
    })
  } catch (error) {
    logger.error('Error in ClickUp get task:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get task',
      },
      { status: 500 }
    )
  }
}
