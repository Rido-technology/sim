import type { ToolConfig } from '@/tools/types'
import type { ClockifyCreateTimeEntryParams, ClockifyCreateTimeEntryResponse } from './types'

export const clockifyCreateTimeEntryTool: ToolConfig<
  ClockifyCreateTimeEntryParams,
  ClockifyCreateTimeEntryResponse
> = {
  id: 'clockify_create_time_entry',
  name: 'Clockify Create Time Entry',
  description: 'Create a completed time entry with a defined start and end time',
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
      description: 'Clockify workspace ID',
    },
    start: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Start time in ISO 8601 format (e.g. 2026-03-08T09:00:00Z)',
    },
    end: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'End time in ISO 8601 format (e.g. 2026-03-08T10:30:00Z)',
    },
    description: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Description of the time entry',
    },
    projectId: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Project ID to associate with this entry',
    },
    taskId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Task ID to associate with this entry (required)',
    },
    tagIds: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Comma-separated tag IDs',
    },
  },

  request: {
    url: '/api/tools/clockify/create-time-entry',
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
    id: { type: 'string', description: 'Time entry ID' },
    description: { type: 'string', description: 'Time entry description' },
    timeInterval: { type: 'json', description: 'Time interval (start, end, duration)' },
    projectId: { type: 'string', description: 'Associated project ID' },
    taskId: { type: 'string', description: 'Associated task ID' },
    tagIds: { type: 'array', description: 'Associated tag IDs' },
    workspaceId: { type: 'string', description: 'Workspace ID' },
  },
}
