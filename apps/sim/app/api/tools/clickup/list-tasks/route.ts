import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { checkInternalAuth } from '@/lib/auth/hybrid'

export const dynamic = 'force-dynamic'

const logger = createLogger('ClickUpListTasksAPI')

const CLICKUP_API_BASE = 'https://api.clickup.com/api/v2'

export async function POST(request: NextRequest) {
  try {
    const auth = await checkInternalAuth(request)
    if (!auth.success || !auth.userId) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
    }

    const {
      accessToken,
      listId,
      archived,
      page,
      order_by,
      reverse,
      subtasks,
      statuses,
      include_closed,
      assignees,
      tags,
      due_date_gt,
      due_date_lt,
      date_created_gt,
      date_created_lt,
      date_updated_gt,
      date_updated_lt,
    } = await request.json()

    if (!accessToken) {
      logger.error('Missing access token in request')
      return NextResponse.json({ error: 'Access token is required' }, { status: 400 })
    }

    if (!listId) {
      logger.error('Missing list ID in request')
      return NextResponse.json({ error: 'List ID is required' }, { status: 400 })
    }

    const params = new URLSearchParams()
    if (archived !== undefined) params.append('archived', String(archived))
    if (page !== undefined) params.append('page', String(page))
    if (order_by) params.append('order_by', order_by)
    if (reverse !== undefined) params.append('reverse', String(reverse))
    if (subtasks !== undefined) params.append('subtasks', String(subtasks))
    if (include_closed !== undefined) params.append('include_closed', String(include_closed))

    if (statuses && Array.isArray(statuses)) {
      for (const status of statuses) {
        params.append('statuses[]', status)
      }
    }

    if (assignees && Array.isArray(assignees)) {
      for (const assignee of assignees) {
        params.append('assignees[]', String(assignee))
      }
    }

    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        params.append('tags[]', tag)
      }
    }

    if (due_date_gt !== undefined) params.append('due_date_gt', String(due_date_gt))
    if (due_date_lt !== undefined) params.append('due_date_lt', String(due_date_lt))
    if (date_created_gt !== undefined) params.append('date_created_gt', String(date_created_gt))
    if (date_created_lt !== undefined) params.append('date_created_lt', String(date_created_lt))
    if (date_updated_gt !== undefined) params.append('date_updated_gt', String(date_updated_gt))
    if (date_updated_lt !== undefined) params.append('date_updated_lt', String(date_updated_lt))

    const url = `${CLICKUP_API_BASE}/list/${listId}/task${params.toString() ? `?${params.toString()}` : ''}`

    logger.info('Fetching ClickUp tasks', { listId })

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
        tasks: data.tasks || [],
        last_page: data.last_page,
      },
    })
  } catch (error) {
    logger.error('Error in ClickUp list tasks:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list tasks',
      },
      { status: 500 }
    )
  }
}
