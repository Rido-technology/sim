import { randomUUID } from 'crypto'
import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { checkInternalAuth } from '@/lib/auth/hybrid'
import { executeSurQL, validateIdentifier, validateNamespace } from '@/app/api/tools/surrealdb/utils'

const logger = createLogger('SurrealDBDeleteAPI')

const DeleteSchema = z.object({
  host: z.string().min(1, 'Host is required'),
  port: z.coerce.number().int().positive('Port must be a positive integer'),
  namespace: z.string().min(1, 'Namespace is required'),
  database: z.string().min(1, 'Database name is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  protocol: z.enum(['http', 'https']).default('http'),
  target: z.string().min(1, 'Target is required'),
  where: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const requestId = randomUUID().slice(0, 8)

  try {
    const auth = await checkInternalAuth(request)
    if (!auth.success || !auth.userId) {
      logger.warn(`[${requestId}] Unauthorized SurrealDB delete attempt`)
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const params = DeleteSchema.parse(body)

    const nsValidation = validateNamespace(params.namespace, 'namespace')
    if (!nsValidation.isValid) {
      return NextResponse.json({ error: nsValidation.error }, { status: 400 })
    }

    const dbValidation = validateNamespace(params.database, 'database name')
    if (!dbValidation.isValid) {
      return NextResponse.json({ error: dbValidation.error }, { status: 400 })
    }

    const targetValidation = validateIdentifier(params.target)
    if (!targetValidation.isValid) {
      return NextResponse.json({ error: targetValidation.error }, { status: 400 })
    }

    logger.info(
      `[${requestId}] Deleting from ${params.target} on ${params.host}:${params.port}/${params.namespace}/${params.database}`
    )

    const whereClause = params.where?.trim() ? ` WHERE ${params.where}` : ''
    const statement = `DELETE \`${params.target}\`${whereClause} RETURN BEFORE;`

    const config = {
      host: params.host,
      port: params.port,
      namespace: params.namespace,
      database: params.database,
      username: params.username,
      password: params.password,
      protocol: params.protocol,
    }

    const results = await executeSurQL(config, statement)
    const records = Array.isArray(results[0]?.result) ? (results[0].result as unknown[]) : []

    logger.info(`[${requestId}] Delete executed successfully, ${records.length} record(s) deleted`)

    return NextResponse.json({
      message: `Records deleted successfully. ${records.length} record(s) removed.`,
      records,
      recordCount: records.length,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn(`[${requestId}] Invalid request data`, { errors: error.errors })
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    logger.error(`[${requestId}] SurrealDB delete failed:`, error)

    return NextResponse.json(
      { error: `SurrealDB delete failed: ${errorMessage}` },
      { status: 500 }
    )
  }
}
