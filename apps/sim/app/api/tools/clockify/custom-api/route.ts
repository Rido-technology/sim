import { createLogger } from '@sim/logger'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { checkInternalAuth } from '@/lib/auth/hybrid'
import type { ClockifyCustomApiParams } from '@/tools/clockify/types'

export const dynamic = 'force-dynamic'

const logger = createLogger('ClockifyCustomApiRoute')

const CLOCKIFY_BASE = 'https://api.clockify.me/api/v1'

const bodySchema = z.object({
  apiKey: z.string().min(1),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
  endpoint: z.string().min(1),
  body: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const authResult = await checkInternalAuth(req, { requireWorkflowId: false })
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: 401 })
  }

  try {
    const raw = await req.json()
    const params = bodySchema.parse(raw)

    // Ensure endpoint starts with /
    const normalizedEndpoint = params.endpoint.startsWith('/') ? params.endpoint : `/${params.endpoint}`
    
    const res = await fetch(`${CLOCKIFY_BASE}${normalizedEndpoint}`, {
      method: params.method,
      headers: {
        'X-Api-Key': params.apiKey,
        'Content-Type': 'application/json',
      },
      body: params.body && ['POST', 'PUT', 'PATCH'].includes(params.method) 
        ? params.body 
        : undefined,
    })

    let data: unknown = null
    const contentType = res.headers.get('content-type')
    
    if (contentType?.includes('application/json')) {
      try {
        data = await res.json()
      } catch {
        // If JSON parsing fails, get text
        data = await res.text()
      }
    } else {
      data = await res.text()
    }

    return NextResponse.json({
      status: res.status,
      data: data,
    })
  } catch (error) {
    logger.error('Error making custom API call:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}