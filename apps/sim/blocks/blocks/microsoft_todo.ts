import { MicrosoftTodoIcon } from '@/components/icons'
import type { BlockConfig } from '@/blocks/types'
import { AuthMode } from '@/blocks/types'
import type { ToolResponse } from '@/tools/types'

interface MicrosoftTodoBlockParams {
  credential: string
  accessToken?: string
  operation: string
  listId?: string
  taskId?: string
  checklistItemId?: string
  attachmentId?: string
  displayName?: string
  title?: string
  body?: string
  bodyType?: string
  importance?: string
  status?: string
  dueDateTime?: string
  dueTimeZone?: string
  startDateTime?: string
  startTimeZone?: string
  reminderDateTime?: string
  reminderTimeZone?: string
  isReminderOn?: string
  categories?: string
  recurrence?: string
  isChecked?: string
  webUrl?: string
  applicationName?: string
  filter?: string
  orderby?: string
  top?: number
  select?: string
  [key: string]: string | number | boolean | undefined
}

export const MicrosoftTodoBlock: BlockConfig<ToolResponse> = {
  type: 'microsoft_todo',
  name: 'Microsoft To Do',
  description: 'Manage tasks, task lists, and checklist items in Microsoft To Do',
  authMode: AuthMode.OAuth,
  longDescription:
    'Integrate Microsoft To Do into your workflow. Create and manage task lists, tasks, subtasks (checklist items), and attachments. Set reminders, due dates, and categories to organize your work.',
  docsLink: 'https://docs.sim.ai/tools/microsoft_todo',
  category: 'tools',
  bgColor: '#ffffff',
  icon: MicrosoftTodoIcon,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'List Task Lists', id: 'list_task_lists' },
        { label: 'Get Task List', id: 'get_task_list' },
        { label: 'Create Task List', id: 'create_task_list' },
        { label: 'Update Task List', id: 'update_task_list' },
        { label: 'Delete Task List', id: 'delete_task_list' },
        { label: 'List Tasks', id: 'list_tasks' },
        { label: 'Get Task', id: 'get_task' },
        { label: 'Create Task', id: 'create_task' },
        { label: 'Update Task', id: 'update_task' },
        { label: 'Delete Task', id: 'delete_task' },
        { label: 'Complete Task', id: 'complete_task' },
        { label: 'Reopen Task', id: 'reopen_task' },
        { label: 'List Checklist Items', id: 'list_checklist_items' },
        { label: 'Create Checklist Item', id: 'create_checklist_item' },
        { label: 'Update Checklist Item', id: 'update_checklist_item' },
        { label: 'Delete Checklist Item', id: 'delete_checklist_item' },
        { label: 'List Attachments', id: 'list_attachments' },
        { label: 'Get Attachment', id: 'get_attachment' },
        { label: 'Add Attachment', id: 'add_attachment' },
        { label: 'Delete Attachment', id: 'delete_attachment' },
      ],
      value: () => 'list_tasks',
    },
    {
      id: 'credential',
      title: 'Microsoft Account',
      type: 'oauth-input',
      serviceId: 'microsoft-todo',
      requiredScopes: [
        'openid',
        'profile',
        'email',
        'User.Read',
        'Tasks.ReadWrite',
        'Tasks.ReadWrite.Shared',
        'offline_access',
      ],
      placeholder: 'Select Microsoft account',
      required: true,
    },

    // List ID
    {
      id: 'listId',
      title: 'Task List ID',
      type: 'short-input',
      placeholder: 'Enter task list ID',
      condition: {
        field: 'operation',
        value: [
          'get_task_list',
          'update_task_list',
          'delete_task_list',
          'list_tasks',
          'get_task',
          'create_task',
          'update_task',
          'delete_task',
          'complete_task',
          'reopen_task',
          'list_checklist_items',
          'create_checklist_item',
          'update_checklist_item',
          'delete_checklist_item',
          'list_attachments',
          'get_attachment',
          'add_attachment',
          'delete_attachment',
        ],
      },
      required: true,
      dependsOn: ['credential'],
    },

    // Task ID
    {
      id: 'taskId',
      title: 'Task ID',
      type: 'short-input',
      placeholder: 'Enter task ID',
      condition: {
        field: 'operation',
        value: [
          'get_task',
          'update_task',
          'delete_task',
          'complete_task',
          'reopen_task',
          'list_checklist_items',
          'create_checklist_item',
          'update_checklist_item',
          'delete_checklist_item',
          'list_attachments',
          'get_attachment',
          'add_attachment',
          'delete_attachment',
        ],
      },
      required: true,
      dependsOn: ['credential'],
    },

    // Checklist Item ID
    {
      id: 'checklistItemId',
      title: 'Checklist Item ID',
      type: 'short-input',
      placeholder: 'Enter checklist item ID',
      condition: {
        field: 'operation',
        value: ['update_checklist_item', 'delete_checklist_item'],
      },
      required: true,
      dependsOn: ['credential'],
    },

    // Attachment ID
    {
      id: 'attachmentId',
      title: 'Attachment ID',
      type: 'short-input',
      placeholder: 'Enter attachment ID',
      condition: {
        field: 'operation',
        value: ['get_attachment', 'delete_attachment'],
      },
      required: true,
      dependsOn: ['credential'],
    },

    // Display Name (for task lists and checklist items)
    {
      id: 'displayName',
      title: 'Name',
      type: 'short-input',
      placeholder: 'Enter name',
      condition: {
        field: 'operation',
        value: [
          'create_task_list',
          'update_task_list',
          'create_checklist_item',
          'update_checklist_item',
          'add_attachment',
        ],
      },
      required: {
        field: 'operation',
        value: ['create_task_list', 'create_checklist_item', 'add_attachment'],
      },
      dependsOn: ['credential'],
    },

    // Task Title
    {
      id: 'title',
      title: 'Task Title',
      type: 'short-input',
      placeholder: 'Enter task title',
      condition: {
        field: 'operation',
        value: ['create_task', 'update_task'],
      },
      required: {
        field: 'operation',
        value: 'create_task',
      },
      dependsOn: ['credential'],
    },

    // Task Body
    {
      id: 'body',
      title: 'Description',
      type: 'long-input',
      placeholder: 'Enter task description or notes',
      condition: {
        field: 'operation',
        value: ['create_task', 'update_task'],
      },
      dependsOn: ['credential'],
    },

    // Body Type
    {
      id: 'bodyType',
      title: 'Content Type',
      type: 'dropdown',
      options: [
        { label: 'Plain Text', id: 'text' },
        { label: 'HTML', id: 'html' },
      ],
      value: () => 'text',
      condition: {
        field: 'operation',
        value: ['create_task', 'update_task'],
      },
    },

    // Importance
    {
      id: 'importance',
      title: 'Importance',
      type: 'dropdown',
      options: [
        { label: 'Low', id: 'low' },
        { label: 'Normal', id: 'normal' },
        { label: 'High', id: 'high' },
      ],
      value: () => 'normal',
      condition: {
        field: 'operation',
        value: ['create_task', 'update_task'],
      },
    },

    // Status
    {
      id: 'status',
      title: 'Status',
      type: 'dropdown',
      options: [
        { label: 'Not Started', id: 'notStarted' },
        { label: 'In Progress', id: 'inProgress' },
        { label: 'Completed', id: 'completed' },
        { label: 'Waiting On Others', id: 'waitingOnOthers' },
        { label: 'Deferred', id: 'deferred' },
      ],
      value: () => 'notStarted',
      condition: {
        field: 'operation',
        value: ['create_task', 'update_task'],
      },
    },

    // Due Date Time
    {
      id: 'dueDateTime',
      title: 'Due Date & Time',
      type: 'short-input',
      placeholder: 'ISO 8601 format (e.g., 2026-03-15T17:00:00)',
      condition: {
        field: 'operation',
        value: ['create_task', 'update_task'],
      },
      dependsOn: ['credential'],
    },

    // Due Time Zone
    {
      id: 'dueTimeZone',
      title: 'Due Time Zone',
      type: 'short-input',
      placeholder: 'e.g., Pacific Standard Time',
      value: () => 'UTC',
      condition: {
        field: 'operation',
        value: ['create_task', 'update_task'],
      },
    },

    // Start Date Time
    {
      id: 'startDateTime',
      title: 'Start Date & Time',
      type: 'short-input',
      placeholder: 'ISO 8601 format',
      condition: {
        field: 'operation',
        value: ['create_task', 'update_task'],
      },
      dependsOn: ['credential'],
    },

    // Start Time Zone
    {
      id: 'startTimeZone',
      title: 'Start Time Zone',
      type: 'short-input',
      placeholder: 'e.g., Pacific Standard Time',
      value: () => 'UTC',
      condition: {
        field: 'operation',
        value: ['create_task', 'update_task'],
      },
    },

    // Reminder Date Time
    {
      id: 'reminderDateTime',
      title: 'Reminder Date & Time',
      type: 'short-input',
      placeholder: 'ISO 8601 format',
      condition: {
        field: 'operation',
        value: ['create_task', 'update_task'],
      },
      dependsOn: ['credential'],
    },

    // Reminder Time Zone
    {
      id: 'reminderTimeZone',
      title: 'Reminder Time Zone',
      type: 'short-input',
      placeholder: 'e.g., Pacific Standard Time',
      value: () => 'UTC',
      condition: {
        field: 'operation',
        value: ['create_task', 'update_task'],
      },
    },

    // Is Reminder On
    {
      id: 'isReminderOn',
      title: 'Enable Reminder',
      type: 'dropdown',
      options: [
        { label: 'Yes', id: 'true' },
        { label: 'No', id: 'false' },
      ],
      value: () => 'false',
      condition: {
        field: 'operation',
        value: ['create_task', 'update_task'],
      },
    },

    // Categories
    {
      id: 'categories',
      title: 'Categories',
      type: 'short-input',
      placeholder: 'JSON array: ["Work", "Important"]',
      condition: {
        field: 'operation',
        value: ['create_task', 'update_task'],
      },
      dependsOn: ['credential'],
    },

    // Recurrence
    {
      id: 'recurrence',
      title: 'Recurrence Pattern',
      type: 'long-input',
      placeholder: 'JSON object for recurrence',
      condition: {
        field: 'operation',
        value: ['create_task', 'update_task'],
      },
      dependsOn: ['credential'],
    },

    // Is Checked (for checklist items)
    {
      id: 'isChecked',
      title: 'Is Checked',
      type: 'dropdown',
      options: [
        { label: 'Yes', id: 'true' },
        { label: 'No', id: 'false' },
      ],
      value: () => 'false',
      condition: {
        field: 'operation',
        value: ['update_checklist_item'],
      },
    },

    // Web URL (for attachments)
    {
      id: 'webUrl',
      title: 'Web URL',
      type: 'short-input',
      placeholder: 'Enter the URL to attach',
      condition: {
        field: 'operation',
        value: 'add_attachment',
      },
      required: true,
      dependsOn: ['credential'],
    },

    // Application Name (for attachments)
    {
      id: 'applicationName',
      title: 'Application Name',
      type: 'short-input',
      placeholder: 'e.g., SharePoint, OneDrive, Web',
      value: () => 'Web',
      condition: {
        field: 'operation',
        value: 'add_attachment',
      },
    },

    // Query Parameters
    {
      id: 'filter',
      title: 'Filter',
      type: 'short-input',
      placeholder: 'OData filter (e.g., status eq \'completed\')',
      condition: {
        field: 'operation',
        value: ['list_task_lists', 'list_tasks'],
      },
      dependsOn: ['credential'],
    },

    {
      id: 'orderby',
      title: 'Order By',
      type: 'short-input',
      placeholder: 'Sort field (e.g., dueDateTime/dateTime)',
      condition: {
        field: 'operation',
        value: ['list_task_lists', 'list_tasks'],
      },
      dependsOn: ['credential'],
    },

    {
      id: 'top',
      title: 'Limit',
      type: 'short-input',
      placeholder: 'Maximum number of results',
      condition: {
        field: 'operation',
        value: ['list_task_lists', 'list_tasks'],
      },
      dependsOn: ['credential'],
    },

    {
      id: 'select',
      title: 'Select Fields',
      type: 'short-input',
      placeholder: 'Comma-separated fields to return',
      condition: {
        field: 'operation',
        value: ['list_task_lists', 'list_tasks'],
      },
      dependsOn: ['credential'],
    },
  ],
  tools: {
    access: [
      'microsoft_todo_list_task_lists',
      'microsoft_todo_get_task_list',
      'microsoft_todo_create_task_list',
      'microsoft_todo_update_task_list',
      'microsoft_todo_delete_task_list',
      'microsoft_todo_list_tasks',
      'microsoft_todo_get_task',
      'microsoft_todo_create_task',
      'microsoft_todo_update_task',
      'microsoft_todo_delete_task',
      'microsoft_todo_complete_task',
      'microsoft_todo_reopen_task',
      'microsoft_todo_list_checklist_items',
      'microsoft_todo_create_checklist_item',
      'microsoft_todo_update_checklist_item',
      'microsoft_todo_delete_checklist_item',
      'microsoft_todo_list_attachments',
      'microsoft_todo_get_attachment',
      'microsoft_todo_add_attachment',
      'microsoft_todo_delete_attachment',
    ],
    config: {
      tool: (params) => `microsoft_todo_${params.operation}`,
      params: (params) => {
        const baseParams: Record<string, unknown> = {
          accessToken: params.accessToken,
        }

        if (params.listId) {
          baseParams.listId = params.listId
        }

        if (params.taskId) {
          baseParams.taskId = params.taskId
        }

        if (params.checklistItemId) {
          baseParams.checklistItemId = params.checklistItemId
        }

        if (params.attachmentId) {
          baseParams.attachmentId = params.attachmentId
        }

        if (params.displayName) {
          baseParams.displayName = params.displayName
        }

        if (params.title) {
          baseParams.title = params.title
        }

        if (params.body) {
          baseParams.body = params.body
        }

        if (params.bodyType) {
          baseParams.bodyType = params.bodyType
        }

        if (params.importance) {
          baseParams.importance = params.importance
        }

        if (params.status) {
          baseParams.status = params.status
        }

        if (params.dueDateTime) {
          baseParams.dueDateTime = params.dueDateTime
        }

        if (params.dueTimeZone) {
          baseParams.dueTimeZone = params.dueTimeZone
        }

        if (params.startDateTime) {
          baseParams.startDateTime = params.startDateTime
        }

        if (params.startTimeZone) {
          baseParams.startTimeZone = params.startTimeZone
        }

        if (params.reminderDateTime) {
          baseParams.reminderDateTime = params.reminderDateTime
        }

        if (params.reminderTimeZone) {
          baseParams.reminderTimeZone = params.reminderTimeZone
        }

        if (params.isReminderOn) {
          baseParams.isReminderOn = params.isReminderOn === 'true'
        }

        if (params.categories) {
          baseParams.categories = params.categories
        }

        if (params.recurrence) {
          baseParams.recurrence = params.recurrence
        }

        if (params.isChecked) {
          baseParams.isChecked = params.isChecked === 'true'
        }

        if (params.webUrl) {
          baseParams.webUrl = params.webUrl
        }

        if (params.applicationName) {
          baseParams.applicationName = params.applicationName
        }

        if (params.filter) {
          baseParams.filter = params.filter
        }

        if (params.orderby) {
          baseParams.orderby = params.orderby
        }

        if (params.top) {
          baseParams.top = Number(params.top)
        }

        if (params.select) {
          baseParams.select = params.select
        }

        return baseParams
      },
    },
  },
  inputs: {},
  outputs: {
    data: {
      type: 'json',
      description: 'The response data from the Microsoft To Do API',
    },
  },
}
