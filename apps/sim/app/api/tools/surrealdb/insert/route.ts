import { randomUUID } from 'crypto'
import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { checkInternalAuth } from '@/lib/auth/hybrid'
import { executeSurQL, validateIdentifier, validateNamespace } from '@/app/api/tools/surrealdb/utils'

const logger = createLogger('SurrealDBInsertAPI')

const InsertSchema = z.object({
  host: z.string().min(1, 'Host is required'),
  port: z.coerce.number().int().positive('Port must be a positive integer'),
  namespace: z.string().min(1, 'Namespace is required'),
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
      logger.warn(`[${requestId}] Unauthorized SurrealDB insert attempt`)
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const params = InsertSchema.parse(body)

    const nsValidation = validateNamespace(params.namespace, 'namespace')
    if (!nsValidation.isValid) {
      return NextResponse.json({ error: nsValidation.error }, { status: 400 })
    }

    const dbValidation = validateNamespace(params.database, 'database name')
    if (!dbValidation.isValid) {
      return NextResponse.json({ error: dbValidation.error }, { status: 400 })
    }

    const tableValidation = validateIdentifier(params.table)
    if (!tableValidation.isValid) {
      return NextResponse.json({ error: tableValidation.error }, { status: 400 })
    }

    logger.info(
      `[${requestId}] Inserting into ${params.table} on ${params.host}:${params.port}/${params.namespace}/${params.database}`
    )

    const rows = Array.isArray(params.data)
      ? (params.data as Record<string, unknown>[])
      : [params.data as Record<string, unknown>]

    const statement = `INSERT INTO \`${params.table}\` ${JSON.stringify(rows)};`

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

    logger.info(`[${requestId}] Insert executed successfully, ${records.length} record(s) created`)

    return NextResponse.json({
      message: `Data inserted successfully. ${records.length} record(s) created.`,
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
    logger.error(`[${requestId}] SurrealDB insert failed:`, error)

    return NextResponse.json(
      { error: `SurrealDB insert failed: ${errorMessage}` },
      { status: 500 }
    )
  }
}
