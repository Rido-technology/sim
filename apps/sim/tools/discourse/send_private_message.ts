import type { SendPrivateMessageParams } from '@/tools/discourse/types'
import type { ToolConfig } from '@/tools/types'

export const discourseSendPrivateMessageTool: ToolConfig<SendPrivateMessageParams> = {
  id: 'discourse_send_private_message',
  name: 'Discourse Send Private Message',
  description: 'Send a private message to one or more Discourse users',
  version: '1.0.0',

  params: {
    apiKey: {
      type: 'string',
      required: true,
      visibility: 'user-only',
      description: 'Discourse API key',
    },
    apiUsername: {
      type: 'string',
      required: true,
      visibility: 'user-only',
      description: 'Discourse API username',
    },
    siteUrl: {
      type: 'string',
      required: true,
      visibility: 'user-only',
      description: 'Discourse site URL (e.g. https://discourse.example.com)',
    },
    title: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Subject/title of the private message',
    },
    raw: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Content of the private message',
    },
    targetRecipients: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Comma-separated list of recipient usernames',
    },
  },

  request: {
    url: (params) => `${params.siteUrl.replace(/\/$/, '')}/posts.json`,
    method: 'POST',
    headers: (params) => ({
      'Api-Key': params.apiKey,
      'Api-Username': params.apiUsername,
      'Content-Type': 'application/json',
    }),
    body: (params) => ({
      title: params.title,
      raw: params.raw,
      target_recipients: params.targetRecipients,
      archetype: 'private_message',
    }),
  },

  transformResponse: async (response) => {
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.errors?.join(', ') || 'Failed to send private message')
    }

    return {
      success: true,
      output: {
        id: data.id,
        topicId: data.topic_id,
        title: data.topic_slug || '',
        username: data.username,
        createdAt: data.created_at,
        url: data.post_url || '',
      },
    }
  },

  outputs: {
    id: { type: 'number', description: 'Post ID of the private message' },
    topicId: { type: 'number', description: 'Topic ID of the private message thread' },
    title: { type: 'string', description: 'Slug of the private message topic' },
    username: { type: 'string', description: 'Sender username' },
    createdAt: { type: 'string', description: 'Creation timestamp' },
    url: { type: 'string', description: 'URL of the private message' },
  },
}
