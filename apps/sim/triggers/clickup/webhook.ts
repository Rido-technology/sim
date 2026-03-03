import { ClickUpIcon } from '@/components/icons'
import type { TriggerConfig } from '@/triggers/types'
import { buildGenericWebhookOutputs, clickupSetupInstructions } from './utils'

export const clickupWebhookTrigger: TriggerConfig = {
  id: 'clickup_webhook',
  name: 'ClickUp Webhook',
  provider: 'clickup',
  description: 'Trigger workflow from any ClickUp event (tasks, comments, lists, etc.)',
  version: '1.0.0',
  icon: ClickUpIcon,

  subBlocks: [
    {
      id: 'webhookUrlDisplay',
      title: 'Webhook URL',
      type: 'short-input',
      readOnly: true,
      showCopyButton: true,
      useWebhookUrl: true,
      placeholder: 'Webhook URL will be generated',
      mode: 'trigger',
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
    },
    {
      id: 'filterByEvent',
      title: 'Filter by Event Type (Optional)',
      type: 'short-input',
      placeholder: 'Leave empty to accept all events',
      description:
        'Only trigger for specific event types (e.g., taskCreated, taskUpdated). Leave empty for all events.',
      required: false,
      mode: 'trigger',
    },
    {
      id: 'filterByTeamId',
      title: 'Filter by Team/Workspace ID (Optional)',
      type: 'short-input',
      placeholder: 'Leave empty to accept all workspaces',
      description: 'Only trigger for events from a specific workspace/team.',
      required: false,
      mode: 'trigger',
    },
    {
      id: 'triggerSave',
      title: '',
      type: 'trigger-save',
      hideFromPreview: true,
      mode: 'trigger',
      triggerId: 'clickup_webhook',
    },
    {
      id: 'triggerInstructions',
      title: 'Setup Instructions',
      type: 'text',
      hideFromPreview: true,
      defaultValue: clickupSetupInstructions(
        'All Events (or select specific events you want to monitor)',
        '<strong>Note:</strong> This generic webhook will receive ALL events you configure in ClickUp. Use the filter options above to narrow down which events trigger your workflow.'
      ),
      mode: 'trigger',
    },
  ],

  outputs: buildGenericWebhookOutputs(),

  webhook: {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  },
}
