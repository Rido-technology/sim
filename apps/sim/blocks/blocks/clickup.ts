import { ClickUpIcon } from '@/components/icons'
import type { BlockConfig } from '@/blocks/types'
import { AuthMode } from '@/blocks/types'
import type { ClickUpResponse } from '@/tools/clickup/types'
import { getTrigger } from '@/triggers'

export const ClickUpBlock: BlockConfig<ClickUpResponse> = {
  type: 'clickup',
  name: 'ClickUp',
  description: 'Manage ClickUp tasks and projects',
  authMode: AuthMode.OAuth,
  longDescription:
    'Integrate with ClickUp to manage tasks, lists, spaces, and workspaces. Create tasks, update tasks, list tasks with filters, add comments, and more.',
  docsLink: 'https://docs.sim.ai/tools/clickup',
  category: 'tools',
  bgColor: '#ffffff',
  icon: ClickUpIcon,
  triggerAllowed: true,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'Get Workspace', id: 'get_workspace' },
        { label: 'List Spaces', id: 'list_spaces' },
        { label: 'List Lists', id: 'list_lists' },
        { label: 'List Tasks', id: 'list_tasks' },
        { label: 'Get Task', id: 'get_task' },
        { label: 'Create Task', id: 'create_task' },
        { label: 'Update Task', id: 'update_task' },
        { label: 'Add Comment', id: 'add_comment' },
      ],
      value: () => 'list_tasks',
    },
    {
      id: 'credential',
      title: 'ClickUp Account',
      type: 'oauth-input',
      serviceId: 'clickup',
      requiredScopes: [],
      placeholder: 'Select ClickUp account',
      required: true,
    },

    /**
     * Get Workspace fields
     */
    {
      id: 'teamId',
      title: 'Team ID (Optional)',
      type: 'short-input',
      placeholder: 'Leave empty to get all authorized workspaces',
      condition: {
        field: 'operation',
        value: 'get_workspace',
      },
    },

    /**
     * List Spaces fields
     */
    {
      id: 'teamId',
      title: 'Team ID',
      type: 'short-input',
      placeholder: 'Enter team/workspace ID',
      condition: {
        field: 'operation',
        value: 'list_spaces',
      },
      required: true,
    },
    {
      id: 'archived',
      title: 'Include Archived',
      type: 'dropdown',
      options: [
        { label: 'No', id: 'false' },
        { label: 'Yes', id: 'true' },
      ],
      value: () => 'false',
      condition: {
        field: 'operation',
        value: 'list_spaces',
      },
    },

    /**
     * List Lists fields
     */
    {
      id: 'spaceId',
      title: 'Space ID',
      type: 'short-input',
      placeholder: 'Enter space ID',
      condition: {
        field: 'operation',
        value: 'list_lists',
      },
      required: true,
    },
    {
      id: 'archived',
      title: 'Include Archived',
      type: 'dropdown',
      options: [
        { label: 'No', id: 'false' },
        { label: 'Yes', id: 'true' },
      ],
      value: () => 'false',
      condition: {
        field: 'operation',
        value: 'list_lists',
      },
    },

    /**
     * List Tasks fields
     */
    {
      id: 'listId',
      title: 'List ID',
      type: 'short-input',
      placeholder: 'Enter list ID',
      condition: {
        field: 'operation',
        value: 'list_tasks',
      },
      required: true,
    },
    {
      id: 'archived',
      title: 'Include Archived',
      type: 'dropdown',
      options: [
        { label: 'No', id: 'false' },
        { label: 'Yes', id: 'true' },
      ],
      value: () => 'false',
      condition: {
        field: 'operation',
        value: 'list_tasks',
      },
    },
    {
      id: 'include_closed',
      title: 'Include Closed',
      type: 'dropdown',
      options: [
        { label: 'No', id: 'false' },
        { label: 'Yes', id: 'true' },
      ],
      value: () => 'false',
      condition: {
        field: 'operation',
        value: 'list_tasks',
      },
    },
    {
      id: 'subtasks',
      title: 'Include Subtasks',
      type: 'dropdown',
      options: [
        { label: 'No', id: 'false' },
        { label: 'Yes', id: 'true' },
      ],
      value: () => 'false',
      condition: {
        field: 'operation',
        value: 'list_tasks',
      },
    },
    {
      id: 'order_by',
      title: 'Order By',
      type: 'dropdown',
      options: [
        { label: 'Created', id: 'created' },
        { label: 'Updated', id: 'updated' },
        { label: 'Due Date', id: 'due_date' },
        { label: 'ID', id: 'id' },
      ],
      value: () => 'created',
      condition: {
        field: 'operation',
        value: 'list_tasks',
      },
    },
    {
      id: 'reverse',
      title: 'Reverse Order',
      type: 'dropdown',
      options: [
        { label: 'No', id: 'false' },
        { label: 'Yes', id: 'true' },
      ],
      value: () => 'false',
      condition: {
        field: 'operation',
        value: 'list_tasks',
      },
    },

    /**
     * Get Task fields
     */
    {
      id: 'taskId',
      title: 'Task ID',
      type: 'short-input',
      placeholder: 'Enter task ID',
      condition: {
        field: 'operation',
        value: 'get_task',
      },
      required: true,
    },
    {
      id: 'include_subtasks',
      title: 'Include Subtasks',
      type: 'dropdown',
      options: [
        { label: 'No', id: 'false' },
        { label: 'Yes', id: 'true' },
      ],
      value: () => 'false',
      condition: {
        field: 'operation',
        value: 'get_task',
      },
    },

    /**
     * Create Task fields
     */
    {
      id: 'listId',
      title: 'List ID',
      type: 'short-input',
      placeholder: 'Enter list ID where task will be created',
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
      id: 'description',
      title: 'Description',
      type: 'long-input',
      placeholder: 'Enter task description (supports markdown)',
      condition: {
        field: 'operation',
        value: 'create_task',
      },
    },
    {
      id: 'status',
      title: 'Status',
      type: 'short-input',
      placeholder: 'Enter status name (e.g., "to do", "in progress")',
      condition: {
        field: 'operation',
        value: 'create_task',
      },
    },
    {
      id: 'priority',
      title: 'Priority',
      type: 'dropdown',
      options: [
        { label: 'None', id: '' },
        { label: 'Urgent', id: '1' },
        { label: 'High', id: '2' },
        { label: 'Normal', id: '3' },
        { label: 'Low', id: '4' },
      ],
      value: () => '',
      condition: {
        field: 'operation',
        value: 'create_task',
      },
    },
    {
      id: 'assignees',
      title: 'Assignees',
      type: 'short-input',
      placeholder: 'Enter user IDs separated by commas',
      condition: {
        field: 'operation',
        value: 'create_task',
      },
    },
    {
      id: 'tags',
      title: 'Tags',
      type: 'short-input',
      placeholder: 'Enter tag names separated by commas',
      condition: {
        field: 'operation',
        value: 'create_task',
      },
    },
    {
      id: 'due_date',
      title: 'Due Date',
      type: 'short-input',
      placeholder: 'Unix timestamp in milliseconds',
      condition: {
        field: 'operation',
        value: 'create_task',
      },
    },
    {
      id: 'notify_all',
      title: 'Notify All Assignees',
      type: 'dropdown',
      options: [
        { label: 'No', id: 'false' },
        { label: 'Yes', id: 'true' },
      ],
      value: () => 'true',
      condition: {
        field: 'operation',
        value: 'create_task',
      },
    },

    /**
     * Update Task fields
     */
    {
      id: 'taskId',
      title: 'Task ID',
      type: 'short-input',
      placeholder: 'Enter task ID to update',
      condition: {
        field: 'operation',
        value: 'update_task',
      },
      required: true,
    },
    {
      id: 'name',
      title: 'New Task Name',
      type: 'short-input',
      placeholder: 'Enter new task name (optional)',
      condition: {
        field: 'operation',
        value: 'update_task',
      },
    },
    {
      id: 'description',
      title: 'New Description',
      type: 'long-input',
      placeholder: 'Enter new description (optional)',
      condition: {
        field: 'operation',
        value: 'update_task',
      },
    },
    {
      id: 'status',
      title: 'New Status',
      type: 'short-input',
      placeholder: 'Enter new status (optional)',
      condition: {
        field: 'operation',
        value: 'update_task',
      },
    },
    {
      id: 'priority',
      title: 'New Priority',
      type: 'dropdown',
      options: [
        { label: 'No Change', id: '' },
        { label: 'Urgent', id: '1' },
        { label: 'High', id: '2' },
        { label: 'Normal', id: '3' },
        { label: 'Low', id: '4' },
      ],
      value: () => '',
      condition: {
        field: 'operation',
        value: 'update_task',
      },
    },
    {
      id: 'archived',
      title: 'Archive Task',
      type: 'dropdown',
      options: [
        { label: 'No Change', id: '' },
        { label: 'Archive', id: 'true' },
        { label: 'Unarchive', id: 'false' },
      ],
      value: () => '',
      condition: {
        field: 'operation',
        value: 'update_task',
      },
    },

    /**
     * Add Comment fields
     */
    {
      id: 'taskId',
      title: 'Task ID',
      type: 'short-input',
      placeholder: 'Enter task ID',
      condition: {
        field: 'operation',
        value: 'add_comment',
      },
      required: true,
    },
    {
      id: 'comment_text',
      title: 'Comment',
      type: 'long-input',
      placeholder: 'Enter comment text (supports markdown)',
      condition: {
        field: 'operation',
        value: 'add_comment',
      },
      required: true,
    },
    {
      id: 'assignee',
      title: 'Assign Comment To',
      type: 'short-input',
      placeholder: 'User ID (optional)',
      condition: {
        field: 'operation',
        value: 'add_comment',
      },
    },
    {
      id: 'notify_all',
      title: 'Notify All',
      type: 'dropdown',
      options: [
        { label: 'No', id: 'false' },
        { label: 'Yes', id: 'true' },
      ],
      value: () => 'true',
      condition: {
        field: 'operation',
        value: 'add_comment',
      },
    },
    ...getTrigger('clickup_webhook').subBlocks,
  ],

  tools: {
    access: [
      'clickup_get_workspace',
      'clickup_list_spaces',
      'clickup_list_lists',
      'clickup_list_tasks',
      'clickup_get_task',
      'clickup_create_task',
      'clickup_update_task',
      'clickup_add_comment',
    ],
    config: {
      tool: (params) => `clickup_${params.operation}`,
      params: (params) => {
        const toolParams: Record<string, unknown> = {
          accessToken: params.credential,
        }

        if (params.operation === 'get_workspace') {
          if (params.teamId) toolParams.teamId = params.teamId
        }

        if (params.operation === 'list_spaces') {
          toolParams.teamId = params.teamId
          if (params.archived) toolParams.archived = params.archived === 'true'
        }

        if (params.operation === 'list_lists') {
          toolParams.spaceId = params.spaceId
          if (params.archived) toolParams.archived = params.archived === 'true'
        }

        if (params.operation === 'list_tasks') {
          toolParams.listId = params.listId
          if (params.archived) toolParams.archived = params.archived === 'true'
          if (params.include_closed) toolParams.include_closed = params.include_closed === 'true'
          if (params.subtasks) toolParams.subtasks = params.subtasks === 'true'
          if (params.order_by) toolParams.order_by = params.order_by
          if (params.reverse) toolParams.reverse = params.reverse === 'true'
        }

        if (params.operation === 'get_task') {
          toolParams.taskId = params.taskId
          if (params.include_subtasks)
            toolParams.include_subtasks = params.include_subtasks === 'true'
        }

        if (params.operation === 'create_task') {
          toolParams.listId = params.listId
          toolParams.name = params.name
          if (params.description) toolParams.description = params.description
          if (params.status) toolParams.status = params.status
          if (params.priority) toolParams.priority = Number(params.priority)
          if (params.assignees) {
            toolParams.assignees = params.assignees
              .split(',')
              .map((id: string) => Number(id.trim()))
              .filter((id: number) => !Number.isNaN(id))
          }
          if (params.tags) {
            toolParams.tags = params.tags.split(',').map((tag: string) => tag.trim())
          }
          if (params.due_date) toolParams.due_date = Number(params.due_date)
          if (params.notify_all) toolParams.notify_all = params.notify_all === 'true'
        }

        if (params.operation === 'update_task') {
          toolParams.taskId = params.taskId
          if (params.name) toolParams.name = params.name
          if (params.description) toolParams.description = params.description
          if (params.status) toolParams.status = params.status
          if (params.priority) toolParams.priority = Number(params.priority)
          if (params.archived !== '') toolParams.archived = params.archived === 'true'
        }

        if (params.operation === 'add_comment') {
          toolParams.taskId = params.taskId
          toolParams.comment_text = params.comment_text
          if (params.assignee) toolParams.assignee = Number(params.assignee)
          if (params.notify_all) toolParams.notify_all = params.notify_all === 'true'
        }

        return toolParams
      },
    },
  },

  inputs: {
    operation: { type: 'string', description: 'ClickUp operation to perform' },
    credential: { type: 'string', description: 'ClickUp OAuth credential' },
    teamId: { type: 'string', description: 'Team/Workspace ID' },
    spaceId: { type: 'string', description: 'Space ID' },
    listId: { type: 'string', description: 'List ID' },
    taskId: { type: 'string', description: 'Task ID' },
    name: { type: 'string', description: 'Task name' },
    description: { type: 'string', description: 'Task description' },
    status: { type: 'string', description: 'Task status' },
    priority: { type: 'string', description: 'Task priority' },
    assignees: { type: 'string', description: 'Assignee user IDs' },
    tags: { type: 'string', description: 'Task tags' },
    comment_text: { type: 'string', description: 'Comment text' },
    archived: { type: 'string', description: 'Include archived items' },
  },

  outputs: {
    success: { type: 'boolean', description: 'Operation success status' },
    ts: { type: 'string', description: 'Response timestamp' },
    teams: { type: 'array', description: 'List of teams/workspaces' },
    spaces: { type: 'array', description: 'List of spaces' },
    lists: { type: 'array', description: 'List of lists' },
    tasks: { type: 'array', description: 'List of tasks' },
    task: { type: 'any', description: 'Task details' },
    comment: { type: 'any', description: 'Comment details' },
  },

  triggers: {
    enabled: true,
    available: [
      'clickup_webhook',
      'clickup_task_created',
      'clickup_task_updated',
      'clickup_task_status_updated',
      'clickup_task_comment_posted',
      'clickup_task_deleted',
      'clickup_task_assigned',
    ],
  },
}
