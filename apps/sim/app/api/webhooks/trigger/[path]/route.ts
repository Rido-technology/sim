import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { generateRequestId } from '@/lib/core/utils/request'
import {
  checkWebhookPreprocessing,
  findAllWebhooksForPath,
  formatProviderErrorResponse,
  handlePreDeploymentVerification,
  handleProviderChallenges,
  handleProviderReachabilityTest,
  parseWebhookBody,
  queueWebhookExecution,
  shouldSkipWebhookEvent,
  verifyProviderAuth,
} from '@/lib/webhooks/processor'
import { blockExistsInDeployment } from '@/lib/workflows/persistence/utils'

const logger = createLogger('WebhookTriggerAPI')

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string }> }) {
  const requestId = generateRequestId()
  const { path } = await params

  const url = new URL(request.url)
  logger.info(`[${requestId}] GET webhook verification request`, {
    path,
    searchParams: Object.fromEntries(url.searchParams.entries()),
    headers: Object.fromEntries(request.headers.entries()),
  })

  // Handle provider-specific GET verifications (Microsoft Graph, WhatsApp, etc.)
  const challengeResponse = await handleProviderChallenges({}, request, requestId, path)
  if (challengeResponse) {
    logger.info(`[${requestId}] Returning challenge response`, {
      status: challengeResponse.status,
    })
    return challengeResponse
  }

  logger.warn(`[${requestId}] No challenge handler matched, returning 405`)
  return new NextResponse('Method not allowed', { status: 405 })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string }> }
) {
  const requestId = generateRequestId()
  const { path } = await params

  const url = new URL(request.url)
  logger.info(`[${requestId}] POST webhook request received`, {
    path,
    searchParams: Object.fromEntries(url.searchParams.entries()),
    headers: Object.fromEntries(request.headers.entries()),
    contentType: request.headers.get('content-type'),
  })

  // Handle provider challenges before body parsing (Microsoft Graph validationToken, etc.)
  const earlyChallenge = await handleProviderChallenges({}, request, requestId, path)
  if (earlyChallenge) {
    return earlyChallenge
  }

  const parseResult = await parseWebhookBody(request, requestId)

  // Check if parseWebhookBody returned an error response
  if (parseResult instanceof NextResponse) {
    return parseResult
  }

  const { body, rawBody } = parseResult

  logger.info(`[${requestId}] Webhook body parsed successfully`, {
    bodyKeys: Object.keys(body),
    bodyPreview: JSON.stringify(body).slice(0, 500),
    bodySize: rawBody.length,
  })

  const challengeResponse = await handleProviderChallenges(body, request, requestId, path)
  if (challengeResponse) {
    return challengeResponse
  }

  // Find all webhooks for this path (supports credential set fan-out where multiple webhooks share a path)
  const webhooksForPath = await findAllWebhooksForPath({ requestId, path })

  if (webhooksForPath.length === 0) {
    logger.warn(`[${requestId}] Webhook or workflow not found for path: ${path}`)
    return new NextResponse('Not Found', { status: 404 })
  }

  // Process each webhook
  // For credential sets with shared paths, each webhook represents a different credential
  const responses: NextResponse[] = []

  for (const { webhook: foundWebhook, workflow: foundWorkflow } of webhooksForPath) {
    const authError = await verifyProviderAuth(
      foundWebhook,
      foundWorkflow,
      request,
      rawBody,
      requestId
    )
    if (authError) {
      // For multi-webhook, log and continue to next webhook
      if (webhooksForPath.length > 1) {
        logger.warn(`[${requestId}] Auth failed for webhook ${foundWebhook.id}, continuing to next`)
        continue
      }
      return authError
    }

    const reachabilityResponse = handleProviderReachabilityTest(foundWebhook, body, requestId)
    if (reachabilityResponse) {
      // Reachability test should return immediately for the first webhook
      return reachabilityResponse
    }

    let preprocessError: NextResponse | null = null
    try {
      preprocessError = await checkWebhookPreprocessing(foundWorkflow, foundWebhook, requestId)
      if (preprocessError) {
        if (webhooksForPath.length > 1) {
          logger.warn(
            `[${requestId}] Preprocessing failed for webhook ${foundWebhook.id}, continuing to next`
          )
          continue
        }
        return preprocessError
      }
    } catch (error) {
      logger.error(`[${requestId}] Unexpected error during webhook preprocessing`, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        webhookId: foundWebhook.id,
        workflowId: foundWorkflow.id,
      })

      if (webhooksForPath.length > 1) {
        continue
      }

      return formatProviderErrorResponse(
        foundWebhook,
        'An unexpected error occurred during preprocessing',
        500
      )
    }

    if (foundWebhook.blockId) {
      const blockExists = await blockExistsInDeployment(foundWorkflow.id, foundWebhook.blockId)
      if (!blockExists) {
        const preDeploymentResponse = handlePreDeploymentVerification(foundWebhook, requestId)
        if (preDeploymentResponse) {
          return preDeploymentResponse
        }

        logger.info(
          `[${requestId}] Trigger block ${foundWebhook.blockId} not found in deployment for workflow ${foundWorkflow.id}`
        )
        if (webhooksForPath.length > 1) {
          continue
        }
        return new NextResponse('Trigger block not found in deployment', { status: 404 })
      }
    }

    if (shouldSkipWebhookEvent(foundWebhook, body, requestId)) {
      continue
    }

    const response = await queueWebhookExecution(foundWebhook, foundWorkflow, body, request, {
      requestId,
      path,
    })
    responses.push(response)
  }

  // Return the last successful response, or a combined response for multiple webhooks
  if (responses.length === 0) {
    logger.info(`[${requestId}] All webhooks filtered/skipped for path: ${path}`)
    return NextResponse.json({ message: 'Webhook received but filtered by event type' })
  }

  if (responses.length === 1) {
    return responses[0]
  }

  // For multiple webhooks, return success if at least one succeeded
  logger.info(
    `[${requestId}] Processed ${responses.length} webhooks for path: ${path} (credential set fan-out)`
  )
  return NextResponse.json({
    success: true,
    webhooksProcessed: responses.length,
  })
}
