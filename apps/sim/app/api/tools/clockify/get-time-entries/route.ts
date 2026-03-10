import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { checkInternalAuth } from '@/lib/auth/hybrid'
import { clockifyFetch, resolveUser } from '../utils'

export const dynamic = 'force-dynamic'

const logger = createLogger('ClockifyGetTimeEntriesRoute')

const bodySchema = z.object({
  apiKey: z.string().min(1),
  workspaceId: z.string().optional(),
  userId: z.string().optional(),
  description: z.string().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
  project: z.string().optional(),
  task: z.string().optional(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
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

    const query = new URLSearchParams()
    if (params.description) query.set('description', params.description)
    if (params.start) query.set('start', params.start)
    if (params.end) query.set('end', params.end)
    if (params.project) query.set('project', params.project)
    if (params.task) query.set('task', params.task)
    if (params.page) query.set('page', String(params.page))
    if (params.pageSize) query.set('page-size', String(params.pageSize))

    const qs = query.toString()
    const entries = await clockifyFetch(
      `/workspaces/${workspaceId}/user/${userId}/time-entries${qs ? `?${qs}` : ''}`,
      params.apiKey
    )

    return NextResponse.json({ timeEntries: entries })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to get Clockify time entries', { error: message })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
