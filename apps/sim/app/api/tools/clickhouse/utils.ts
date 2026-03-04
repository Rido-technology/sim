import { createClient } from '@clickhouse/client'

export interface ClickHouseConnectionConfig {
  host: string
  port: number
  database: string
  username: string
  password: string
  protocol: 'http' | 'https'
}

export function createClickHouseClient(config: ClickHouseConnectionConfig) {
  return createClient({
    url: `${config.protocol}://${config.host}:${config.port}`,
    database: config.database,
    username: config.username,
    password: config.password,
  })
}

/**
 * Validates that a query is read-only (SELECT-class statements only).
 * Used by the query route to prevent DDL/DML from being sent through the
 * read path.
 *
 * Multi-statement injection (e.g. `SELECT 1; DROP TABLE t`) is handled
 * natively by ClickHouse — the HTTP interface rejects any request that
 * contains more than one statement, so no regex guard is needed for that.
 */
export function validateReadOnlyQuery(query: string): { isValid: boolean; error?: string } {
  const trimmed = query.trim()

  const readOnlyStatements = /^(select|with|show|describe|exists|explain)\s+/i
  if (!readOnlyStatements.test(trimmed)) {
    return {
      isValid: false,
      error:
        'Only SELECT, WITH, SHOW, DESCRIBE, EXISTS, and EXPLAIN statements are allowed here. Use Execute Raw SQL for DDL/DML.',
    }
  }

  return { isValid: true }
}

/**
 * Validates a raw SQL statement for the execute route.
 * Restricts to known statement types as a coarse guard; ClickHouse itself
 * enforces single-statement-per-request and rejects invalid SQL.
 */
export function validateExecuteQuery(query: string): { isValid: boolean; error?: string } {
  const trimmed = query.trim()

  const allowedStatements =
    /^(select|with|show|describe|exists|explain|create|alter|drop|truncate|optimize|insert|delete|rename|exchange|detach|attach)\s+/i
  if (!allowedStatements.test(trimmed)) {
    return { isValid: false, error: 'Statement type not allowed' }
  }

  return { isValid: true }
}

export function sanitizeIdentifier(identifier: string): string {
  if (identifier.includes('.')) {
    return identifier
      .split('.')
      .map((part) => sanitizeSingleIdentifier(part))
      .join('.')
  }

  return sanitizeSingleIdentifier(identifier)
}

function sanitizeSingleIdentifier(identifier: string): string {
  const cleaned = identifier.replace(/`/g, '').replace(/"/g, '')

  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(cleaned)) {
    throw new Error(
      `Invalid identifier: ${identifier}. Identifiers must start with a letter or underscore and contain only letters, numbers, and underscores.`
    )
  }

  return `\`${cleaned}\``
}

export function validateDatabaseName(name: string): { isValid: boolean; error?: string } {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
    return {
      isValid: false,
      error: 'Database name must start with a letter or underscore and contain only letters, numbers, and underscores.',
    }
  }
  return { isValid: true }
}

export interface ClickHouseIntrospectionResult {
  tables: Array<{
    name: string
    database: string
    engine: string
    orderBy: string[]
    primaryKey: string[]
    columns: Array<{
      name: string
      type: string
      nullable: boolean
      default: string | null
      isPrimaryKey: boolean
    }>
  }>
  databases: string[]
}

export async function executeIntrospect(
  client: ReturnType<typeof createClickHouseClient>,
  databaseName: string
): Promise<ClickHouseIntrospectionResult> {
  const dbResult = await client.query({
    query: `SELECT name FROM system.databases WHERE name NOT IN ('system', 'information_schema', 'INFORMATION_SCHEMA') ORDER BY name`,
    format: 'JSONEachRow',
  })
  const dbRows = (await dbResult.json()) as Array<{ name: string }>
  const databases = dbRows.map((row) => row.name)

  const tablesResult = await client.query({
    query: `
      SELECT name, engine, sorting_key, primary_key
      FROM system.tables
      WHERE database = {db: String}
        AND engine NOT LIKE '%View%'
        AND engine != 'Dictionary'
        AND engine != 'Memory'
      ORDER BY name
    `,
    query_params: { db: databaseName },
    format: 'JSONEachRow',
  })
  const tableRows = (await tablesResult.json()) as Array<{
    name: string
    engine: string
    sorting_key: string
    primary_key: string
  }>

  const tables = []

  for (const tableRow of tableRows) {
    const columnsResult = await client.query({
      query: `
        SELECT name, type, is_in_primary_key, default_kind, default_expression
        FROM system.columns
        WHERE database = {db: String} AND table = {tbl: String}
        ORDER BY position
      `,
      query_params: { db: databaseName, tbl: tableRow.name },
      format: 'JSONEachRow',
    })
    const columnRows = (await columnsResult.json()) as Array<{
      name: string
      type: string
      is_in_primary_key: number
      default_kind: string
      default_expression: string
    }>

    const orderBy = tableRow.sorting_key ? tableRow.sorting_key.split(', ').filter(Boolean) : []
    const primaryKey = tableRow.primary_key ? tableRow.primary_key.split(', ').filter(Boolean) : []

    const columns = columnRows.map((col) => ({
      name: col.name,
      type: col.type,
      nullable: col.type.startsWith('Nullable('),
      default: col.default_expression || null,
      isPrimaryKey: col.is_in_primary_key === 1,
    }))

    tables.push({
      name: tableRow.name,
      database: databaseName,
      engine: tableRow.engine,
      orderBy,
      primaryKey,
      columns,
    })
  }

  return { tables, databases }
}
