import { ClickUpIcon } from '@/components/icons'
import type { TriggerConfig } from '@/triggers/types'
import {
  buildTaskOutputs,
  clickupSetupInstructions,
  clickupTriggerOptions,
} from './utils'

export const clickupTaskUpdatedTrigger: TriggerConfig = {
  id: 'clickup_task_updated',
  name: 'ClickUp Task Updated',
  provider: 'clickup',
  description: 'Trigger workflow when a task is updated in ClickUp',
  version: '1.0.0',
  icon: ClickUpIcon,

  subBlocks: [
    {
      id: 'selectedTriggerId',
      title: 'Trigger Type',
      type: 'dropdown',
      mode: 'trigger',
      options: clickupTriggerOptions,
      value: () => 'clickup_task_updated',
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
        value: 'clickup_task_updated',
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
        value: 'clickup_task_updated',
      },
    },
    {
      id: 'filterByList',
      title: 'Filter by List ID (Optional)',
      type: 'short-input',
      placeholder: 'Leave empty to accept all lists',
      description: 'Only trigger for tasks updated in this specific list.',
      required: false,
      mode: 'trigger',
      condition: {
        field: 'selectedTriggerId',
        value: 'clickup_task_updated',
      },
    },
    {
      id: 'filterByField',
      title: 'Filter by Changed Field (Optional)',
      type: 'short-input',
      placeholder: 'e.g., status, priority, assignee',
      description:
        'Only trigger when a specific field is updated. Leave empty to trigger on any update.',
      required: false,
      mode: 'trigger',
      condition: {
        field: 'selectedTriggerId',
        value: 'clickup_task_updated',
      },
    },
    {
      id: 'enrichTaskData',
      title: 'Enrich Task Data',
      type: 'switch',
      defaultValue: false,
      description:
        'Fetch full task details using ClickUp API (requires OAuth credential). When disabled, only webhook payload data is used.',
      required: false,
      mode: 'trigger',
      condition: {
        field: 'selectedTriggerId',
        value: 'clickup_task_updated',
      },
    },
    {
      id: 'credential',
      title: 'ClickUp Account (for enrichment)',
      type: 'oauth-input',
      serviceId: 'clickup',
      requiredScopes: [],
      placeholder: 'Select ClickUp account',
      required: false,
      mode: 'trigger',
      condition: {
        field: 'selectedTriggerId',
        value: 'clickup_task_updated',
        and: {
          field: 'enrichTaskData',
          value: true,
        },
      },
    },
    {
      id: 'triggerSave',
      title: '',
      type: 'trigger-save',
      hideFromPreview: true,
      mode: 'trigger',
      triggerId: 'clickup_task_updated',
      condition: {
        field: 'selectedTriggerId',
        value: 'clickup_task_updated',
      },
    },
    {
      id: 'triggerInstructions',
      title: 'Setup Instructions',
      type: 'text',
      hideFromPreview: true,
      defaultValue: clickupSetupInstructions(
        'taskUpdated',
        '<strong>Note:</strong> Task update events can be very frequent. Consider using the field filter to only trigger on specific changes (e.g., status, priority).'
      ),
      mode: 'trigger',
      condition: {
        field: 'selectedTriggerId',
        value: 'clickup_task_updated',
      },
    },
  ],

  outputs: buildTaskOutputs(),

  webhook: {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  },
}
