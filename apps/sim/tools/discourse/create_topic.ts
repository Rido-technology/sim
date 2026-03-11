import type { CreateTopicParams } from '@/tools/discourse/types'
import type { ToolConfig } from '@/tools/types'

export const discourseCreateTopicTool: ToolConfig<CreateTopicParams> = {
  id: 'discourse_create_topic',
  name: 'Discourse Create Topic',
  description: 'Create a new topic in a Discourse forum',
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
      description: 'Title of the topic',
    },
    raw: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Content of the topic',
    },
    categoryId: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'ID of the category to post in',
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
    body: (params) => {
      const body: Record<string, unknown> = {
        title: params.title,
        raw: params.raw,
      }
      if (params.categoryId) {
        body.category = params.categoryId
      }
      return body
    },
  },

  transformResponse: async (response) => {
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.errors?.join(', ') || 'Failed to create topic')
    }

    return {
      success: true,
      output: {
        topicId: data.topic_id,
        postId: data.id,
        title: data.topic_title_headline || data.topic_slug || '',
        url: data.post_url || '',
        username: data.username,
        createdAt: data.created_at,
      },
    }
  },

  outputs: {
    topicId: { type: 'number', description: 'ID of the created topic' },
    postId: { type: 'number', description: 'ID of the first post' },
    title: { type: 'string', description: 'Title of the topic' },
    url: { type: 'string', description: 'URL of the topic' },
    username: { type: 'string', description: 'Author username' },
    createdAt: { type: 'string', description: 'Creation timestamp' },
  },
}
