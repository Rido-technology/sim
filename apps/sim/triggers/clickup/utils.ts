import type { TriggerOutput } from '@/triggers/types'

/**
 * Shared trigger dropdown options for all ClickUp triggers
 */
export const clickupTriggerOptions = [
  { label: 'Task Created', id: 'clickup_task_created' },
  { label: 'Task Updated', id: 'clickup_task_updated' },
  { label: 'Task Status Updated', id: 'clickup_task_status_updated' },
  { label: 'Comment Posted', id: 'clickup_task_comment_posted' },
  { label: 'Task Deleted', id: 'clickup_task_deleted' },
  { label: 'Task Assigned', id: 'clickup_task_assigned' },
  { label: 'Generic Webhook (All Events)', id: 'clickup_webhook' },
]

/**
 * Generate setup instructions for a specific ClickUp event type
 */
export function clickupSetupInstructions(eventType: string, additionalNotes?: string): string {
  const instructions = [
    '<strong>Note:</strong> You must have admin or owner permissions in your ClickUp workspace to create webhooks. See the <a href="https://clickup.com/api/developer-portal/webhooks/" target="_blank" rel="noopener noreferrer">ClickUp webhook documentation</a> for details.',
    'In ClickUp, navigate to your workspace <strong>Settings</strong>.',
    'Go to <strong>Integrations</strong>, then click on <strong>Webhooks</strong>.',
    'Click <strong>"Add Webhook"</strong> to create a new webhook.',
    'Paste the <strong>Webhook URL</strong> from above into the Endpoint field.',
    `Select the events you want to trigger this workflow. For this trigger, select <strong>${eventType}</strong>.`,
    'Choose which workspace, space, folder, or list to monitor (or select "All" to monitor everything).',
    'Optionally, add a secret to your webhook URL for additional security.',
    'Click <strong>"Create Webhook"</strong> to activate it.',
  ]

  if (additionalNotes) {
    instructions.push(additionalNotes)
  }

  return instructions
    .map((instruction, index) => {
      if (index === 0) {
        return `<div class="mb-3">${instruction}</div>`
      }
      return `<div class="mb-3"><strong>${index}.</strong> ${instruction}</div>`
    })
    .join('')
}

/**
 * Shared user/creator output schema
 */
export const userOutputs = {
  id: {
    type: 'string',
    description: 'User ID',
  },
  username: {
    type: 'string',
    description: 'Username',
  },
  email: {
    type: 'string',
    description: 'User email address',
  },
  color: {
    type: 'string',
    description: 'User color hex code',
  },
  profilePicture: {
    type: 'string',
    description: 'URL to user profile picture',
  },
} as const

/**
 * Shared status output schema
 */
export const statusOutputs = {
  id: {
    type: 'string',
    description: 'Status ID',
  },
  status: {
    type: 'string',
    description: 'Status name',
  },
  color: {
    type: 'string',
    description: 'Status color',
  },
  type: {
    type: 'string',
    description: 'Status type (open, closed, custom)',
  },
  orderindex: {
    type: 'number',
    description: 'Order index of the status',
  },
} as const

/**
 * Shared list output schema
 */
export const listOutputs = {
  id: {
    type: 'string',
    description: 'List ID',
  },
  name: {
    type: 'string',
    description: 'List name',
  },
  folder: {
    id: {
      type: 'string',
      description: 'Folder ID',
    },
    name: {
      type: 'string',
      description: 'Folder name',
    },
  },
  space: {
    id: {
      type: 'string',
      description: 'Space ID',
    },
    name: {
      type: 'string',
      description: 'Space name',
    },
  },
} as const

/**
 * Build output schema for task events
 */
export function buildTaskOutputs(): Record<string, TriggerOutput> {
  return {
    event: {
      type: 'string',
      description:
        'Event type (taskCreated, taskUpdated, taskDeleted, taskStatusUpdated, taskCommentPosted, etc.)',
    },
    webhook_id: {
      type: 'string',
      description: 'Webhook ID that triggered this event',
    },
    task_id: {
      type: 'string',
      description: 'Unique ID of the task',
    },
    task: {
      id: {
        type: 'string',
        description: 'Task ID',
      },
      name: {
        type: 'string',
        description: 'Task name/title',
      },
      task_description: {
        type: 'string',
        description: 'Task description (may include markdown)',
      },
      status: {
        id: {
          type: 'string',
          description: 'Status ID',
        },
        status: {
          type: 'string',
          description: 'Status name',
        },
        color: {
          type: 'string',
          description: 'Status color',
        },
        status_type: {
          type: 'string',
          description: 'Status type (open, closed, custom)',
        },
        orderindex: {
          type: 'number',
          description: 'Order index of the status',
        },
      },
      priority: {
        id: {
          type: 'string',
          description: 'Priority ID (1-4, or null)',
        },
        priority: {
          type: 'string',
          description: 'Priority name (urgent, high, normal, low)',
        },
        color: {
          type: 'string',
          description: 'Priority color',
        },
      },
      assignees: {
        type: 'array',
        description: 'Array of assigned users',
      },
      creator: {
        id: {
          type: 'string',
          description: 'User ID',
        },
        username: {
          type: 'string',
          description: 'Username',
        },
        email: {
          type: 'string',
          description: 'User email address',
        },
        color: {
          type: 'string',
          description: 'User color hex code',
        },
        profilePicture: {
          type: 'string',
          description: 'URL to user profile picture',
        },
      },
      date_created: {
        type: 'string',
        description: 'Task creation timestamp (milliseconds)',
      },
      date_updated: {
        type: 'string',
        description: 'Task last updated timestamp (milliseconds)',
      },
      date_closed: {
        type: 'string',
        description: 'Task closed timestamp (milliseconds, null if open)',
      },
      due_date: {
        type: 'string',
        description: 'Due date timestamp (milliseconds, null if no due date)',
      },
      start_date: {
        type: 'string',
        description: 'Start date timestamp (milliseconds, null if no start date)',
      },
      tags: {
        type: 'array',
        description: 'Array of tag objects',
      },
      list: {
        id: {
          type: 'string',
          description: 'List ID',
        },
        name: {
          type: 'string',
          description: 'List name',
        },
        folder: {
          id: {
            type: 'string',
            description: 'Folder ID',
          },
          name: {
            type: 'string',
            description: 'Folder name',
          },
        },
        space: {
          id: {
            type: 'string',
            description: 'Space ID',
          },
          name: {
            type: 'string',
            description: 'Space name',
          },
        },
      },
      url: {
        type: 'string',
        description: 'Direct URL to the task in ClickUp',
      },
      team_id: {
        type: 'string',
        description: 'Workspace/team ID',
      },
      custom_fields: {
        type: 'array',
        description: 'Array of custom field values',
      },
      dependencies: {
        type: 'array',
        description: 'Array of task dependencies',
      },
      attachments: {
        type: 'number',
        description: 'Number of attachments',
      },
      subtasks: {
        type: 'array',
        description: 'Array of subtask IDs',
      },
      time_estimate: {
        type: 'number',
        description: 'Time estimate in milliseconds',
      },
      time_spent: {
        type: 'number',
        description: 'Time spent in milliseconds',
      },
    },
    history_items: {
      type: 'array',
      description: 'Array of changes made to the task (for taskUpdated events)',
    },
    timestamp: {
      type: 'string',
      description: 'ISO timestamp when the event occurred',
    },
  }
}

/**
 * Build output schema for task comment events
 */
export function buildCommentOutputs(): Record<string, TriggerOutput> {
  return {
    event: {
      type: 'string',
      description: 'Event type (taskCommentPosted)',
    },
    webhook_id: {
      type: 'string',
      description: 'Webhook ID that triggered this event',
    },
    task_id: {
      type: 'string',
      description: 'Task ID where the comment was posted',
    },
    comment: {
      id: {
        type: 'string',
        description: 'Comment ID',
      },
      comment_text: {
        type: 'string',
        description: 'Comment text content',
      },
      date: {
        type: 'string',
        description: 'Comment creation timestamp (milliseconds)',
      },
      user: {
        id: {
          type: 'string',
          description: 'User ID',
        },
        username: {
          type: 'string',
          description: 'Username',
        },
        email: {
          type: 'string',
          description: 'User email address',
        },
        color: {
          type: 'string',
          description: 'User color hex code',
        },
        profilePicture: {
          type: 'string',
          description: 'URL to user profile picture',
        },
      },
      resolved: {
        type: 'boolean',
        description: 'Whether the comment is resolved',
      },
    },
    task_name: {
      type: 'string',
      description: 'Name of the task',
    },
    timestamp: {
      type: 'string',
      description: 'ISO timestamp when the event occurred',
    },
  }
}

/**
 * Build output schema for generic webhook (all events)
 */
export function buildGenericWebhookOutputs(): Record<string, TriggerOutput> {
  return {
    event: {
      type: 'string',
      description:
        'Event type (taskCreated, taskUpdated, taskDeleted, taskStatusUpdated, taskCommentPosted, etc.)',
    },
    webhook_id: {
      type: 'string',
      description: 'Webhook ID that triggered this event',
    },
    task_id: {
      type: 'string',
      description: 'Task ID (if applicable)',
    },
    history_items: {
      type: 'array',
      description: 'Array of changes (for update events)',
    },
    payload: {
      type: 'object',
      description: 'Full webhook payload from ClickUp',
    },
    timestamp: {
      type: 'string',
      description: 'ISO timestamp when the event occurred',
    },
  }
}

/**
 * Build output schema for task status updated events
 */
export function buildStatusUpdateOutputs(): Record<string, TriggerOutput> {
  return {
    event: {
      type: 'string',
      description: 'Event type (taskStatusUpdated)',
    },
    webhook_id: {
      type: 'string',
      description: 'Webhook ID that triggered this event',
    },
    task_id: {
      type: 'string',
      description: 'Task ID',
    },
    task_name: {
      type: 'string',
      description: 'Task name',
    },
    old_status: {
      type: 'string',
      description: 'Previous status name',
    },
    new_status: {
      type: 'string',
      description: 'New status name',
    },
    status: {
      id: {
        type: 'string',
        description: 'Status ID',
      },
      status: {
        type: 'string',
        description: 'Status name',
      },
      color: {
        type: 'string',
        description: 'Status color',
      },
      status_type: {
        type: 'string',
        description: 'Status type (open, closed, custom)',
      },
      orderindex: {
        type: 'number',
        description: 'Order index of the status',
      },
    },
    updated_by: {
      id: {
        type: 'string',
        description: 'User ID',
      },
      username: {
        type: 'string',
        description: 'Username',
      },
      email: {
        type: 'string',
        description: 'User email address',
      },
      color: {
        type: 'string',
        description: 'User color hex code',
      },
      profilePicture: {
        type: 'string',
        description: 'URL to user profile picture',
      },
    },
    timestamp: {
      type: 'string',
      description: 'ISO timestamp when the status was updated',
    },
  }
}

/**
 * Validate ClickUp webhook secret (if provided)
 * Note: ClickUp doesn't provide HMAC signatures, so we use a simple secret comparison
 */
export function validateClickUpWebhook(
  secret: string | undefined,
  requestSecret: string | undefined
): boolean {
  // If no secret is configured, allow all webhooks
  if (!secret) {
    return true
  }

  // If secret is configured but not provided in request, reject
  if (!requestSecret) {
    return false
  }

  // Simple comparison
  return secret === requestSecret
}

/**
 * Parse ClickUp webhook payload and normalize it
 */
export function parseClickUpEvent(payload: any): {
  event: string
  task_id?: string
  webhook_id?: string
  history_items?: any[]
  data: any
} {
  return {
    event: payload.event || 'unknown',
    task_id: payload.task_id,
    webhook_id: payload.webhook_id,
    history_items: payload.history_items || [],
    data: payload,
  }
}

/**
 * Extract changes from history_items for taskUpdated events
 */
export function extractChanges(historyItems: any[]): Array<{
  field: string
  before: any
  after: any
}> {
  if (!Array.isArray(historyItems)) {
    return []
  }

  return historyItems.map((item) => ({
    field: item.field || 'unknown',
    before: item.before,
    after: item.after,
  }))
}
