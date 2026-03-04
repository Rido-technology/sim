export interface SurrealDBConnectionConfig {
  host: string
  port: number
  namespace: string
  database: string
  username: string
  password: string
  protocol: 'http' | 'https'
}

export interface SurrealDBResult {
  time: string
  status: 'OK' | 'ERR'
  result: unknown
}

export function buildAuthHeaders(config: SurrealDBConnectionConfig): Record<string, string> {
  const credentials = Buffer.from(`${config.username}:${config.password}`).toString('base64')
  return {
    Authorization: `Basic ${credentials}`,
    // v2+ header names
    'Surreal-NS': config.namespace,
    'Surreal-DB': config.database,
    // v1 header names (kept for backward compatibility)
    NS: config.namespace,
    DB: config.database,
    'Content-Type': 'text/plain',
    Accept: 'application/json',
  }
}

export function buildUrl(config: SurrealDBConnectionConfig): string {
  return `${config.protocol}://${config.host}:${config.port}/sql`
}

export async function executeSurQL(
  config: SurrealDBConnectionConfig,
  statement: string
): Promise<SurrealDBResult[]> {
  const response = await fetch(buildUrl(config), {
    method: 'POST',
    headers: buildAuthHeaders(config),
    body: statement,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`SurrealDB HTTP error ${response.status}: ${text}`)
  }

  const results = (await response.json()) as SurrealDBResult[]

  for (const result of results) {
    if (result.status === 'ERR') {
      throw new Error(String(result.result))
    }
  }

  return results
}

export function validateIdentifier(identifier: string): { isValid: boolean; error?: string } {
  const recordIdPattern = /^[a-zA-Z_][a-zA-Z0-9_]*(:[a-zA-Z0-9_⟨⟩`'".-]+)?$/
  if (!recordIdPattern.test(identifier)) {
    return {
      isValid: false,
      error: `Invalid identifier: "${identifier}". Must be a table name (e.g. person) or record ID (e.g. person:john).`,
    }
  }
  return { isValid: true }
}

export function validateNamespace(value: string, label: string): { isValid: boolean; error?: string } {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
    return {
      isValid: false,
      error: `Invalid ${label}: must start with a letter or underscore and contain only letters, numbers, and underscores.`,
    }
  }
  return { isValid: true }
}

export function validateReadOnlyQuery(query: string): { isValid: boolean; error?: string } {
  const trimmed = query.trim()
  const readOnlyStatements = /^(select|info\s+for|show|return|value)\s+/i
  if (!readOnlyStatements.test(trimmed)) {
    return {
      isValid: false,
      error:
        'Only SELECT, INFO FOR, SHOW, RETURN, and VALUE statements are allowed here. Use Execute Raw SurrealQL for write operations.',
    }
  }
  return { isValid: true }
}

export function validateExecuteStatement(query: string): { isValid: boolean; error?: string } {
  const trimmed = query.trim()
  const allowedStatements =
    /^(select|info\s+for|show|return|value|create|insert|update|upsert|relate|delete|define|remove|alter|begin|cancel|commit|use|let|throw|sleep|break|continue|return)\s+/i
  if (!allowedStatements.test(trimmed)) {
    return { isValid: false, error: 'Statement type not allowed' }
  }
  return { isValid: true }
}

export interface SurrealDBIntrospectionResult {
  tables: Array<{
    name: string
    definition: string
    fields: Array<{ name: string; definition: string }>
    indexes: Array<{ name: string; definition: string }>
    events: Record<string, string>
  }>
  tableNames: string[]
}

export async function executeIntrospect(
  config: SurrealDBConnectionConfig
): Promise<SurrealDBIntrospectionResult> {
  const dbInfoResults = await executeSurQL(config, 'INFO FOR DB;')
  const dbInfo = dbInfoResults[0].result as {
    tables?: Record<string, string>
    tb?: Record<string, string>
  }

  const tablesMap = dbInfo.tables ?? dbInfo.tb ?? {}
  const tableNames = Object.keys(tablesMap)
  const tables = []

  for (const tableName of tableNames) {
    const tableInfoResults = await executeSurQL(config, `INFO FOR TABLE \`${tableName}\`;`)
    const tableInfo = tableInfoResults[0].result as {
      fields?: Record<string, string>
      fd?: Record<string, string>
      indexes?: Record<string, string>
      ix?: Record<string, string>
      events?: Record<string, string>
      ev?: Record<string, string>
    }

    const fieldsMap = tableInfo.fields ?? tableInfo.fd ?? {}
    const indexesMap = tableInfo.indexes ?? tableInfo.ix ?? {}
    const eventsMap = tableInfo.events ?? tableInfo.ev ?? {}

    tables.push({
      name: tableName,
      definition: tablesMap[tableName],
      fields: Object.entries(fieldsMap).map(([name, definition]) => ({ name, definition })),
      indexes: Object.entries(indexesMap).map(([name, definition]) => ({ name, definition })),
      events: eventsMap,
    })
  }

  return { tables, tableNames }
}
