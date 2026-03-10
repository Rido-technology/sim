import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { checkInternalAuth } from '@/lib/auth/hybrid'
import { clockifyFetch } from '../utils'

export const dynamic = 'force-dynamic'

const logger = createLogger('ClockifyGetTaskRoute')

const bodySchema = z.object({
  apiKey: z.string().min(1),
  workspaceId: z.string().min(1),
  projectId: z.string().min(1),
  taskId: z.string().optional(),
  name: z.string().optional(),
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

    if (params.taskId) {
      const task = await clockifyFetch(
        `/workspaces/${params.workspaceId}/projects/${params.projectId}/tasks/${params.taskId}`,
        params.apiKey
      )
      return NextResponse.json(task)
    }

    const query = new URLSearchParams()
    if (params.name) query.set('name', params.name)
    if (params.page) query.set('page', String(params.page))
    if (params.pageSize) query.set('page-size', String(params.pageSize))

    const qs = query.toString()
    const tasks = await clockifyFetch(
      `/workspaces/${params.workspaceId}/projects/${params.projectId}/tasks${qs ? `?${qs}` : ''}`,
      params.apiKey
    )

    return NextResponse.json({ tasks })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to get Clockify task', { error: message })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
