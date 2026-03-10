import { ClockifyIcon } from '@/components/icons'
import type { TriggerConfig } from '@/triggers/types'
import { clockifyWebhookOutputs } from './types'

export const clockifyWebhookTrigger: TriggerConfig = {
  id: 'clockify_webhook',
  name: 'Clockify Webhook',
  provider: 'clockify',
  description: 'Triggers when Clockify events occur (time entries, projects, tasks, users)',
  version: '1.0.0',
  icon: ClockifyIcon,

  subBlocks: [
    {
      id: 'webhookUrlDisplay',
      title: '📋 Webhook URL (Copy This)',
      type: 'short-input',
      readOnly: true,
      showCopyButton: true,
      useWebhookUrl: true,
      placeholder: 'Save trigger to generate webhook URL...',
      description: 'Copy this URL and paste it in your Clockify webhook settings',
      mode: 'trigger',
    },
    {
      id: 'webhookSecret',
      title: 'Webhook Secret Token',
      type: 'short-input',
      placeholder: 'Enter webhook secret token from Clockify',
      description: 'Secret token sent in clockify-signature header for authentication',
      password: true,
      required: true,
      mode: 'trigger',
    },
    {
      id: 'workspaceId', 
      title: 'Workspace ID',
      type: 'short-input',
      placeholder: 'Enter Clockify workspace ID',
      required: false,
      mode: 'trigger',
    },
    {
      id: 'eventTypes',
      title: 'Events to Listen For',
      type: 'dropdown',
      multiSelect: true,
      options: [
        // Time Entry Events
        { label: 'Time Entry Created', id: 'TIME_ENTRY_CREATED' },
        { label: 'Time Entry Updated', id: 'TIME_ENTRY_UPDATED' },
        { label: 'Time Entry Deleted', id: 'TIME_ENTRY_DELETED' },
        
        // Project Events
        { label: 'Project Created', id: 'PROJECT_CREATED' },
        { label: 'Project Updated', id: 'PROJECT_UPDATED' },
        { label: 'Project Deleted', id: 'PROJECT_DELETED' },
        
        // Task Events  
        { label: 'Task Created', id: 'TASK_CREATED' },
        { label: 'Task Updated', id: 'TASK_UPDATED' },
        { label: 'Task Deleted', id: 'TASK_DELETED' },
        
        // User Events
        { label: 'User Joined Workspace', id: 'USER_JOINED_WORKSPACE' },
        { label: 'User Left Workspace', id: 'USER_LEFT_WORKSPACE' },
      ],
      value: ['TIME_ENTRY_CREATED', 'TIME_ENTRY_UPDATED'],
      required: true,
      mode: 'trigger',
    },
    {
      id: 'filterByProject',
      title: 'Filter by Project',
      type: 'short-input', 
      placeholder: 'Project ID to filter events (optional)',
      mode: 'trigger',
    },
    {
      id: 'filterByUser',
      title: 'Filter by User',
      type: 'short-input',
      placeholder: 'User ID to filter events (optional)', 
      mode: 'trigger',
    },
    {
      id: 'triggerSave',
      title: '',
      type: 'trigger-save',
      hideFromPreview: true,
      mode: 'trigger',
      triggerId: 'clockify_webhook',
    },
    {
      id: 'triggerInstructions',
      title: 'Setup Instructions',
      hideFromPreview: true,
      type: 'text',
      defaultValue: [
        '<strong>Step 1:</strong> Click the copy button next to the Webhook URL above 📋',
        '<strong>Step 2:</strong> Go to your Clockify workspace → Settings → Webhooks',
        '<strong>Step 3:</strong> Click "Add Webhook" and paste the URL you copied',
        '<strong>Step 4:</strong> Create a secret token in Clockify (any random string like <code>abc123xyz</code>)',
        '<strong>Step 5:</strong> Enter the same secret token in the "Webhook Secret Token" field above',
        '<strong>Step 6:</strong> Select which events to listen for',
        '<strong>Step 7:</strong> Click "Save Trigger" to activate the webhook',
        '',
        '<em>Note: The webhook URL must start with <code>/api/webhooks/trigger/</code></em>',
      ].join('\n'),
      mode: 'trigger',
    },
  ],

  outputs: clockifyWebhookOutputs,

  webhook: {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  },
}