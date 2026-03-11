import { GraphQLIcon } from '@/components/icons'
import type { BlockConfig } from '@/blocks/types'
import type { GraphQLRequestResponse } from '@/tools/graphql/types'

export const GraphQLBlock: BlockConfig<GraphQLRequestResponse> = {
  type: 'graphql',
  name: 'GraphQL',
  description: 'Execute GraphQL queries',
  longDescription:
    'Execute GraphQL queries and mutations against any GraphQL endpoint. Supports custom headers, variables, and operation names for flexible API interactions.',
  docsLink: 'https://docs.sim.ai/blocks/graphql',
  category: 'tools',
  bgColor: '#E10098',
  icon: GraphQLIcon,
  subBlocks: [
    {
      id: 'url',
      title: 'GraphQL Endpoint',
      type: 'short-input',
      placeholder: 'https://api.example.com/graphql',
      required: true,
    },
    {
      id: 'query',
      title: 'Query',
      type: 'code',
      placeholder: 'query { users { id name email } }',
      language: 'json',
      required: true,
      wandConfig: {
        enabled: true,
        maintainHistory: true,
        prompt: `You are an expert GraphQL developer.
Generate ONLY the raw GraphQL query or mutation based on the user's request.
Do not include any explanations, markdown formatting, or other text outside the GraphQL operation.

Current query: {context}

You have access to the following variables you can use in the GraphQL query:
- Use angle brackets for workflow variables, e.g., '<blockName.output>'.
- Use double curly braces for environment variables, e.g., '{{ENV_VAR_NAME}}'.

Guidelines:
1. Write clean, well-formatted GraphQL queries or mutations
2. Include all necessary fields in the selection set
3. Use variables for dynamic values (define them in the query and pass them in the Variables section)
4. Include operation names for better debugging
5. Add comments in GraphQL syntax (#) to explain complex operations

Example Query with Variables:
query GetUser($userId: ID!) {
  user(id: $userId) {
    id
    name
    email
    posts {
      title
      createdAt
    }
  }
}

Example Mutation:
mutation CreatePost($title: String!, $content: String!) {
  createPost(input: { title: $title, content: $content }) {
    id
    title
    content
    author {
      name
    }
  }
}`,
        placeholder: 'Describe the GraphQL query or mutation you need...',
      },
    },
    {
      id: 'variables',
      title: 'Variables',
      type: 'code',
      placeholder: '{ "userId": "123" }',
      language: 'json',
      description: 'JSON object with variables for the GraphQL query',
      wandConfig: {
        enabled: true,
        maintainHistory: true,
        prompt: `You are an expert JSON programmer.
Generate ONLY a valid JSON object for GraphQL variables based on the user's request.
The output MUST be a single, valid JSON object, starting with { and ending with }.

Current variables: {context}

Do not include any explanations, markdown formatting, or other text outside the JSON object.

You have access to the following variables:
- Use angle brackets for workflow variables, e.g., '<blockName.output>'.
- Use double curly braces for environment variables, e.g., '{{ENV_VAR_NAME}}'.

Example:
{
  "userId": "<user.id>",
  "limit": 10,
  "status": "active"
}`,
        placeholder: 'Describe the variables you need...',
        generationType: 'json-object',
      },
    },
    {
      id: 'operationName',
      title: 'Operation Name',
      type: 'short-input',
      placeholder: 'GetUser (optional)',
      description: 'Optional operation name for queries with multiple operations',
      mode: 'advanced',
    },
    {
      id: 'headers',
      title: 'Headers',
      type: 'table',
      columns: ['Key', 'Value'],
      description: 'Optional custom headers (e.g., Authorization, API keys)',
    },
    {
      id: 'timeout',
      title: 'Timeout',
      type: 'short-input',
      placeholder: '300000',
      description: 'Request timeout in milliseconds (default: 300000 = 5 minutes)',
      mode: 'advanced',
    },
  ],
  tools: {
    access: ['graphql_request'],
  },
  inputs: {
    url: { type: 'string', description: 'GraphQL endpoint URL' },
    query: { type: 'string', description: 'GraphQL query or mutation' },
    variables: { type: 'json', description: 'Variables for the GraphQL query' },
    headers: { type: 'json', description: 'Custom headers for the request' },
    operationName: { type: 'string', description: 'Optional operation name' },
    timeout: { type: 'number', description: 'Request timeout in milliseconds' },
  },
  outputs: {
    data: { type: 'json', description: 'Data returned from the GraphQL query' },
    errors: {
      type: 'array',
      description: 'GraphQL errors if any occurred',
    },
    extensions: {
      type: 'json',
      description: 'Additional extensions data from the GraphQL response',
    },
  },
}
