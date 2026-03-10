import { createLogger } from '@sim/logger'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { checkInternalAuth } from '@/lib/auth/hybrid'
import { clockifyFetch } from '../utils'

export const dynamic = 'force-dynamic'

const logger = createLogger('ClockifyGetWorkspacesRoute')

const bodySchema = z.object({
  apiKey: z.string().min(1),
})

export async function POST(req: NextRequest) {
  const authResult = await checkInternalAuth(req, { requireWorkflowId: false })
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: 401 })
  }

  try {
    const raw = await req.json()
    const params = bodySchema.parse(raw)

    const workspaces = await clockifyFetch('/workspaces', params.apiKey) as any[]

    return NextResponse.json({
      workspaces: workspaces.map(workspace => ({
        id: workspace.id,
        name: workspace.name,
        hourlyRate: workspace.hourlyRate,
        memberships: workspace.memberships || [],
        workspaceSettings: workspace.workspaceSettings,
        imageUrl: workspace.imageUrl || '',
        featureSubscriptionType: workspace.featureSubscriptionType,
      }))
    })
  } catch (error) {
    logger.error('Error getting workspaces:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}