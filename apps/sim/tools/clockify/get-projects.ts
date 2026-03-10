import type { ToolConfig } from '@/tools/types'
import type { ClockifyGetProjectsParams, ClockifyGetProjectsResponse } from './types'

export const clockifyGetProjectsTool: ToolConfig<
  ClockifyGetProjectsParams,
  ClockifyGetProjectsResponse
> = {
  id: 'clockify_get_projects',
  name: 'Clockify Get Projects',
  description: 'Get list of projects in a workspace',
  version: '1.0.0',

  params: {
    apiKey: {
      type: 'string',
      required: true,
      visibility: 'user-only',
      description: 'Clockify API key from Profile Settings',
    },
    workspaceId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Workspace ID to get projects from',
    },
    archived: {
      type: 'boolean',
      required: false,
      visibility: 'user-or-llm',
      description: 'Include archived projects (default: false)',
    },
    name: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Filter projects by name',
    },
    page: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'Page number for pagination (default: 1)',
    },
    pageSize: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'Number of projects per page (default: 50)',
    },
  },

  request: {
    url: '/api/tools/clockify/get-projects',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  transformResponse: async (response) => {
    const data = await response.json()
    if (data.error) {
      throw new Error(data.error)
    }
    return {
      success: true,
      output: {
        projects: data.projects || []
      }
    }
  },

  outputs: {
    projects: { type: 'array', description: 'List of projects in the workspace' },
  },
}