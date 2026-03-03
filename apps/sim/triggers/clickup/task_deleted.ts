import { ClickUpIcon } from '@/components/icons'
import type { TriggerConfig } from '@/triggers/types'
import { clickupSetupInstructions, clickupTriggerOptions } from './utils'

export const clickupTaskDeletedTrigger: TriggerConfig = {
  id: 'clickup_task_deleted',
  name: 'ClickUp Task Deleted',
  provider: 'clickup',
  description: 'Trigger workflow when a task is deleted in ClickUp',
  version: '1.0.0',
  icon: ClickUpIcon,

  subBlocks: [
    {
      id: 'selectedTriggerId',
      title: 'Trigger Type',
      type: 'dropdown',
      mode: 'trigger',
      options: clickupTriggerOptions,
      value: () => 'clickup_task_deleted',
      required: true,
    },
    {
      id: 'webhookUrlDisplay',
      title: 'Webhook URL',
      type: 'short-input',
      readOnly: true,
      showCopyButton: true,
      useWebhookUrl: true,
      placeholder: 'Webhook URL will be generated',
      mode: 'trigger',
      condition: {
        field: 'selectedTriggerId',
        value: 'clickup_task_deleted',
      },
    },
    {
      id: 'webhookSecret',
      title: 'Webhook Secret (Optional)',
      type: 'short-input',
      placeholder: 'Enter a strong secret to validate webhooks',
      description:
        'Optional secret to validate webhook authenticity. Add this as a query parameter to your webhook URL (e.g., ?secret=yourSecret).',
      password: true,
      required: false,
      mode: 'trigger',
      condition: {
        field: 'selectedTriggerId',
        value: 'clickup_task_deleted',
      },
    },
    {
      id: 'filterByList',
      title: 'Filter by List ID (Optional)',
      type: 'short-input',
      placeholder: 'Leave empty to accept all lists',
      description: 'Only trigger for tasks deleted from this specific list.',
      required: false,
      mode: 'trigger',
      condition: {
        field: 'selectedTriggerId',
        value: 'clickup_task_deleted',
      },
    },
    {
      id: 'triggerSave',
      title: '',
      type: 'trigger-save',
      hideFromPreview: true,
      mode: 'trigger',
      triggerId: 'clickup_task_deleted',
      condition: {
        field: 'selectedTriggerId',
        value: 'clickup_task_deleted',
      },
    },
    {
      id: 'triggerInstructions',
      title: 'Setup Instructions',
      type: 'text',
      hideFromPreview: true,
      defaultValue: clickupSetupInstructions(
        'taskDeleted',
        '<strong>Note:</strong> Deleted task data is limited. The webhook payload typically only includes the task ID and deletion timestamp.'
      ),
      mode: 'trigger',
      condition: {
        field: 'selectedTriggerId',
        value: 'clickup_task_deleted',
      },
    },
  ],

  outputs: {
    event: {
      type: 'string',
      description: 'Event type (taskDeleted)',
    },
    webhook_id: {
      type: 'string',
      description: 'Webhook ID that triggered this event',
    },
    task_id: {
      type: 'string',
      description: 'ID of the deleted task',
    },
    timestamp: {
      type: 'string',
      description: 'ISO timestamp when the task was deleted',
    },
  },

  webhook: {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  },
}
