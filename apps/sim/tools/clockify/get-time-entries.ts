import type { ToolConfig } from '@/tools/types'
import type { ClockifyGetTimeEntriesParams, ClockifyGetTimeEntriesResponse } from './types'

export const clockifyGetTimeEntriesTool: ToolConfig<
  ClockifyGetTimeEntriesParams,
  ClockifyGetTimeEntriesResponse
> = {
  id: 'clockify_get_time_entries',
  name: 'Clockify Search Time Entries',
  description: 'Search and filter time entries for a user in a workspace',
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
      required: false,
      visibility: 'user-or-llm',
      description: 'Clockify workspace ID (auto-resolved if empty)',
    },
    userId: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'User ID whose entries to fetch (auto-resolved if empty)',
    },
    description: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Filter by description (partial match)',
    },
    start: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Filter entries starting on or after this ISO 8601 date',
    },
    end: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Filter entries ending on or before this ISO 8601 date',
    },
    project: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Filter by project ID',
    },
    task: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Filter by task ID',
    },
    page: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'Page number (default: 1)',
    },
    pageSize: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'Results per page (default: 50, max: 200)',
    },
  },

  request: {
    url: '/api/tools/clockify/get-time-entries',
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
    timeEntries: { type: 'json', description: 'Array of time entries' },
  },
}
