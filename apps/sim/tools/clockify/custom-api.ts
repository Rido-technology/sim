import type { ToolConfig } from '@/tools/types'
import type { ClockifyCustomApiParams, ClockifyCustomApiResponse } from './types'

export const clockifyCustomApiTool: ToolConfig<
  ClockifyCustomApiParams,
  ClockifyCustomApiResponse
> = {
  id: 'clockify_custom_api',
  name: 'Clockify Custom API Call',
  description: 'Make a custom API call to any Clockify endpoint',
  version: '1.0.0',

  params: {
    apiKey: {
      type: 'string',
      required: true,
      visibility: 'user-only',
      description: 'Clockify API key from Profile Settings',
    },
    method: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'HTTP method: GET, POST, PUT, PATCH, or DELETE',
    },
    endpoint: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Endpoint path after /api/v1 (e.g. /workspaces or /user)',
    },
    body: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'JSON body for POST/PUT/PATCH requests',
    },
  },

  request: {
    url: '/api/tools/clockify/custom-api',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  transformResponse: async (response) => {
    const data = await response.json()
    if (data.error) throw new Error(data.error)
    return { success: true, output: data }
  },

  outputs: {
    status: { type: 'number', description: 'HTTP response status code' },
    data: { type: 'json', description: 'Response data from Clockify API' },
  },
}
