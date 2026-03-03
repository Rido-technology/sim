import { ClickUpIcon } from '@/components/icons'
import type { TriggerConfig } from '@/triggers/types'
import {
  buildTaskOutputs,
  clickupSetupInstructions,
  clickupTriggerOptions,
} from './utils'

export const clickupTaskCreatedTrigger: TriggerConfig = {
  id: 'clickup_task_created',
  name: 'ClickUp Task Created',
  provider: 'clickup',
  description: 'Trigger workflow when a new task is created in ClickUp',
  version: '1.0.0',
  icon: ClickUpIcon,

  subBlocks: [
    {
      id: 'selectedTriggerId',
      title: 'Trigger Type',
      type: 'dropdown',
      mode: 'trigger',
      options: clickupTriggerOptions,
      value: () => 'clickup_task_created',
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
        value: 'clickup_task_created',
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
        value: 'clickup_task_created',
      },
    },
    {
      id: 'filterByList',
      title: 'Filter by List ID (Optional)',
      type: 'short-input',
      placeholder: 'Leave empty to accept all lists',
      description: 'Only trigger for tasks created in this specific list.',
      required: false,
      mode: 'trigger',
      condition: {
        field: 'selectedTriggerId',
        value: 'clickup_task_created',
      },
    },
    {
      id: 'filterBySpace',
      title: 'Filter by Space ID (Optional)',
      type: 'short-input',
      placeholder: 'Leave empty to accept all spaces',
      description: 'Only trigger for tasks created in this specific space.',
      required: false,
      mode: 'trigger',
      condition: {
        field: 'selectedTriggerId',
        value: 'clickup_task_created',
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
        value: 'clickup_task_created',
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
        value: 'clickup_task_created',
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
      triggerId: 'clickup_task_created',
      condition: {
        field: 'selectedTriggerId',
        value: 'clickup_task_created',
      },
    },
    {
      id: 'triggerInstructions',
      title: 'Setup Instructions',
      type: 'text',
      hideFromPreview: true,
      defaultValue: clickupSetupInstructions('taskCreated'),
      mode: 'trigger',
      condition: {
        field: 'selectedTriggerId',
        value: 'clickup_task_created',
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
