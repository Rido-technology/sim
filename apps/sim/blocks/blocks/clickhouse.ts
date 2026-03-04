import { ClickHouseIcon } from '@/components/icons'
import type { BlockConfig } from '@/blocks/types'
import type { ClickHouseResponse } from '@/tools/clickhouse/types'

export const ClickHouseBlock: BlockConfig<ClickHouseResponse> = {
  type: 'clickhouse',
  name: 'ClickHouse',
  description: 'Connect to ClickHouse database',
  longDescription:
    'Integrate ClickHouse into the workflow. Can query, insert, execute raw SQL, and introspect schemas. Optimized for OLAP analytics workloads.',
  docsLink: 'https://docs.sim.ai/tools/clickhouse',
  category: 'tools',
  bgColor: '#FFCC00',
  icon: ClickHouseIcon,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'Query (SELECT)', id: 'query' },
        { label: 'Insert Data', id: 'insert' },
        { label: 'Execute Raw SQL', id: 'execute' },
        { label: 'Introspect Schema', id: 'introspect' },
      ],
      value: () => 'query',
    },
    {
      id: 'protocol',
      title: 'Protocol',
      type: 'dropdown',
      options: [
        { label: 'HTTP', id: 'http' },
        { label: 'HTTPS', id: 'https' },
      ],
      value: () => 'http',
    },
    {
      id: 'host',
      title: 'Host',
      type: 'short-input',
      placeholder: 'localhost or your.clickhouse.host',
      required: true,
    },
    {
      id: 'port',
      title: 'Port',
      type: 'short-input',
      placeholder: '8123',
      value: () => '8123',
      required: true,
    },
    {
      id: 'database',
      title: 'Database Name',
      type: 'short-input',
      placeholder: 'default',
      required: true,
    },
    {
      id: 'username',
      title: 'Username',
      type: 'short-input',
      placeholder: 'default',
      required: true,
    },
    {
      id: 'password',
      title: 'Password',
      type: 'short-input',
      password: true,
      placeholder: 'Your ClickHouse password',
      required: true,
    },
    {
      id: 'table',
      title: 'Table Name',
      type: 'short-input',
      placeholder: 'events',
      condition: { field: 'operation', value: 'insert' },
      required: true,
    },
    {
      id: 'query',
      title: 'SQL Query',
      type: 'code',
      placeholder: 'SELECT * FROM events WHERE toDate(timestamp) = today() LIMIT 100',
      condition: { field: 'operation', value: 'query' },
      required: true,
      wandConfig: {
        enabled: true,
        maintainHistory: true,
        prompt: `You are an expert ClickHouse database developer. Write ClickHouse SQL queries based on the user's request.

### CONTEXT
{context}

### CRITICAL INSTRUCTION
Return ONLY the SQL query. Do not include any explanations, markdown formatting, comments, or additional text. Just the raw SQL query.

### QUERY GUIDELINES
1. **Syntax**: Use ClickHouse-specific syntax and functions
2. **Performance**: Leverage ClickHouse's columnar storage and vectorized execution
3. **Readability**: Format queries with proper indentation and spacing
4. **Best Practices**: Use ORDER BY, PARTITION BY, and appropriate engines

### CLICKHOUSE FEATURES
- Use ClickHouse-specific functions (toDate, toDateTime, arrayJoin, groupArray, etc.)
- Leverage MergeTree engine features and sorting keys
- Use proper ClickHouse data types (UInt32, String, DateTime, Array, etc.)
- Apply LIMIT and SAMPLE for large datasets
- Use WITH for CTEs, arrayFunctions for nested data

### EXAMPLES

**Time-Series Query**: "Get hourly event counts for the last 24 hours"
→ SELECT
      toStartOfHour(timestamp) AS hour,
      count() AS event_count
  FROM events
  WHERE timestamp >= now() - INTERVAL 1 DAY
  GROUP BY hour
  ORDER BY hour;

**Top N Analytics**: "Get top 10 pages by views today"
→ SELECT
      page_url,
      count() AS views,
      uniq(user_id) AS unique_visitors
  FROM page_views
  WHERE toDate(timestamp) = today()
  GROUP BY page_url
  ORDER BY views DESC
  LIMIT 10;

### REMEMBER
Return ONLY the SQL query - no explanations, no markdown, no extra text.`,
        placeholder: 'Describe the SQL query you need...',
        generationType: 'sql-query',
      },
    },
    {
      id: 'query',
      title: 'SQL Statement',
      type: 'code',
      placeholder: 'SELECT * FROM table_name LIMIT 100',
      condition: { field: 'operation', value: 'execute' },
      required: true,
      wandConfig: {
        enabled: true,
        maintainHistory: true,
        prompt: `You are an expert ClickHouse database developer. Write ClickHouse SQL statements based on the user's request.

### CONTEXT
{context}

### CRITICAL INSTRUCTION
Return ONLY the SQL statement. Do not include any explanations, markdown formatting, comments, or additional text. Just the raw SQL.

### QUERY GUIDELINES
1. **Syntax**: Use ClickHouse-specific SQL syntax
2. **DDL**: Use CREATE TABLE with appropriate engines (MergeTree, ReplicatedMergeTree, etc.)
3. **Mutations**: Use ALTER TABLE ... UPDATE/DELETE for data mutations
4. **Best Practices**: Follow ClickHouse naming conventions and engine selection

### REMEMBER
Return ONLY the SQL statement - no explanations, no markdown, no extra text.`,
        placeholder: 'Describe the SQL statement you need...',
        generationType: 'sql-query',
      },
    },
    {
      id: 'data',
      title: 'Data (JSON)',
      type: 'code',
      placeholder:
        '{\n  "event": "page_view",\n  "user_id": 123,\n  "timestamp": "2024-01-01 00:00:00"\n}',
      condition: { field: 'operation', value: 'insert' },
      required: true,
    },
  ],
  tools: {
    access: [
      'clickhouse_query',
      'clickhouse_insert',
      'clickhouse_execute',
      'clickhouse_introspect',
    ],
    config: {
      tool: (params) => {
        switch (params.operation) {
          case 'query':
            return 'clickhouse_query'
          case 'insert':
            return 'clickhouse_insert'
          case 'execute':
            return 'clickhouse_execute'
          case 'introspect':
            return 'clickhouse_introspect'
          default:
            throw new Error(`Invalid ClickHouse operation: ${params.operation}`)
        }
      },
      params: (params) => {
        const { operation, data, ...rest } = params

        let parsedData
        if (data && typeof data === 'string' && data.trim()) {
          try {
            parsedData = JSON.parse(data)
          } catch (parseError) {
            const errorMsg = parseError instanceof Error ? parseError.message : 'Unknown JSON error'
            throw new Error(`Invalid JSON data format: ${errorMsg}. Please check your JSON syntax.`)
          }
        } else if (data && typeof data === 'object') {
          parsedData = data
        }

        const connectionConfig = {
          host: rest.host,
          port: typeof rest.port === 'string' ? Number.parseInt(rest.port, 10) : rest.port || 8123,
          database: rest.database,
          username: rest.username,
          password: rest.password,
          protocol: rest.protocol || 'http',
        }

        const result: Record<string, unknown> = { ...connectionConfig }

        if (rest.table) result.table = rest.table
        if (rest.query) result.query = rest.query
        if (parsedData !== undefined) result.data = parsedData

        return result
      },
    },
  },
  inputs: {
    operation: { type: 'string', description: 'Database operation to perform' },
    protocol: { type: 'string', description: 'HTTP protocol (http or https)' },
    host: { type: 'string', description: 'ClickHouse host' },
    port: { type: 'string', description: 'ClickHouse HTTP port' },
    database: { type: 'string', description: 'Database name' },
    username: { type: 'string', description: 'ClickHouse username' },
    password: { type: 'string', description: 'ClickHouse password' },
    table: { type: 'string', description: 'Table name for insert operations' },
    query: { type: 'string', description: 'SQL query or statement to execute' },
    data: { type: 'json', description: 'Data for insert operations' },
  },
  outputs: {
    message: {
      type: 'string',
      description: 'Success or error message describing the operation outcome',
    },
    rows: {
      type: 'array',
      description: 'Array of rows returned from the query',
    },
    rowCount: {
      type: 'number',
      description: 'Number of rows affected or returned by the operation',
    },
  },
}
