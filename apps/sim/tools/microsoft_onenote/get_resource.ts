import { createLogger } from '@sim/logger'
import type { ToolConfig } from '@/tools/types'
import type {
  MicrosoftOneNoteToolParams,
  OneNoteGetResourceResponse,
} from './types'

const logger = createLogger('MicrosoftOneNote')

export const microsoftOnenoteGetResource: ToolConfig<
  MicrosoftOneNoteToolParams,
  OneNoteGetResourceResponse
> = {
  id: 'microsoft_onenote_get_resource',
  name: 'Get OneNote Resource',
  description: 'Get a specific resource (image, file) by ID',
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
    resourceId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'The ID of the resource to retrieve',
    },
  },
  request: {
    url: (params) => `https://graph.microsoft.com/v1.0/me/onenote/resources/${params.resourceId}`,
    method: 'GET',
    headers: (params) => ({
      Authorization: `Bearer ${params.accessToken}`,
    }),
  },
  transformResponse: async (response) => {
    const data = await response.json()

    if (!response.ok) {
      logger.error('Failed to get resource', { data })
      throw new Error(data.error?.message || 'Failed to get resource')
    }

    logger.info('Resource retrieved successfully', {
      id: data.id,
    })

    return {
      success: true,
      output: {
        resource: data,
      },
    }
  },
  outputs: {
    success: { type: 'boolean', description: 'Whether the operation was successful' },
    resource: { type: 'json', description: 'Resource details' },
  },
}
