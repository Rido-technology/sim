import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { checkInternalAuth } from '@/lib/auth/hybrid'
import { generateRequestId } from '@/lib/core/utils/request'
import { updateClickUpTask } from '../utils'

export const dynamic = 'force-dynamic'

const logger = createLogger('ClickUpUpdateTaskAPI')

const AssigneesSchema = z.object({
  add: z.array(z.number()).optional().nullable(),
  rem: z.array(z.number()).optional().nullable(),
})

const ClickUpUpdateTaskSchema = z.object({
  accessToken: z.string().min(1, 'Access token is required'),
  taskId: z.string().min(1, 'Task ID is required'),
  name: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  priority: z.number().optional().nullable(),
  due_date: z.number().optional().nullable(),
  due_date_time: z.boolean().optional().nullable(),
  time_estimate: z.number().optional().nullable(),
  start_date: z.number().optional().nullable(),
  start_date_time: z.boolean().optional().nullable(),
  assignees: AssigneesSchema.optional().nullable(),
  archived: z.boolean().optional().nullable(),
})

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()

  try {
    const authResult = await checkInternalAuth(request, { requireWorkflowId: false })

    if (!authResult.success) {
      logger.warn(`[${requestId}] Unauthorized ClickUp update task attempt: ${authResult.error}`)
      return NextResponse.json(
        {
          success: false,
          error: authResult.error || 'Authentication required',
        },
        { status: 401 }
      )
    }

    logger.info(`[${requestId}] Authenticated ClickUp update task request via ${authResult.authType}`, {
      userId: authResult.userId,
    })

    const body = await request.json()
    const validatedData = ClickUpUpdateTaskSchema.parse(body)

    logger.info(`[${requestId}] Updating ClickUp task`, {
      taskId: validatedData.taskId,
    })

    const result = await updateClickUpTask(
      validatedData.accessToken,
      {
        taskId: validatedData.taskId,
        name: validatedData.name ?? undefined,
        description: validatedData.description ?? undefined,
        status: validatedData.status ?? undefined,
        priority: validatedData.priority ?? undefined,
        due_date: validatedData.due_date ?? undefined,
        due_date_time: validatedData.due_date_time ?? undefined,
        time_estimate: validatedData.time_estimate ?? undefined,
        start_date: validatedData.start_date ?? undefined,
        start_date_time: validatedData.start_date_time ?? undefined,
        assignees:
          validatedData.assignees && (validatedData.assignees.add || validatedData.assignees.rem)
            ? {
                add: validatedData.assignees.add ?? undefined,
                rem: validatedData.assignees.rem ?? undefined,
              }
            : undefined,
        archived: validatedData.archived ?? undefined,
      },
      requestId,
      logger
    )

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, output: result.output })
  } catch (error) {
    logger.error(`[${requestId}] Error updating ClickUp task:`, error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
