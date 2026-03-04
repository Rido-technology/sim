import { randomUUID } from 'crypto'
import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { checkInternalAuth } from '@/lib/auth/hybrid'
import {
  createClickHouseClient,
  sanitizeIdentifier,
  validateDatabaseName,
} from '@/app/api/tools/clickhouse/utils'

const logger = createLogger('ClickHouseInsertAPI')

const InsertSchema = z.object({
  host: z.string().min(1, 'Host is required'),
  port: z.coerce.number().int().positive('Port must be a positive integer'),
  database: z.string().min(1, 'Database name is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  protocol: z.enum(['http', 'https']).default('http'),
  table: z.string().min(1, 'Table name is required'),
  data: z.union([
    z
      .record(z.unknown())
      .refine((obj) => Object.keys(obj).length > 0, 'Data object cannot be empty'),
    z.array(z.record(z.unknown())).min(1, 'Data array cannot be empty'),
    z
      .string()
      .min(1)
      .transform((str) => {
        try {
          const parsed = JSON.parse(str)
          if (typeof parsed !== 'object' || parsed === null) {
            throw new Error('Data must be a JSON object or array')
          }
          return parsed
        } catch (e) {
          const errorMsg = e instanceof Error ? e.message : 'Unknown error'
          throw new Error(`Invalid JSON format in data field: ${errorMsg}`)
        }
      }),
  ]),
})

export async function POST(request: NextRequest) {
  const requestId = randomUUID().slice(0, 8)

  try {
    const auth = await checkInternalAuth(request)
    if (!auth.success || !auth.userId) {
      logger.warn(`[${requestId}] Unauthorized ClickHouse insert attempt`)
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const params = InsertSchema.parse(body)

    logger.info(
      `[${requestId}] Inserting data into ${params.table} on ${params.host}:${params.port}/${params.database}`
    )

    const dbValidation = validateDatabaseName(params.database)
    if (!dbValidation.isValid) {
      logger.warn(`[${requestId}] Invalid database name: ${dbValidation.error}`)
      return NextResponse.json({ error: dbValidation.error }, { status: 400 })
    }

    const sanitizedTable = sanitizeIdentifier(params.table)

    const rows = Array.isArray(params.data)
      ? (params.data as Record<string, unknown>[])
      : [params.data as Record<string, unknown>]

    const client = createClickHouseClient({
      host: params.host,
      port: params.port,
      database: params.database,
      username: params.username,
      password: params.password,
      protocol: params.protocol,
    })

    try {
      await client.insert({
        table: sanitizedTable,
        values: rows,
        format: 'JSONEachRow',
      })

      logger.info(`[${requestId}] Insert executed successfully, ${rows.length} row(s) inserted`)

      return NextResponse.json({
        message: `Data inserted successfully. ${rows.length} row(s) inserted.`,
        rows: [],
        rowCount: rows.length,
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
    logger.error(`[${requestId}] ClickHouse insert failed:`, error)

    return NextResponse.json(
      { error: `ClickHouse insert failed: ${errorMessage}` },
      { status: 500 }
    )
  }
}
