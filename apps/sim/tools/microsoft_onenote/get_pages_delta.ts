import { createLogger } from '@sim/logger'
import type { ToolConfig } from '@/tools/types'
import type { MicrosoftOneNoteToolParams, OneNoteDeltaResponse } from './types'

const logger = createLogger('MicrosoftOneNote')

export const microsoftOnenoteGetPagesDelta: ToolConfig<
  MicrosoftOneNoteToolParams,
  OneNoteDeltaResponse
> = {
  id: 'microsoft_onenote_get_pages_delta',
  name: 'Get OneNote Pages Delta',
  description: 'Get changes to pages since last sync (delta synchronization)',
  version: '1.0.0',
  oauth: {
    required: true,
    provider: 'microsoft-onenote',
  },
  params: {
    accessToken: {
      type: 'string',
      required: true,
      visibility: 'hidden',
      description: 'Access token for Microsoft Graph API',
    },
    deltaToken: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description:
        'Delta token from previous sync. Omit to get initial set of pages and delta token',
    },
  },
  request: {
    url: (params) => {
      if (params.deltaToken) {
        return params.deltaToken
      }
      return 'https://graph.microsoft.com/v1.0/me/onenote/pages/delta'
    },
    method: 'GET',
    headers: (params) => ({
      Authorization: `Bearer ${params.accessToken}`,
    }),
  },
  transformResponse: async (response) => {
    const data = await response.json()

    if (!response.ok) {
      logger.error('Failed to get pages delta', { data })
      throw new Error(data.error?.message || 'Failed to get pages delta')
    }

    logger.info('Pages delta retrieved successfully', {
      changesCount: data.value?.length || 0,
      hasDeltaToken: Boolean(data['@odata.deltaLink']),
    })

    return {
      success: true,
      output: {
        changes: data.value || [],
        deltaToken: data['@odata.deltaLink'] || '',
      },
    }
  },
  outputs: {
    success: { type: 'boolean', description: 'Whether the operation was successful' },
    changes: { type: 'array', description: 'Array of page changes (added, modified, deleted)' },
    deltaToken: { type: 'string', description: 'Token to use for next delta sync' },
  },
}
