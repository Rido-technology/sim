import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { checkInternalAuth } from '@/lib/auth/hybrid'

export const dynamic = 'force-dynamic'

const logger = createLogger('ClickUpCreateTaskAPI')

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
      name,
      description,
      assignees,
      tags,
      status,
      priority,
      due_date,
      due_date_time,
      time_estimate,
      start_date,
      start_date_time,
      notify_all,
      parent,
      links_to,
      check_required_custom_fields,
      custom_fields,
    } = await request.json()

    if (!accessToken) {
      logger.error('Missing access token in request')
      return NextResponse.json({ error: 'Access token is required' }, { status: 400 })
    }

    if (!listId) {
      logger.error('Missing list ID in request')
      return NextResponse.json({ error: 'List ID is required' }, { status: 400 })
    }

    if (!name) {
      logger.error('Missing task name in request')
      return NextResponse.json({ error: 'Task name is required' }, { status: 400 })
    }

    const params = new URLSearchParams()
    if (check_required_custom_fields !== undefined) {
      params.append('custom_task_ids', String(check_required_custom_fields))
    }

    const taskData: Record<string, unknown> = {
      name,
    }

    if (description) taskData.description = description
    if (assignees) taskData.assignees = assignees
    if (tags) taskData.tags = tags
    if (status) taskData.status = status
    if (priority !== undefined) taskData.priority = priority
    if (due_date !== undefined) taskData.due_date = due_date
    if (due_date_time !== undefined) taskData.due_date_time = due_date_time
    if (time_estimate !== undefined) taskData.time_estimate = time_estimate
    if (start_date !== undefined) taskData.start_date = start_date
    if (start_date_time !== undefined) taskData.start_date_time = start_date_time
    if (notify_all !== undefined) taskData.notify_all = notify_all
    if (parent) taskData.parent = parent
    if (links_to) taskData.links_to = links_to
    if (custom_fields) taskData.custom_fields = custom_fields

    const url = `${CLICKUP_API_BASE}/list/${listId}/task${params.toString() ? `?${params.toString()}` : ''}`

    logger.info('Creating ClickUp task', { listId, name })

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
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
    logger.error('Error in ClickUp create task:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create task',
      },
      { status: 500 }
    )
  }
}
