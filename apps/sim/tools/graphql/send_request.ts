import type { GraphQLRequestParams, GraphQLRequestResponse } from '@/tools/graphql/types'
import type { ToolConfig } from '@/tools/types'

export const graphqlRequestTool: ToolConfig<GraphQLRequestParams, GraphQLRequestResponse> = {
  id: 'graphql_request',
  name: 'GraphQL Request',
  description:
    'Send a GraphQL query or mutation to any GraphQL endpoint with support for headers, query parameters, variables, and optional proxy routing.',
  version: '1.0.0',

  params: {
    method: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'HTTP method to use for the GraphQL request (GET, POST, PUT, PATCH, DELETE, or HEAD)',
    },
    url: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'The GraphQL endpoint URL',
    },
    params: {
      type: 'object',
      visibility: 'user-or-llm',
      description: 'URL query parameters to append to the request',
    },
    headers: {
      type: 'object',
      visibility: 'user-or-llm',
      description: 'HTTP headers to include with the request',
    },
    query: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'The GraphQL query or mutation document',
    },
    variables: {
      type: 'string',
      visibility: 'user-or-llm',
      description: 'JSON-encoded GraphQL variables object',
    },
    useProxy: {
      type: 'boolean',
      visibility: 'user-only',
      description: 'Whether to route the request through a proxy server',
    },
    proxyHost: {
      type: 'string',
      visibility: 'user-only',
      description: 'Proxy server hostname or IP address',
    },
    proxyPort: {
      type: 'string',
      visibility: 'user-only',
      description: 'Proxy server port number',
    },
    proxyUsername: {
      type: 'string',
      visibility: 'user-only',
      description: 'Proxy authentication username',
    },
    proxyPassword: {
      type: 'string',
      visibility: 'user-only',
      description: 'Proxy authentication password',
    },
    timeout: {
      type: 'number',
      visibility: 'user-only',
      description: 'Request timeout in seconds',
    },
  },

  request: {
    url: '/api/tools/graphql/request',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  transformResponse: async (response: Response): Promise<GraphQLRequestResponse> => {
    const envelope = await response.json()

    const graphqlStatus: number = envelope.graphqlStatus ?? response.status
    const graphqlHeaders: Record<string, string> = envelope.graphqlHeaders ?? {}
    const graphqlData: unknown = envelope.graphqlData ?? envelope

    if (!response.ok) {
      return {
        success: false,
        output: {
          data: graphqlData,
          status: graphqlStatus,
          headers: graphqlHeaders,
        },
        error: envelope.error ?? `GraphQL request failed with status ${graphqlStatus}`,
      }
    }

    if (graphqlStatus < 200 || graphqlStatus >= 300) {
      return {
        success: false,
        output: {
          data: graphqlData,
          status: graphqlStatus,
          headers: graphqlHeaders,
        },
        error: `GraphQL endpoint returned status ${graphqlStatus}`,
      }
    }

    const body = graphqlData as Record<string, unknown>
    const hasErrors =
      typeof body === 'object' &&
      body !== null &&
      Array.isArray(body.errors) &&
      (body.errors as unknown[]).length > 0

    return {
      success: !hasErrors,
      output: {
        data: body?.data ?? body,
        errors: body?.errors as unknown[] | undefined,
        status: graphqlStatus,
        headers: graphqlHeaders,
      },
      error: hasErrors ? JSON.stringify(body.errors) : undefined,
    }
  },

  outputs: {
    data: {
      type: 'json',
      description: 'The data field from the GraphQL response',
    },
    errors: {
      type: 'json',
      description: 'GraphQL errors returned by the server, if any',
      optional: true,
    },
    status: {
      type: 'number',
      description: 'HTTP status code of the response',
    },
    headers: {
      type: 'object',
      description: 'Response headers as key-value pairs',
    },
  },
}
