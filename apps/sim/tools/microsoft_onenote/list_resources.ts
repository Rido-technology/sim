import { createLogger } from '@sim/logger'
import type { ToolConfig } from '@/tools/types'
import type {
  MicrosoftOneNoteToolParams,
  OneNoteListResourcesResponse,
} from './types'

const logger = createLogger('MicrosoftOneNote')

export const microsoftOnenoteListResources: ToolConfig<
  MicrosoftOneNoteToolParams,
  OneNoteListResourcesResponse
> = {
  id: 'microsoft_onenote_list_resources',
  name: 'List OneNote Resources',
  description: 'List all resources (images, files) attached to pages',
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
    pageId: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Optional page ID to list resources from a specific page',
    },
    filter: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'OData filter query',
    },
    top: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'Maximum number of resources to return',
    },
  },
  request: {
    url: (params) => {
      let baseUrl = 'https://graph.microsoft.com/v1.0/me/onenote'
      
      if (params.pageId) {
        baseUrl += `/pages/${params.pageId}/resources`
      } else {
        baseUrl += '/resources'
      }
      
      const url = new URL(baseUrl)
      
      if (params.filter) {
        url.searchParams.append('$filter', params.filter)
      }
      if (params.top) {
        url.searchParams.append('$top', params.top.toString())
      }
      
      return url.toString()
    },
    method: 'GET',
    headers: (params) => ({
      Authorization: `Bearer ${params.accessToken}`,
    }),
  },
  transformResponse: async (response) => {
    const data = await response.json()

    if (!response.ok) {
      logger.error('Failed to list resources', { data })
      throw new Error(data.error?.message || 'Failed to list resources')
    }

    logger.info('Resources listed successfully', {
      count: data.value?.length || 0,
    })

    return {
      success: true,
      output: {
        resources: data.value || [],
      },
    }
  },
  outputs: {
    success: { type: 'boolean', description: 'Whether the operation was successful' },
    resources: { type: 'array', description: 'Array of resource objects' },
  },
}
