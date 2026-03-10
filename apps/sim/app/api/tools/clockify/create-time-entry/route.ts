import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { checkInternalAuth } from '@/lib/auth/hybrid'
import { clockifyFetch } from '../utils'

export const dynamic = 'force-dynamic'

const logger = createLogger('ClockifyCreateTimeEntryRoute')

const bodySchema = z.object({
  apiKey: z.string().min(1),
  workspaceId: z.string().min(1),
  start: z.string().min(1),
  end: z.string().min(1),
  taskId: z.string().min(1),
  description: z.string().optional(),
  projectId: z.string().optional(),
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

    const entryBody: Record<string, unknown> = {
      start: params.start,
      end: params.end,
      taskId: params.taskId,
    }
    if (params.description) entryBody.description = params.description
    if (params.projectId) entryBody.projectId = params.projectId
    if (params.tagIds) {
      entryBody.tagIds = params.tagIds.split(',').map((s) => s.trim())
    }

    const entry = await clockifyFetch(
      `/workspaces/${params.workspaceId}/time-entries`,
      params.apiKey,
      'POST',
      entryBody
    )

    return NextResponse.json(entry)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to create Clockify time entry', { error: message })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
