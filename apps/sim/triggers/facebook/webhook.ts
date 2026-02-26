import { FacebookIcon } from '@/components/icons'
import type { TriggerConfig } from '@/triggers/types'

export const facebookWebhookTrigger: TriggerConfig = {
  id: 'facebook_webhook',
  name: 'Facebook Webhook',
  provider: 'facebook',
  description:
    'Trigger workflow from Facebook Page events — new comments, posts, likes, and more via the Graph API Webhooks.',
  version: '1.0.0',
  icon: FacebookIcon,

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
      id: 'verificationToken',
      title: 'Verify Token',
      type: 'short-input',
      placeholder: 'Enter any secure string you choose',
      description:
        'Set any secure string here. You will paste the same value in the Facebook App Dashboard when configuring the webhook.',
      password: true,
      required: true,
      mode: 'trigger',
    },
    {
      id: 'appSecret',
      title: 'App Secret (optional)',
      type: 'short-input',
      placeholder: 'Your Facebook App Secret',
      description:
        'The App Secret from your Facebook App. Used to validate the X-Hub-Signature-256 on incoming payloads. Recommended for production.',
      password: true,
      required: false,
      mode: 'trigger',
    },
    {
      id: 'filterPostId',
      title: 'Filter by Post ID (optional)',
      type: 'short-input',
      placeholder: 'e.g. 123456789_987654321',
      description:
        'Only trigger the workflow when a new comment is posted on this specific Post ID. Leave empty to trigger on all new comments.',
      required: false,
      mode: 'trigger',
    },
    {
      id: 'autoReplyMessage',
      title: 'Auto-Reply Message (optional)',
      type: 'long-input',
      placeholder: 'e.g. Thank you for your comment! We will get back to you soon.',
      description:
        'If filled, this message will be automatically posted as a reply to every new comment that matches the filter above. Requires Page Access Token below.',
      required: false,
      mode: 'trigger',
    },
    {
      id: 'pageAccessToken',
      title: 'Page Access Token (for auto-reply)',
      type: 'short-input',
      placeholder: 'EAAxxxxxxxx...',
      description:
        'Page Access Token for the Facebook Page. Required only when Auto-Reply Message is set. Get it from the Graph API Explorer or the "Get My Pages" tool.',
      password: true,
      required: false,
      mode: 'trigger',
    },
    {
      id: 'triggerSave',
      title: '',
      type: 'trigger-save',
      hideFromPreview: true,
      mode: 'trigger',
      triggerId: 'facebook_webhook',
    },
    {
      id: 'triggerInstructions',
      title: 'Setup Instructions',
      type: 'text',
      hideFromPreview: true,
      defaultValue: [
        'Go to your <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer" class="text-muted-foreground underline transition-colors hover:text-muted-foreground/80">Meta for Developers</a> dashboard and select your app.',
        'Navigate to <strong>App Settings → Add Product</strong> and add <strong>Webhooks</strong>.',
        'In the Webhooks configuration, select <strong>Page</strong> as the object.',
        'Click <strong>"Add Callback URL"</strong>, then:<ul class="mt-1 ml-5 list-disc"><li>Paste the <strong>Webhook URL</strong> above into "Callback URL"</li><li>Paste the <strong>Verify Token</strong> into "Verify token"</li><li>Click <strong>"Verify and Save"</strong></li></ul>',
        'Click <strong>"Add Subscriptions"</strong> and check the <code>feed</code> field to receive comment events (and other feed activity).',
        'Install your app on your Facebook Page using the <a href="https://graph.facebook.com/{page-id}/subscribed_apps" target="_blank" rel="noopener noreferrer" class="text-muted-foreground underline transition-colors hover:text-muted-foreground/80">subscribed_apps</a> edge with a Page Access Token and <code>subscribed_fields=feed</code>.',
        '(Optional) Copy your <strong>App Secret</strong> from <strong>App Settings → Basic</strong> and paste it in the field above to enable payload signature validation.',
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
    item: {
      type: 'string',
      description: 'Type of feed event (comment, post, like, reaction, etc.)',
    },
    verb: {
      type: 'string',
      description: 'Action performed (add, edited, remove)',
    },
    commentId: {
      type: 'string',
      description: 'ID of the comment (when item is "comment")',
    },
    postId: {
      type: 'string',
      description: 'ID of the parent post',
    },
    pageId: {
      type: 'string',
      description: 'Facebook Page ID that received the event',
    },
    fromId: {
      type: 'string',
      description: 'User ID of the person who triggered the event',
    },
    fromName: {
      type: 'string',
      description: 'Display name of the person who triggered the event',
    },
    message: {
      type: 'string',
      description: 'Text content of the comment or post',
    },
    createdTime: {
      type: 'string',
      description: 'Unix timestamp when the event was created',
    },
    raw: {
      type: 'object',
      description: 'Full raw webhook payload from Facebook',
      properties: {
        object: { type: 'string', description: 'Always "page"' },
        entry: {
          type: 'array',
          description: 'Array of page entry objects',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Page ID' },
              time: { type: 'number', description: 'Event time' },
              changes: {
                type: 'array',
                description: 'List of changes in this entry',
                items: {
                  type: 'object',
                  properties: {
                    field: { type: 'string', description: 'Field that changed (e.g. feed)' },
                    value: { type: 'object', description: 'Change details' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
}
