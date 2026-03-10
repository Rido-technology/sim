import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { checkInternalAuth } from '@/lib/auth/hybrid'
import { generateRequestId } from '@/lib/core/utils/request'
import type { GraphQLRequestParams } from '@/tools/graphql/types'
import type { TableRow } from '@/tools/types'

const logger = createLogger('GraphQLRequestAPI')

export const dynamic = 'force-dynamic'

function buildHeaders(rows: TableRow[] | undefined): Record<string, string> {
  if (!rows) return {}
  return rows.reduce<Record<string, string>>((acc, row) => {
    const key = row.cells?.Key
    const value = row.cells?.Value
    if (key) acc[key] = value ?? ''
    return acc
  }, {})
}

function buildQueryParams(
  baseUrl: string,
  rows: TableRow[] | undefined
): string {
  const url = new URL(baseUrl)
  if (rows) {
    for (const row of rows) {
      const key = row.cells?.Key
      const value = row.cells?.Value
      if (key) url.searchParams.set(key, value ?? '')
    }
  }
  return url.toString()
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()

  const authResult = await checkInternalAuth(request, { requireWorkflowId: false })
  if (!authResult.success) {
    logger.warn(`[${requestId}] Unauthorized GraphQL request attempt`)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let params: GraphQLRequestParams

  try {
    params = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!params.url) {
    return NextResponse.json({ error: 'Missing required parameter: url' }, { status: 400 })
  }

  if (!params.query) {
    return NextResponse.json({ error: 'Missing required parameter: query' }, { status: 400 })
  }

  const timeoutMs = (Number(params.timeout) || 30) * 1000

  try {
    const targetUrl = buildQueryParams(params.url, params.params)

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...buildHeaders(params.headers),
    }

    let parsedVariables: Record<string, unknown> | undefined
    if (params.variables) {
      try {
        parsedVariables = JSON.parse(params.variables)
      } catch {
        logger.warn(`[${requestId}] Failed to parse GraphQL variables as JSON`)
      }
    }

    const cleanQuery = params.query.replace(/\\"/g, '"')

    const methodsWithBody = ['POST', 'PUT', 'PATCH', 'DELETE'];
    const method = (params.method || 'POST').toUpperCase();
    
    const graphqlBody = methodsWithBody.includes(method)
      ? JSON.stringify({
          query: cleanQuery, 
          ...(parsedVariables && { variables: parsedVariables }),
        })
      : undefined;

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    let fetchOptions: RequestInit = {
      method,
      headers: requestHeaders,
      body: graphqlBody,
      signal: controller.signal,
    }

    if (params.useProxy && params.proxyHost && params.proxyPort) {
      try {
        const { ProxyAgent } = await import('undici')
        const proxyAuth =
          params.proxyUsername && params.proxyPassword
            ? `${encodeURIComponent(params.proxyUsername)}:${encodeURIComponent(params.proxyPassword)}@`
            : ''
        const proxyUrl = `http://${proxyAuth}${params.proxyHost}:${params.proxyPort}`

        fetchOptions = {
          ...fetchOptions,
          // @ts-expect-error - undici dispatcher is not in standard fetch types
          dispatcher: new ProxyAgent(proxyUrl),
        }

        logger.info(`[${requestId}] Using proxy: ${params.proxyHost}:${params.proxyPort}`)
      } catch (error) {
        logger.warn(`[${requestId}] Failed to initialize proxy agent, proceeding without proxy:`, {
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    let graphqlResponse: Response

    try {
      graphqlResponse = await fetch(targetUrl, fetchOptions)
    } finally {
      clearTimeout(timeoutId)
    }

    const responseHeaders: Record<string, string> = {}
    graphqlResponse.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })

    const contentType = graphqlResponse.headers.get('content-type') || ''
    const graphqlData = contentType.includes('application/json')
      ? await graphqlResponse.json()
      : await graphqlResponse.text()

    logger.info(`[${requestId}] GraphQL request completed`, {
      url: params.url,
      status: graphqlResponse.status,
    })

    return NextResponse.json({
      graphqlStatus: graphqlResponse.status,
      graphqlHeaders: responseHeaders,
      graphqlData,
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      logger.warn(`[${requestId}] GraphQL request timed out after ${params.timeout ?? 30}s`)
      return NextResponse.json(
        { error: `Request timed out after ${params.timeout ?? 30} seconds` },
        { status: 408 }
      )
    }

    const message = error instanceof Error ? error.message : 'Failed to execute GraphQL request'
    logger.error(`[${requestId}] GraphQL request failed:`, { error: message })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
