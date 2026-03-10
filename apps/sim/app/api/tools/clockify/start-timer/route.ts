import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { checkInternalAuth } from '@/lib/auth/hybrid'
import { clockifyFetch } from '../utils'

export const dynamic = 'force-dynamic'

const logger = createLogger('ClockifyStartTimerRoute')

const bodySchema = z.object({
  apiKey: z.string().min(1),
  workspaceId: z.string().min(1),
  description: z.string().optional(),
  projectId: z.string().optional(),
  taskId: z.string().optional(),
  tagIds: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const authResult = await checkInternalAuth(req, { requireWorkflowId: false })
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: 401 })
  }

  try {
    const raw = await req.json()
    const params = bodySchema.parse(raw)

    const timerBody: Record<string, unknown> = {
      start: new Date().toISOString(),
    }
    if (params.description) timerBody.description = params.description
    if (params.projectId) timerBody.projectId = params.projectId
    if (params.taskId) timerBody.taskId = params.taskId
    if (params.tagIds) {
      timerBody.tagIds = params.tagIds.split(',').map((s) => s.trim())
    }

    const entry = await clockifyFetch(
      `/workspaces/${params.workspaceId}/time-entries`,
      params.apiKey,
      'POST',
      timerBody
    )

    return NextResponse.json(entry)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to start Clockify timer', { error: message })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
