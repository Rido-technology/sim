import { createLogger } from '@sim/logger'
import type { ToolConfig } from '@/tools/types'
import type {
  MicrosoftOneNoteToolParams,
  OneNoteListSectionGroupsResponse,
} from './types'

const logger = createLogger('MicrosoftOneNote')

export const microsoftOnenoteListSectionGroups: ToolConfig<
  MicrosoftOneNoteToolParams,
  OneNoteListSectionGroupsResponse
> = {
  id: 'microsoft_onenote_list_section_groups',
  name: 'List OneNote Section Groups',
  description: 'List all section groups or section groups within a specific notebook',
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
    notebookId: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Optional notebook ID to list section groups from',
    },
    sectionGroupId: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Optional parent section group ID to list child section groups from',
    },
    filter: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'OData filter query',
    },
    orderby: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'OData orderby query (e.g., "displayName asc")',
    },
    top: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'Maximum number of section groups to return',
    },
  },
  request: {
    url: (params) => {
      let baseUrl = 'https://graph.microsoft.com/v1.0/me/onenote'
      
      if (params.notebookId && params.sectionGroupId) {
        baseUrl += `/sectionGroups/${params.sectionGroupId}/sectionGroups`
      } else if (params.notebookId) {
        baseUrl += `/notebooks/${params.notebookId}/sectionGroups`
      } else if (params.sectionGroupId) {
        baseUrl += `/sectionGroups/${params.sectionGroupId}/sectionGroups`
      } else {
        baseUrl += '/sectionGroups'
      }
      
      const url = new URL(baseUrl)
      
      if (params.filter) {
        url.searchParams.append('$filter', params.filter)
      }
      if (params.orderby) {
        url.searchParams.append('$orderby', params.orderby)
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
      logger.error('Failed to list section groups', { data })
      throw new Error(data.error?.message || 'Failed to list section groups')
    }

    logger.info('Section groups listed successfully', {
      count: data.value?.length || 0,
    })

    return {
      success: true,
      output: {
        sectionGroups: data.value || [],
      },
    }
  },
  outputs: {
    success: { type: 'boolean', description: 'Whether the operation was successful' },
    sectionGroups: { type: 'array', description: 'Array of section group objects' },
  },
}
