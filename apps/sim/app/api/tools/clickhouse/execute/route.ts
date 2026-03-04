import { randomUUID } from 'crypto'
import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { checkInternalAuth } from '@/lib/auth/hybrid'
import {
  createClickHouseClient,
  validateDatabaseName,
  validateExecuteQuery,
} from '@/app/api/tools/clickhouse/utils'

const logger = createLogger('ClickHouseExecuteAPI')

const ExecuteSchema = z.object({
  host: z.string().min(1, 'Host is required'),
  port: z.coerce.number().int().positive('Port must be a positive integer'),
  database: z.string().min(1, 'Database name is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  protocol: z.enum(['http', 'https']).default('http'),
  query: z.string().min(1, 'Query is required'),
})

export async function POST(request: NextRequest) {
  const requestId = randomUUID().slice(0, 8)

  try {
    const auth = await checkInternalAuth(request)
    if (!auth.success || !auth.userId) {
      logger.warn(`[${requestId}] Unauthorized ClickHouse execute attempt`)
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const params = ExecuteSchema.parse(body)

    logger.info(
      `[${requestId}] Executing raw SQL on ${params.host}:${params.port}/${params.database}`
    )

    const dbValidation = validateDatabaseName(params.database)
    if (!dbValidation.isValid) {
      logger.warn(`[${requestId}] Invalid database name: ${dbValidation.error}`)
      return NextResponse.json({ error: dbValidation.error }, { status: 400 })
    }

    const validation = validateExecuteQuery(params.query)
    if (!validation.isValid) {
      logger.warn(`[${requestId}] Query validation failed: ${validation.error}`)
      return NextResponse.json(
        { error: `Query validation failed: ${validation.error}` },
        { status: 400 }
      )
    }

    const client = createClickHouseClient({
      host: params.host,
      port: params.port,
      database: params.database,
      username: params.username,
      password: params.password,
      protocol: params.protocol,
    })

    try {
      const trimmed = params.query.trim().toUpperCase()
      const isSelect =
        trimmed.startsWith('SELECT') ||
        trimmed.startsWith('WITH') ||
        trimmed.startsWith('SHOW') ||
        trimmed.startsWith('DESCRIBE') ||
        trimmed.startsWith('EXISTS') ||
        trimmed.startsWith('EXPLAIN')

      if (isSelect) {
        const result = await client.query({
          query: params.query,
          format: 'JSONEachRow',
        })
        const rows = (await result.json()) as unknown[]

        logger.info(`[${requestId}] SQL executed successfully, ${rows.length} row(s) returned`)

        return NextResponse.json({
          message: `SQL executed successfully. ${rows.length} row(s) returned.`,
          rows,
          rowCount: rows.length,
        })
      }

      await client.command({ query: params.query })

      logger.info(`[${requestId}] SQL command executed successfully`)

      return NextResponse.json({
        message: 'SQL executed successfully.',
        rows: [],
        rowCount: 0,
      })
    } finally {
      await client.close()
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn(`[${requestId}] Invalid request data`, { errors: error.errors })
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    logger.error(`[${requestId}] ClickHouse execute failed:`, error)

    return NextResponse.json(
      { error: `ClickHouse execute failed: ${errorMessage}` },
      { status: 500 }
    )
  }
}
