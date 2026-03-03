import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { checkInternalAuth } from '@/lib/auth/hybrid'
import { generateRequestId } from '@/lib/core/utils/request'
import { addClickUpComment } from '../utils'

export const dynamic = 'force-dynamic'

const logger = createLogger('ClickUpAddCommentAPI')

const ClickUpAddCommentSchema = z.object({
  accessToken: z.string().min(1, 'Access token is required'),
  taskId: z.string().min(1, 'Task ID is required'),
  commentText: z.string().min(1, 'Comment text is required'),
  assignee: z.number().optional().nullable(),
  notifyAll: z.boolean().optional().nullable(),
})

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()

  try {
    const authResult = await checkInternalAuth(request, { requireWorkflowId: false })

    if (!authResult.success) {
      logger.warn(`[${requestId}] Unauthorized ClickUp add comment attempt: ${authResult.error}`)
      return NextResponse.json(
        {
          success: false,
          error: authResult.error || 'Authentication required',
        },
        { status: 401 }
      )
    }

    logger.info(`[${requestId}] Authenticated ClickUp add comment request via ${authResult.authType}`, {
      userId: authResult.userId,
    })

    const body = await request.json()
    const validatedData = ClickUpAddCommentSchema.parse(body)

    logger.info(`[${requestId}] Adding comment to ClickUp task`, {
      taskId: validatedData.taskId,
    })

    const result = await addClickUpComment(
      validatedData.accessToken,
      {
        taskId: validatedData.taskId,
        commentText: validatedData.commentText,
        assignee: validatedData.assignee ?? undefined,
        notifyAll: validatedData.notifyAll ?? undefined,
      },
      requestId,
      logger
    )

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, output: result.output })
  } catch (error) {
    logger.error(`[${requestId}] Error adding comment to ClickUp task:`, error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
