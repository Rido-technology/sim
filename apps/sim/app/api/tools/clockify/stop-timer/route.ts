import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { checkInternalAuth } from '@/lib/auth/hybrid'
import { clockifyFetch, resolveUser } from '../utils'

export const dynamic = 'force-dynamic'

const logger = createLogger('ClockifyStopTimerRoute')

const bodySchema = z.object({
  apiKey: z.string().min(1),
  workspaceId: z.string().optional(),
  userId: z.string().optional(),
  end: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const authResult = await checkInternalAuth(req, { requireWorkflowId: false })
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: 401 })
  }

  try {
    const raw = await req.json()
    const params = bodySchema.parse(raw)

    let workspaceId = params.workspaceId
    let userId = params.userId

    if (!workspaceId || !userId) {
      const resolved = await resolveUser(params.apiKey)
      workspaceId = workspaceId ?? resolved.workspaceId
      userId = userId ?? resolved.userId
    }

    const end = params.end ?? new Date().toISOString()

    const entry = await clockifyFetch(
      `/workspaces/${workspaceId}/user/${userId}/time-entries`,
      params.apiKey,
      'PATCH',
      { end }
    )

    return NextResponse.json(entry)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to stop Clockify timer', { error: message })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
