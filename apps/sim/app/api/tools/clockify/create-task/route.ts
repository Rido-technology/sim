import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { checkInternalAuth } from '@/lib/auth/hybrid'
import { clockifyFetch } from '../utils'

export const dynamic = 'force-dynamic'

const logger = createLogger('ClockifyCreateTaskRoute')

const bodySchema = z.object({
  apiKey: z.string().min(1),
  workspaceId: z.string().min(1),
  projectId: z.string().min(1),
  name: z.string().min(1),
  billable: z.boolean().optional(),
  assigneeIds: z.array(z.string()).optional(),
  estimate: z.string().optional(),
  status: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const authResult = await checkInternalAuth(req, { requireWorkflowId: false })
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: 401 })
  }

  try {
    const raw = await req.json()
    const params = bodySchema.parse(raw)

    const taskBody: Record<string, unknown> = { 
      name: params.name
    }
    
    if (params.billable !== undefined) {
      taskBody.billable = params.billable
    }
    if (params.assigneeIds && params.assigneeIds.length > 0) {
      taskBody.assigneeIds = params.assigneeIds
    }
    if (params.estimate) {
      taskBody.estimate = params.estimate
    }
    if (params.status) {
      taskBody.status = params.status
    }

    logger.info('Creating Clockify task', {
      workspaceId: params.workspaceId,
      projectId: params.projectId,
      taskBody
    })

    const task = await clockifyFetch(
      `/workspaces/${params.workspaceId}/projects/${params.projectId}/tasks`,
      params.apiKey,
      'POST',
      taskBody
    )

    return NextResponse.json({ success: true, task })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to create Clockify task', { error: message })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
