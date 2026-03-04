import { SurrealDBIcon } from '@/components/icons'
import type { BlockConfig } from '@/blocks/types'
import type { SurrealDBIntrospectResponse, SurrealDBResponse } from '@/tools/surrealdb/types'

export const SurrealDBBlock: BlockConfig<SurrealDBResponse | SurrealDBIntrospectResponse> = {
  type: 'surrealdb',
  name: 'SurrealDB',
  description: 'Connect to SurrealDB database',
  longDescription:
    'Integrate SurrealDB into the workflow. Can query, insert, update, delete records, execute raw SurrealQL, and introspect schemas. Supports both document and graph data models.',
  docsLink: 'https://docs.sim.ai/tools/surrealdb',
  category: 'tools',
  bgColor: '#F0E6FF',
  icon: SurrealDBIcon,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'Query (SELECT)', id: 'query' },
        { label: 'Insert Records', id: 'insert' },
        { label: 'Update Records', id: 'update' },
        { label: 'Delete Records', id: 'delete' },
        { label: 'Execute Raw SurrealQL', id: 'execute' },
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
      placeholder: 'localhost or your.surrealdb.host',
      required: true,
    },
    {
      id: 'port',
      title: 'Port',
      type: 'short-input',
      placeholder: '8000',
      value: () => '8000',
      required: true,
    },
    {
      id: 'namespace',
      title: 'Namespace',
      type: 'short-input',
      placeholder: 'myapp',
      required: true,
    },
    {
      id: 'database',
      title: 'Database',
      type: 'short-input',
      placeholder: 'production',
      required: true,
    },
    {
      id: 'username',
      title: 'Username',
      type: 'short-input',
      placeholder: 'root',
      required: true,
    },
    {
      id: 'password',
      title: 'Password',
      type: 'short-input',
      password: true,
      placeholder: 'Your SurrealDB password',
      required: true,
    },
    // Query
    {
      id: 'query',
      title: 'SurrealQL Query',
      type: 'code',
      placeholder: 'SELECT * FROM person WHERE age > 18 LIMIT 100',
      condition: { field: 'operation', value: 'query' },
      required: true,
      wandConfig: {
        enabled: true,
        maintainHistory: true,
        prompt: `You are an expert SurrealDB developer. Write SurrealQL SELECT queries based on the user's request.

### CONTEXT
{context}

### CRITICAL INSTRUCTION
Return ONLY the SurrealQL query. Do not include any explanations, markdown formatting, comments, or additional text. Just the raw SurrealQL.

### QUERY GUIDELINES
1. **Syntax**: Use SurrealQL-specific syntax and functions
2. **Record IDs**: Reference specific records with table:id syntax (e.g., person:john)
3. **Traversal**: Use graph traversal operators -> and <- for relationships
4. **Projections**: Use FETCH to resolve record links
5. **Filtering**: Use WHERE with SurrealQL operators

### SURREALQL FEATURES
- Flexible record IDs: person:john, order:ulid(), product:uuid()
- Array functions: array::len(), array::sort(), array::group()
- String functions: string::uppercase(), string::slug()
- Math functions: math::sum(), math::mean(), math::round()
- Time: time::now(), time::format(), time::day()
- Graph traversal: SELECT ->purchased->product FROM person:john
- FETCH to resolve links: SELECT * FROM order FETCH customer, items

### EXAMPLES

**Simple Select**: "Get all active users"
→ SELECT * FROM person WHERE active = true ORDER BY name LIMIT 100;

**Specific Record**: "Get order by ID"
→ SELECT * FROM order:abc123;

**Graph Traversal**: "Get products purchased by a user"
→ SELECT ->purchased->product.* FROM person:john;

**Aggregation**: "Count orders by status"
→ SELECT status, count() AS total FROM order GROUP BY status;

**With FETCH**: "Get orders with customer details"
→ SELECT *, customer.name, customer.email FROM order FETCH customer;

**Date Filter**: "Get events in the last 7 days"
→ SELECT * FROM event WHERE created_at > time::now() - 7d ORDER BY created_at DESC;

### REMEMBER
Return ONLY the SurrealQL query - no explanations, no markdown, no extra text.`,
        placeholder: 'Describe the query you need...',
        generationType: 'sql-query',
      },
    },
    // Execute
    {
      id: 'query',
      title: 'SurrealQL Statement',
      type: 'code',
      placeholder: 'DEFINE TABLE person SCHEMALESS PERMISSIONS FULL;',
      condition: { field: 'operation', value: 'execute' },
      required: true,
      wandConfig: {
        enabled: true,
        maintainHistory: true,
        prompt: `You are an expert SurrealDB developer. Write SurrealQL statements based on the user's request.

### CONTEXT
{context}

### CRITICAL INSTRUCTION
Return ONLY the SurrealQL statement. Do not include any explanations, markdown formatting, or additional text.

### SURREALQL DDL EXAMPLES
- Define table: DEFINE TABLE person SCHEMALESS PERMISSIONS FULL;
- Define field: DEFINE FIELD name ON person TYPE string;
- Define index: DEFINE INDEX email_idx ON person FIELDS email UNIQUE;
- Relate records: RELATE person:john->purchased->product:iphone;
- Create record: CREATE person:john SET name = "John", age = 25;

### REMEMBER
Return ONLY the SurrealQL statement - no explanations, no markdown, no extra text.`,
        placeholder: 'Describe the SurrealQL statement you need...',
        generationType: 'sql-query',
      },
    },
    // Insert
    {
      id: 'table',
      title: 'Table Name',
      type: 'short-input',
      placeholder: 'person',
      condition: { field: 'operation', value: 'insert' },
      required: true,
    },
    {
      id: 'data',
      title: 'Data (JSON)',
      type: 'code',
      placeholder: '{\n  "name": "John Doe",\n  "email": "john@example.com",\n  "age": 25\n}',
      condition: { field: 'operation', value: 'insert' },
      required: true,
    },
    // Update
    {
      id: 'target',
      title: 'Target (Table or Record ID)',
      type: 'short-input',
      placeholder: 'person or person:john',
      condition: { field: 'operation', value: 'update' },
      required: true,
    },
    {
      id: 'data',
      title: 'Update Data (JSON)',
      type: 'code',
      placeholder: '{\n  "active": true,\n  "updated_at": "2024-01-01"\n}',
      condition: { field: 'operation', value: 'update' },
      required: true,
    },
    {
      id: 'where',
      title: 'WHERE Condition',
      type: 'short-input',
      placeholder: 'age > 18',
      condition: { field: 'operation', value: 'update' },
    },
    // Delete
    {
      id: 'target',
      title: 'Target (Table or Record ID)',
      type: 'short-input',
      placeholder: 'person or person:john',
      condition: { field: 'operation', value: 'delete' },
      required: true,
    },
    {
      id: 'where',
      title: 'WHERE Condition',
      type: 'short-input',
      placeholder: 'active = false',
      condition: { field: 'operation', value: 'delete' },
    },
  ],
  tools: {
    access: [
      'surrealdb_query',
      'surrealdb_insert',
      'surrealdb_update',
      'surrealdb_delete',
      'surrealdb_execute',
      'surrealdb_introspect',
    ],
    config: {
      tool: (params) => {
        switch (params.operation) {
          case 'query':
            return 'surrealdb_query'
          case 'insert':
            return 'surrealdb_insert'
          case 'update':
            return 'surrealdb_update'
          case 'delete':
            return 'surrealdb_delete'
          case 'execute':
            return 'surrealdb_execute'
          case 'introspect':
            return 'surrealdb_introspect'
          default:
            throw new Error(`Invalid SurrealDB operation: ${params.operation}`)
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
          port: typeof rest.port === 'string' ? Number.parseInt(rest.port, 10) : rest.port || 8000,
          namespace: rest.namespace,
          database: rest.database,
          username: rest.username,
          password: rest.password,
          protocol: rest.protocol || 'http',
        }

        const result: Record<string, unknown> = { ...connectionConfig }

        if (rest.table) result.table = rest.table
        if (rest.target) result.target = rest.target
        if (rest.query) result.query = rest.query
        if (rest.where) result.where = rest.where
        if (parsedData !== undefined) result.data = parsedData

        return result
      },
    },
  },
  inputs: {
    operation: { type: 'string', description: 'Database operation to perform' },
    protocol: { type: 'string', description: 'HTTP protocol (http or https)' },
    host: { type: 'string', description: 'SurrealDB host' },
    port: { type: 'string', description: 'SurrealDB HTTP port' },
    namespace: { type: 'string', description: 'SurrealDB namespace' },
    database: { type: 'string', description: 'SurrealDB database name' },
    username: { type: 'string', description: 'SurrealDB username' },
    password: { type: 'string', description: 'SurrealDB password' },
    table: { type: 'string', description: 'Table name for insert operations' },
    target: { type: 'string', description: 'Table or record ID for update/delete operations' },
    query: { type: 'string', description: 'SurrealQL query or statement to execute' },
    data: { type: 'json', description: 'Data for insert/update operations' },
    where: { type: 'string', description: 'WHERE condition for update/delete operations' },
  },
  outputs: {
    message: {
      type: 'string',
      description: 'Success or error message describing the operation outcome',
    },
    records: {
      type: 'array',
      description: 'Array of records returned or affected by the operation',
    },
    recordCount: {
      type: 'number',
      description: 'Number of records returned or affected',
    },
  },
}
