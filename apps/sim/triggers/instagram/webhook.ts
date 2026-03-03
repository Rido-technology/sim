import { InstagramIcon } from '@/components/icons'
import type { TriggerConfig } from '@/triggers/types'

export const instagramWebhookTrigger: TriggerConfig = {
  id: 'instagram_webhook',
  name: 'Instagram Webhook',
  provider: 'instagram',
  description: 'Trigger workflow from Instagram messaging and other events via Meta webhooks',
  version: '1.0.0',
  icon: InstagramIcon,

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
      id: 'subscribedEvents',
      title: 'Events to listen to',
      type: 'dropdown',
      multiSelect: true,
      description:
        'Select which webhook events trigger this workflow. Leave empty to listen to all events.',
      mode: 'trigger',
      options: [
        { label: 'Comment on post', id: 'comments' },
        { label: 'Live comments', id: 'live_comments' },
        { label: 'Direct messages', id: 'messages' },
        { label: 'Mentions', id: 'mentions' },
        { label: 'Message reactions', id: 'message_reactions' },
        { label: 'Message postbacks', id: 'messaging_postbacks' },
        { label: 'Message handover', id: 'messaging_handover' },
        { label: 'Message edit', id: 'message_edit' },
        { label: 'Messaging referral', id: 'messaging_referral' },
        { label: 'Messaging seen', id: 'messaging_seen' },
        { label: 'Standby', id: 'standby' },
        { label: 'Story insights', id: 'story_insights' },
      ],
    },
    {
      id: 'verificationToken',
      title: 'Verification Token',
      type: 'short-input',
      placeholder: 'Generate or enter a verification token',
      description:
        "Enter a secure token. Use the same value in your Meta App's Instagram webhook settings.",
      password: true,
      required: true,
      mode: 'trigger',
    },
    {
      id: 'triggerSave',
      title: '',
      type: 'trigger-save',
      hideFromPreview: true,
      mode: 'trigger',
      triggerId: 'instagram_webhook',
    },
    {
      id: 'triggerInstructions',
      title: 'Setup Instructions',
      hideFromPreview: true,
      type: 'text',
      defaultValue: [
        'Go to <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer" class="text-muted-foreground underline transition-colors hover:text-muted-foreground/80">Meta for Developers</a> and open your app.',
        'Add the <strong>Instagram</strong> product to your app if needed (Instagram Graph API / Instagram Messaging).',
        'Open Instagram > Configuration (or Messenger > Settings for Instagram messaging).',
        'In Webhooks, click Edit and set <strong>Callback URL</strong> to the Webhook URL above.',
        'Set <strong>Verify token</strong> to the Verification Token above, then click Verify and Save.',
        'Subscribe to the webhook fields you need (e.g. <strong>comments</strong> for comment on post, messages, messaging_postbacks). The events selected above filter which of those subscriptions trigger this workflow; leave empty to trigger on all.',
      ]
        .map(
          (instruction, index) =>
            `<div class="mb-3"><strong>${index + 1}.</strong> ${instruction}</div>`
        )
        .join(''),
      mode: 'trigger',
    },
  ],

  outputs: {
    messageId: { type: 'string', description: 'Message or event identifier' },
    from: { type: 'string', description: 'Sender or user ID' },
    text: { type: 'string', description: 'Message text when available' },
    timestamp: { type: 'string', description: 'Event timestamp' },
    raw: {
      type: 'object',
      description: 'Complete raw webhook payload from Meta/Instagram',
      properties: {},
    },
    eventType: { type: 'string', description: 'Event type' },
    commentId: { type: 'string', description: 'Comment ID' },
    mediaId: { type: 'string', description: 'Media ID' },
    parentId: { type: 'string', description: 'Parent ID' },
    username: { type: 'string', description: 'Username' },
  },

  webhook: {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  },
}
