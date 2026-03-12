import type { GraphQLRequestParams, GraphQLRequestResponse } from '@/tools/graphql/types'
import { transformTable } from '@/tools/shared/table'
import type { ToolConfig } from '@/tools/types'

export const graphqlRequestTool: ToolConfig<GraphQLRequestParams, GraphQLRequestResponse> = {
  id: 'graphql_request',
  name: 'GraphQL Request',
  description:
    'Execute GraphQL queries and mutations against any GraphQL endpoint. Supports custom headers, variables, and operation names for flexible API interactions.',
  version: '1.0.0',

  params: {
    url: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'The GraphQL endpoint URL',
    },
    query: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'The GraphQL query or mutation',
    },
    variables: {
      type: 'object',
      visibility: 'user-or-llm',
      description: 'Variables to pass to the GraphQL query',
    },
    headers: {
      type: 'object',
      visibility: 'user-or-llm',
      description: 'HTTP headers to include with the request',
    },
    operationName: {
      type: 'string',
      visibility: 'user-or-llm',
      description: 'Optional operation name (for queries with multiple operations)',
    },
    timeout: {
      type: 'number',
      visibility: 'user-only',
      description: 'Request timeout in milliseconds (default: 300000 = 5 minutes)',
    },
  },

  request: {
    url: (params: GraphQLRequestParams) => params.url,

    method: () => 'POST',

    headers: (params: GraphQLRequestParams) => {
      const headers = params.headers
        ? Array.isArray(params.headers)
          ? transformTable(params.headers)
          : params.headers
        : {}

      return {
        'Content-Type': 'application/json',
        ...headers,
      }
    },

    body: (params: GraphQLRequestParams) => {
      const variables = params.variables
        ? Array.isArray(params.variables)
          ? transformTable(params.variables)
          : params.variables
        : undefined

      const body: Record<string, any> = {
        query: params.query,
      }

      if (variables && Object.keys(variables).length > 0) {
        body.variables = variables
      }

      if (params.operationName) {
        body.operationName = params.operationName
      }

      return body
    },
  },

  transformResponse: async (response: Response) => {
    const contentType = response.headers.get('content-type') || ''

    if (!contentType.includes('application/json')) {
      const text = await response.text()
      return {
        success: false,
        output: {
          data: null,
          errors: [
            {
              message: `Expected JSON response but got ${contentType}`,
              extensions: { responseText: text },
            },
          ],
        },
        error: `Invalid content type: ${contentType}`,
      }
    }

    try {
      const data = await response.json()

      // GraphQL responses always return 200, even with errors
      // Check if this is a valid GraphQL response
      if (data && typeof data === 'object') {
        const hasData = 'data' in data
        const hasErrors = 'errors' in data

        if (hasData || hasErrors) {
          return {
            success: !hasErrors || (hasData && data.data !== null),
            output: {
              data: data.data || null,
              errors: data.errors,
              extensions: data.extensions,
            },
            error: hasErrors ? data.errors[0]?.message : undefined,
          }
        }
      }

      // Not a valid GraphQL response
      return {
        success: false,
        output: {
          data: null,
          errors: [
            {
              message: 'Invalid GraphQL response format',
              extensions: { responseData: data },
            },
          ],
        },
        error: 'Invalid GraphQL response format',
      }
    } catch (err) {
      return {
        success: false,
        output: {
          data: null,
          errors: [
            {
              message: 'Failed to parse response',
              extensions: { error: err instanceof Error ? err.message : String(err) },
            },
          ],
        },
        error: err instanceof Error ? err.message : 'Failed to parse response',
      }
    }
  },

  outputs: {
    data: {
      type: 'json',
      description: 'The data returned by the GraphQL query',
      optional: true,
    },
    errors: {
      type: 'array',
      description: 'Any errors returned by the GraphQL server',
      optional: true,
      items: {
        type: 'object',
        description: 'GraphQL error object',
      },
    },
    extensions: {
      type: 'json',
      description: 'Additional extensions data from the GraphQL response',
      optional: true,
    },
  },
}
