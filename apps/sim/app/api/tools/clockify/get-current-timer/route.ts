import { createLogger } from '@sim/logger'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { checkInternalAuth } from '@/lib/auth/hybrid'
import type { ClockifyGetCurrentTimerParams } from '@/tools/clockify/types'
import { clockifyFetch, resolveUser } from '../utils'

export const dynamic = 'force-dynamic'

const logger = createLogger('ClockifyGetCurrentTimerRoute')

const bodySchema = z.object({
  apiKey: z.string().min(1),
  workspaceId: z.string().optional(),
  userId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const authResult = await checkInternalAuth(req, { requireWorkflowId: false })
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: 401 })
  }

  try {
    const raw = await req.json()
    const params = bodySchema.parse(raw)

    // Auto-resolve userId and workspaceId if not provided
    const resolved = params.userId && params.workspaceId 
      ? { userId: params.userId, workspaceId: params.workspaceId }
      : await resolveUser(params.apiKey)
    
    const finalWorkspaceId = params.workspaceId || resolved.workspaceId
    const finalUserId = params.userId || resolved.userId

    // Get the current running timer for the user
    const timeEntry = await clockifyFetch(
      `/workspaces/${finalWorkspaceId}/user/${finalUserId}/time-entries?in-progress=true`,
      params.apiKey
    ) as any[]

    const currentTimer = timeEntry?.[0]
    
    if (!currentTimer) {
      return NextResponse.json({
        id: null,
        description: null,
        timeInterval: null,
        projectId: null,
        taskId: null,
        isRunning: false,
      })
    }

    return NextResponse.json({
      id: currentTimer.id,
      description: currentTimer.description || '',
      timeInterval: {
        start: currentTimer.timeInterval.start,
        end: currentTimer.timeInterval.end,
        duration: currentTimer.timeInterval.duration,
      },
      projectId: currentTimer.projectId || null,
      taskId: currentTimer.task?.id || null,
      isRunning: !currentTimer.timeInterval.end,
    })
  } catch (error) {
    logger.error('Error getting current timer:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}