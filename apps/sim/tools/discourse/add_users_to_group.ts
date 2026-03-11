import type { AddUsersToGroupParams } from '@/tools/discourse/types'
import type { ToolConfig } from '@/tools/types'

export const discourseAddUsersToGroupTool: ToolConfig<AddUsersToGroupParams> = {
  id: 'discourse_add_users_to_group',
  name: 'Discourse Add Users to Group',
  description: 'Add one or more users to a Discourse group',
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
    groupId: {
      type: 'number',
      required: true,
      visibility: 'user-or-llm',
      description: 'ID of the group',
    },
    usernames: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Comma-separated list of usernames to add to the group',
    },
  },

  request: {
    url: (params) =>
      `${params.siteUrl.replace(/\/$/, '')}/groups/${params.groupId}/members.json`,
    method: 'PUT',
    headers: (params) => ({
      'Api-Key': params.apiKey,
      'Api-Username': params.apiUsername,
      'Content-Type': 'application/json',
    }),
    body: (params) => ({
      usernames: params.usernames,
    }),
  },

  transformResponse: async (response) => {
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.errors?.join(', ') || 'Failed to add users to group')
    }

    const usernames = Array.isArray(data.usernames) ? data.usernames : []

    return {
      success: true,
      output: {
        success: true,
        usernames,
      },
    }
  },

  outputs: {
    success: { type: 'boolean', description: 'Whether the operation succeeded' },
    usernames: { type: 'array', description: 'List of successfully added usernames' },
  },
}
