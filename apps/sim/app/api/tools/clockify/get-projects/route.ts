import { createLogger } from '@sim/logger'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { checkInternalAuth } from '@/lib/auth/hybrid'
import { clockifyFetch } from '../utils'

export const dynamic = 'force-dynamic'

const logger = createLogger('ClockifyGetProjectsRoute')

const bodySchema = z.object({
  apiKey: z.string().min(1),
  workspaceId: z.string().min(1),
  archived: z.boolean().optional(),
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

    logger.info('Received parameters', { 
      params,
      archivedValue: params.archived,
      nameValue: params.name 
    })

    // Force archived to false if undefined (for active projects)
    const archived = params.archived !== undefined ? params.archived : false

    const query = new URLSearchParams()
    query.set('archived', String(archived))
    
    if (params.name) {
      query.set('name', params.name)
    }
    if (params.page) {
      query.set('page', String(params.page))
    }
    if (params.pageSize) {
      query.set('page-size', String(params.pageSize))
    }

    const queryString = query.toString()
    const endpoint = `/workspaces/${params.workspaceId}/projects${queryString ? `?${queryString}` : ''}`
    
    logger.info('Making Clockify API call', { 
      endpoint,
      apiKeyLength: params.apiKey.length,
      fullUrl: `https://api.clockify.me/api/v1${endpoint}`,
      forcedArchived: archived
    })
    
    const projects = await clockifyFetch(endpoint, params.apiKey)
    
    logger.info('Clockify response received', { 
      responseType: typeof projects,
      isArray: Array.isArray(projects),
      length: Array.isArray(projects) ? projects.length : 'N/A'
    })

    if (!projects) {
      logger.warn('Null response from Clockify API')
      return NextResponse.json({ projects: [] })
    }

    if (!Array.isArray(projects)) {
      logger.error('Response is not an array', { projects })
      return NextResponse.json({ error: 'Invalid response from Clockify API' }, { status: 500 })
    }

    return NextResponse.json({
      projects: projects.map(project => ({
        id: project.id,
        name: project.name,
        hourlyRate: project.hourlyRate,
        clientId: project.clientId,
        workspaceId: project.workspaceId,
        billable: project.billable || false,
        memberships: project.memberships || [],
        color: project.color || '',
        estimate: project.estimate,
        archived: project.archived || false,
        duration: project.duration,
        clientName: project.clientName,
        note: project.note,
        template: project.template || false,
        public: project.public || false,
      }))
    })
  } catch (error) {
    logger.error('Error getting projects:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}