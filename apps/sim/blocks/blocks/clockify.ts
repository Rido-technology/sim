import { ClockifyIcon } from '@/components/icons'
import type { BlockConfig } from '@/blocks/types'
import { AuthMode } from '@/blocks/types'
import type { ClockifyCreateTaskResponse } from '@/tools/clockify/types'
import { getTrigger } from '@/triggers'

export const ClockifyBlock: BlockConfig<ClockifyCreateTaskResponse> = {
  type: 'clockify',
  name: 'Clockify',
  description: 'Time tracking and project management',
  authMode: AuthMode.ApiKey,
  longDescription:
    'Integrate with Clockify to track time, manage tasks, and monitor project progress. Create time entries, start/stop timers, manage tasks, and get detailed time reports.',
  docsLink: 'https://docs.sim.ai/tools/clockify',
  category: 'tools',
  bgColor: '#ffffff',
  icon: ClockifyIcon,
  triggerAllowed: true,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'Get Workspaces', id: 'get_workspaces' },
        { label: 'Get Workspace Details', id: 'get_workspace_details' },
        { label: 'Get Projects', id: 'get_projects' },
        { label: 'Create Task', id: 'create_task' },
        { label: 'Create Time Entry', id: 'create_time_entry' },
        { label: 'Start Timer', id: 'start_timer' },
        { label: 'Stop Timer', id: 'stop_timer' },
        { label: 'Get Current Timer', id: 'get_current_timer' },
        { label: 'Get Task', id: 'get_task' },
        { label: 'Get Time Entries', id: 'get_time_entries' },
        { label: 'Custom API Call', id: 'custom_api' },
      ],
      value: () => 'create_time_entry',
    },
    {
      id: 'apiKey',
      title: 'Clockify API Key',
      type: 'short-input',
      placeholder: 'Enter your Clockify API key from Profile Settings',
      password: true,
      required: true,
    },

    /**
     * Workspace ID field - appears for most operations except get_workspaces
     */
    {
      id: 'workspaceId',
      title: 'Workspace ID',
      type: 'short-input',
      placeholder: 'Enter workspace ID (leave empty for auto-resolve)',
      condition: {
        field: 'operation',
        value: ['create_task', 'create_time_entry', 'start_timer', 'stop_timer', 'get_current_timer', 'get_task', 'get_time_entries', 'get_workspace_details', 'get_projects'],
      },
      required: {
        field: 'operation',
        value: ['get_workspace_details', 'get_projects'],
      },
    },

    /**
     * Get Projects fields
     */
    {
      id: 'archived',
      title: 'Include Archived Projects',
      type: 'dropdown',
      options: [
        { label: 'No (Active Projects)', id: 'false' },
        { label: 'Yes (Archived Projects)', id: 'true' },
      ],
      value: 'false',
      condition: {
        field: 'operation',
        value: 'get_projects',
      },
    },
    {
      id: 'name',
      title: 'Filter by Name',
      type: 'short-input',
      placeholder: 'Filter projects by name (optional)',
      condition: {
        field: 'operation',
        value: 'get_projects',
      },
    },
    {
      id: 'page',
      title: 'Page Number',
      type: 'short-input',
      placeholder: '1',
      condition: {
        field: 'operation',
        value: ['get_projects', 'get_task', 'get_time_entries'],
      },
    },
    {
      id: 'pageSize',
      title: 'Page Size',
      type: 'short-input',
      placeholder: '50',
      condition: {
        field: 'operation',
        value: ['get_projects', 'get_task', 'get_time_entries'],
      },
    },

    /**
     * Create Task fields
     */
    {
      id: 'projectId',
      title: 'Project ID',
      type: 'short-input',
      placeholder: 'Enter project ID',
      condition: {
        field: 'operation',
        value: 'create_task',
      },
      required: true,
    },
    {
      id: 'name',
      title: 'Task Name',
      type: 'short-input',
      placeholder: 'Enter task name',
      condition: {
        field: 'operation',
        value: 'create_task',
      },
      required: true,
    },
    {
      id: 'billable',
      title: 'Billable Task',
      type: 'dropdown',
      options: [
        { label: 'Yes', id: 'true' },
        { label: 'No', id: 'false' },
      ],
      value: 'true',
      condition: {
        field: 'operation',
        value: 'create_task',
      },
    },
    {
      id: 'assigneeIds',
      title: 'Assignee IDs',
      type: 'short-input',
      placeholder: 'Comma-separated user IDs (optional)',
      condition: {
        field: 'operation',
        value: 'create_task',
      },
    },
    {
      id: 'estimate',
      title: 'Time Estimate',
      type: 'short-input',
      placeholder: 'ISO 8601 duration (e.g. PT1H30M) (optional)',
      condition: {
        field: 'operation',
        value: 'create_task',
      },
    },
    {
      id: 'status',
      title: 'Task Status',
      type: 'dropdown',
      options: [
        { label: 'Active', id: 'ACTIVE' },
        { label: 'Done', id: 'DONE' },
      ],
      value: 'ACTIVE',
      condition: {
        field: 'operation',
        value: 'create_task',
      },
    },

    /**
     * Create Time Entry fields
     */
    {
      id: 'start',
      title: 'Start Time',
      type: 'short-input',
      placeholder: 'ISO 8601 datetime (e.g. 2023-01-01T10:00:00Z)',
      condition: {
        field: 'operation',
        value: 'create_time_entry',
      },
      required: true,
    },
    {
      id: 'end',
      title: 'End Time',
      type: 'short-input',
      placeholder: 'ISO 8601 datetime (e.g. 2023-01-01T11:30:00Z)',
      condition: {
        field: 'operation',
        value: 'create_time_entry',
      },
      required: true,
    },
    {
      id: 'description',
      title: 'Description',
      type: 'long-input',
      placeholder: 'Enter time entry description (optional)',
      condition: {
        field: 'operation',
        value: ['create_time_entry', 'start_timer'],
      },
    },
    {
      id: 'projectId',
      title: 'Project ID',
      type: 'short-input',
      placeholder: 'Enter project ID (optional)',
      condition: {
        field: 'operation',
        value: ['create_time_entry', 'start_timer'],
      },
    },
    {
      id: 'taskId',
      title: 'Task ID',
      type: 'short-input',
      placeholder: 'Enter task ID',
      condition: {
        field: 'operation',
        value: 'create_time_entry',
      },
      required: true,
    },
    {
      id: 'taskId',
      title: 'Task ID',
      type: 'short-input',
      placeholder: 'Enter task ID (optional)',
      condition: {
        field: 'operation',
        value: 'start_timer',
      },
    },
    {
      id: 'tagIds',
      title: 'Tag IDs',
      type: 'short-input',
      placeholder: 'Comma-separated tag IDs (optional)',
      condition: {
        field: 'operation',
        value: ['create_time_entry', 'start_timer'],
      },
    },

    /**
     * Stop Timer fields
     */
    {
      id: 'userId',
      title: 'User ID',
      type: 'short-input',
      placeholder: 'User ID (leave empty for auto-resolve)',
      condition: {
        field: 'operation',
        value: ['stop_timer', 'get_current_timer', 'get_time_entries'],
      },
    },
    {
      id: 'end',
      title: 'End Time',
      type: 'short-input',
      placeholder: 'ISO 8601 datetime (leave empty for current time)',
      condition: {
        field: 'operation',
        value: 'stop_timer',
      },
    },

    /**
     * Get Task fields
     */
    {
      id: 'projectId',
      title: 'Project ID',
      type: 'short-input',
      placeholder: 'Enter project ID',
      condition: {
        field: 'operation',
        value: 'get_task',
      },
      required: true,
    },
    {
      id: 'taskId',
      title: 'Task ID',
      type: 'short-input',
      placeholder: 'Enter task ID (optional)',
      condition: {
        field: 'operation',
        value: 'get_task',
      },
    },
    {
      id: 'name',
      title: 'Task Name',
      type: 'short-input',
      placeholder: 'Search by task name (optional)',
      condition: {
        field: 'operation',
        value: 'get_task',
      },
    },

    /**
     * Get Time Entries fields
     */
    {
      id: 'start',
      title: 'Start Date',
      type: 'short-input',
      placeholder: 'ISO 8601 date (e.g. 2023-01-01T00:00:00Z) (optional)',
      condition: {
        field: 'operation',
        value: 'get_time_entries',
      },
    },
    {
      id: 'end',
      title: 'End Date',
      type: 'short-input',
      placeholder: 'ISO 8601 date (e.g. 2023-01-31T23:59:59Z) (optional)',
      condition: {
        field: 'operation',
        value: 'get_time_entries',
      },
    },
    {
      id: 'project',
      title: 'Project Name/ID',
      type: 'short-input',
      placeholder: 'Filter by project (optional)',
      condition: {
        field: 'operation',
        value: 'get_time_entries',
      },
    },
    {
      id: 'task',
      title: 'Task Name/ID',
      type: 'short-input',
      placeholder: 'Filter by task (optional)',
      condition: {
        field: 'operation',
        value: 'get_time_entries',
      },
    },

    /**
     * Custom API fields
     */
    {
      id: 'method',
      title: 'HTTP Method',
      type: 'dropdown',
      options: [
        { label: 'GET', id: 'GET' },
        { label: 'POST', id: 'POST' },
        { label: 'PUT', id: 'PUT' },
        { label: 'PATCH', id: 'PATCH' },
        { label: 'DELETE', id: 'DELETE' },
      ],
      value: () => 'GET',
      condition: {
        field: 'operation',
        value: 'custom_api',
      },
    },
    {
      id: 'endpoint',
      title: 'Endpoint Path',
      type: 'short-input',
      placeholder: '/workspaces, /user, /workspaces/{id}/projects...',
      condition: {
        field: 'operation',
        value: 'custom_api',
      },
      required: true,
    },
    {
      id: 'body',
      title: 'Request Body (JSON)',
      type: 'long-input',
      placeholder: '{"key": "value"} (for POST/PUT/PATCH)',
      condition: {
        field: 'operation',
        value: 'custom_api',
      },
    },
    ...getTrigger('clockify_webhook').subBlocks,
  ],
  tools: {
    access: [
      'clockify_get_workspaces',
      'clockify_get_workspace_details',
      'clockify_get_projects',
      'clockify_create_task',
      'clockify_create_time_entry',
      'clockify_start_timer', 
      'clockify_stop_timer',
      'clockify_get_current_timer',
      'clockify_get_task',
      'clockify_get_time_entries',
      'clockify_custom_api',
    ],
    config: {
      tool: (params) => `clockify_${params.operation}`,
      params: (params) => {
        const baseParams: Record<string, unknown> = {
          apiKey: params.apiKey,
        }

        // Add workspaceId for most operations (except get_workspaces)
        if (params.workspaceId && params.operation !== 'get_workspaces') {
          baseParams.workspaceId = params.workspaceId
        }

        switch (params.operation) {
          case 'get_workspaces':
            return baseParams
          case 'get_workspace_details':
            return {
              ...baseParams,
              workspaceId: params.workspaceId,
            }
          case 'get_projects':
            return {
              ...baseParams,
              archived: params.archived === 'true' ? true : false,
              name: params.name || undefined,
              page: params.page ? parseInt(params.page) : undefined,
              pageSize: params.pageSize ? parseInt(params.pageSize) : 50,
            }
          case 'create_task':
            return {
              ...baseParams,
              projectId: params.projectId,
              name: params.name,
              billable: params.billable === 'true' ? true : false,
              assigneeIds: params.assigneeIds?.split(',').map((s: string) => s.trim()).filter(Boolean),
              estimate: params.estimate || undefined,
              status: params.status,
            }
          case 'create_time_entry':
            return {
              ...baseParams,
              start: params.start,
              end: params.end,
              description: params.description,
              projectId: params.projectId,
              taskId: params.taskId,
              tagIds: params.tagIds?.split(',').map((s: string) => s.trim()).filter(Boolean),
            }
          case 'start_timer':
            return {
              ...baseParams,
              description: params.description,
              projectId: params.projectId,
              taskId: params.taskId,
              tagIds: params.tagIds?.split(',').map((s: string) => s.trim()).filter(Boolean),
            }
          case 'stop_timer':
            return {
              ...baseParams,
              userId: params.userId,
              end: params.end,
            }
          case 'get_current_timer':
            return {
              ...baseParams,
              userId: params.userId,
            }
          case 'get_task':
            return {
              ...baseParams,
              projectId: params.projectId,
              taskId: params.taskId,
              name: params.name,
              page: params.page ? parseInt(params.page) : undefined,
              pageSize: params.pageSize ? parseInt(params.pageSize) : undefined,
            }
          case 'get_time_entries':
            return {
              ...baseParams,
              userId: params.userId,
              description: params.description,
              start: params.start,
              end: params.end,
              project: params.project,
              task: params.task,
              page: params.page ? parseInt(params.page) : undefined,
              pageSize: params.pageSize ? parseInt(params.pageSize) : undefined,
            }
          case 'custom_api':
            return {
              ...baseParams,
              method: params.method,
              endpoint: params.endpoint,
              body: params.body,
            }
          default:
            return baseParams
        }
      },
    },
  },
  inputs: {
    operation: { type: 'string', description: 'Operation to perform' },
    apiKey: { type: 'string', description: 'Clockify API key from profile settings' },
    workspaceId: { type: 'string', description: 'Clockify workspace ID' },
    projectId: { type: 'string', description: 'Project ID' },
    taskId: { type: 'string', description: 'Task ID' },
    name: { type: 'string', description: 'Name (for tasks, projects)' },
    description: { type: 'string', description: 'Description' },
    start: { type: 'string', description: 'Start time/date (ISO 8601)' },
    end: { type: 'string', description: 'End time/date (ISO 8601)' },
    userId: { type: 'string', description: 'User ID' },
    assigneeIds: { type: 'string', description: 'Comma-separated assignee IDs' },
    estimate: { type: 'string', description: 'Time estimate (ISO 8601 duration)' },
    status: { type: 'string', description: 'Task status (ACTIVE/DONE)' },
    tagIds: { type: 'string', description: 'Comma-separated tag IDs' },
    project: { type: 'string', description: 'Project name/ID filter' },
    task: { type: 'string', description: 'Task name/ID filter' },
    page: { type: 'string', description: 'Page number for pagination' },
    pageSize: { type: 'string', description: 'Page size for pagination' },
    archived: { type: 'string', description: 'Include archived items (true/false)' },
    method: { type: 'string', description: 'HTTP method for custom API calls' },
    endpoint: { type: 'string', description: 'API endpoint path' },
    body: { type: 'string', description: 'JSON request body for custom API calls' },
    clientId: { type: 'string', description: 'Client ID for projects' },
    isPublic: { type: 'string', description: 'Whether project is public (true/false)' },
    billable: { type: 'string', description: 'Whether project is billable by default (true/false)' },
    color: { type: 'string', description: 'Project color (hex code)' },
  },
  outputs: {
    id: { type: 'string', description: 'Resource ID' },
    name: { type: 'string', description: 'Resource name' },
    description: { type: 'string', description: 'Description' },
    timeInterval: { type: 'json', description: 'Time interval information' },
    projectId: { type: 'string', description: 'Associated project ID' },
    taskId: { type: 'string', description: 'Associated task ID' },
    status: { type: 'string', description: 'Status information' },
    data: { type: 'json', description: 'Response data' },
    isRunning: { type: 'boolean', description: 'Timer running status' },
    timeEntries: { type: 'array', description: 'List of time entries' },
    tasks: { type: 'array', description: 'List of tasks' },
    projects: { type: 'array', description: 'List of projects' },
    workspaces: { type: 'array', description: 'List of workspaces' },
    hourlyRate: { type: 'json', description: 'Workspace hourly rate' },
    memberships: { type: 'array', description: 'Workspace memberships' },
    workspaceSettings: { type: 'json', description: 'Workspace settings' },
    imageUrl: { type: 'string', description: 'Workspace image URL' },
    featureSubscriptionType: { type: 'string', description: 'Feature subscription type' },
  },
  triggers: {
    enabled: true,
    available: [
      'clockify_webhook',
    ],
  },
}