import { ClickUpIcon } from '@/components/icons'
import type { TriggerConfig } from '@/triggers/types'
import {
  buildCommentOutputs,
  clickupSetupInstructions,
  clickupTriggerOptions,
} from './utils'

export const clickupTaskCommentPostedTrigger: TriggerConfig = {
  id: 'clickup_task_comment_posted',
  name: 'ClickUp Comment Posted',
  provider: 'clickup',
  description: 'Trigger workflow when a comment is posted on a task in ClickUp',
  version: '1.0.0',
  icon: ClickUpIcon,

  subBlocks: [
    {
      id: 'selectedTriggerId',
      title: 'Trigger Type',
      type: 'dropdown',
      mode: 'trigger',
      options: clickupTriggerOptions,
      value: () => 'clickup_task_comment_posted',
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
        value: 'clickup_task_comment_posted',
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
        value: 'clickup_task_comment_posted',
      },
    },
    {
      id: 'filterByList',
      title: 'Filter by List ID (Optional)',
      type: 'short-input',
      placeholder: 'Leave empty to accept all lists',
      description: 'Only trigger for comments on tasks in this specific list.',
      required: false,
      mode: 'trigger',
      condition: {
        field: 'selectedTriggerId',
        value: 'clickup_task_comment_posted',
      },
    },
    {
      id: 'excludeResolved',
      title: 'Exclude Resolved Comments',
      type: 'switch',
      defaultValue: false,
      description: 'Exclude comments that are marked as resolved from triggering the workflow.',
      required: false,
      mode: 'trigger',
      condition: {
        field: 'selectedTriggerId',
        value: 'clickup_task_comment_posted',
      },
    },
    {
      id: 'enrichTaskData',
      title: 'Enrich Task Data',
      type: 'switch',
      defaultValue: false,
      description:
        'Fetch full task details using ClickUp API (requires OAuth credential). When disabled, only comment data from the webhook is used.',
      required: false,
      mode: 'trigger',
      condition: {
        field: 'selectedTriggerId',
        value: 'clickup_task_comment_posted',
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
        value: 'clickup_task_comment_posted',
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
      triggerId: 'clickup_task_comment_posted',
      condition: {
        field: 'selectedTriggerId',
        value: 'clickup_task_comment_posted',
      },
    },
    {
      id: 'triggerInstructions',
      title: 'Setup Instructions',
      type: 'text',
      hideFromPreview: true,
      defaultValue: clickupSetupInstructions(
        'taskCommentPosted',
        '<strong>Tip:</strong> Use this trigger to create automated responses or notifications when team members comment on tasks.'
      ),
      mode: 'trigger',
      condition: {
        field: 'selectedTriggerId',
        value: 'clickup_task_comment_posted',
      },
    },
  ],

  outputs: buildCommentOutputs(),

  webhook: {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  },
}
