import { randomUUID } from 'crypto'
import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { checkInternalAuth } from '@/lib/auth/hybrid'
import { executeIntrospect, validateNamespace } from '@/app/api/tools/surrealdb/utils'

const logger = createLogger('SurrealDBIntrospectAPI')

const IntrospectSchema = z.object({
  host: z.string().min(1, 'Host is required'),
  port: z.coerce.number().int().positive('Port must be a positive integer'),
  namespace: z.string().min(1, 'Namespace is required'),
  database: z.string().min(1, 'Database name is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  protocol: z.enum(['http', 'https']).default('http'),
})

export async function POST(request: NextRequest) {
  const requestId = randomUUID().slice(0, 8)

  try {
    const auth = await checkInternalAuth(request)
    if (!auth.success || !auth.userId) {
      logger.warn(`[${requestId}] Unauthorized SurrealDB introspect attempt`)
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const params = IntrospectSchema.parse(body)

    const nsValidation = validateNamespace(params.namespace, 'namespace')
    if (!nsValidation.isValid) {
      return NextResponse.json({ error: nsValidation.error }, { status: 400 })
    }

    const dbValidation = validateNamespace(params.database, 'database name')
    if (!dbValidation.isValid) {
      return NextResponse.json({ error: dbValidation.error }, { status: 400 })
    }

    logger.info(
      `[${requestId}] Introspecting SurrealDB schema on ${params.host}:${params.port}/${params.namespace}/${params.database}`
    )

    const result = await executeIntrospect({
      host: params.host,
      port: params.port,
      namespace: params.namespace,
      database: params.database,
      username: params.username,
      password: params.password,
      protocol: params.protocol,
    })

    logger.info(
      `[${requestId}] Introspection completed, found ${result.tables.length} tables`
    )

    return NextResponse.json({
      message: `Schema introspection completed. Found ${result.tables.length} table(s) in '${params.namespace}/${params.database}'.`,
      tables: result.tables,
      tableNames: result.tableNames,
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
    logger.error(`[${requestId}] SurrealDB introspection failed:`, error)

    return NextResponse.json(
      { error: `SurrealDB introspection failed: ${errorMessage}` },
      { status: 500 }
    )
  }
}
