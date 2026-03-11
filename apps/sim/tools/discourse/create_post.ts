import type { CreatePostParams } from '@/tools/discourse/types'
import type { ToolConfig } from '@/tools/types'

export const discourseCreatePostTool: ToolConfig<CreatePostParams> = {
  id: 'discourse_create_post',
  name: 'Discourse Create Post',
  description: 'Create a reply post in an existing Discourse topic',
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
    topicId: {
      type: 'number',
      required: true,
      visibility: 'user-or-llm',
      description: 'ID of the topic to post in',
    },
    raw: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Content of the post',
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
      raw: params.raw,
      topic_id: params.topicId,
    }),
  },

  transformResponse: async (response) => {
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.errors?.join(', ') || 'Failed to create post')
    }

    return {
      success: true,
      output: {
        id: data.id,
        topicId: data.topic_id,
        postNumber: data.post_number,
        raw: data.raw,
        cooked: data.cooked,
        username: data.username,
        createdAt: data.created_at,
        url: data.post_url || '',
      },
    }
  },

  outputs: {
    id: { type: 'number', description: 'Post ID' },
    topicId: { type: 'number', description: 'Topic ID' },
    postNumber: { type: 'number', description: 'Post number in the topic' },
    raw: { type: 'string', description: 'Raw content of the post' },
    cooked: { type: 'string', description: 'Rendered HTML content' },
    username: { type: 'string', description: 'Author username' },
    createdAt: { type: 'string', description: 'Creation timestamp' },
    url: { type: 'string', description: 'URL of the post' },
  },
}
