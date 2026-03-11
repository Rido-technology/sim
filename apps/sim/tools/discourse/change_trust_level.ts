import type { ChangeTrustLevelParams } from '@/tools/discourse/types'
import type { ToolConfig } from '@/tools/types'

export const discourseChangeTrustLevelTool: ToolConfig<ChangeTrustLevelParams> = {
  id: 'discourse_change_trust_level',
  name: 'Discourse Change User Trust Level',
  description: "Change a Discourse user's trust level (admin only)",
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
    userId: {
      type: 'number',
      required: true,
      visibility: 'user-or-llm',
      description: 'ID of the user',
    },
    level: {
      type: 'number',
      required: true,
      visibility: 'user-or-llm',
      description: 'New trust level (0=new user, 1=basic, 2=member, 3=regular, 4=leader)',
    },
  },

  request: {
    url: (params) =>
      `${params.siteUrl.replace(/\/$/, '')}/admin/users/${params.userId}/trust_level.json`,
    method: 'PUT',
    headers: (params) => ({
      'Api-Key': params.apiKey,
      'Api-Username': params.apiUsername,
      'Content-Type': 'application/json',
    }),
    body: (params) => ({
      level: params.level,
    }),
  },

  transformResponse: async (response) => {
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.errors?.join(', ') || 'Failed to change trust level')
    }

    return {
      success: true,
      output: {
        userId: data.id,
        trustLevel: data.trust_level,
        success: true,
      },
    }
  },

  outputs: {
    userId: { type: 'number', description: 'User ID' },
    trustLevel: { type: 'number', description: 'Updated trust level' },
    success: { type: 'boolean', description: 'Whether the operation succeeded' },
  },
}
