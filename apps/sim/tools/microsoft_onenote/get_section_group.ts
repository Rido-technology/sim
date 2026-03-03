import { createLogger } from '@sim/logger'
import type { ToolConfig } from '@/tools/types'
import type {
  MicrosoftOneNoteToolParams,
  OneNoteGetSectionGroupResponse,
} from './types'

const logger = createLogger('MicrosoftOneNote')

export const microsoftOnenoteGetSectionGroup: ToolConfig<
  MicrosoftOneNoteToolParams,
  OneNoteGetSectionGroupResponse
> = {
  id: 'microsoft_onenote_get_section_group',
  name: 'Get OneNote Section Group',
  description: 'Get details of a specific OneNote section group',
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
    sectionGroupId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'The ID of the section group to retrieve',
    },
  },
  request: {
    url: (params) => `https://graph.microsoft.com/v1.0/me/onenote/sectionGroups/${params.sectionGroupId}`,
    method: 'GET',
    headers: (params) => ({
      Authorization: `Bearer ${params.accessToken}`,
    }),
  },
  transformResponse: async (response) => {
    const data = await response.json()

    if (!response.ok) {
      logger.error('Failed to get section group', { data })
      throw new Error(data.error?.message || 'Failed to get section group')
    }

    logger.info('Section group retrieved successfully', {
      id: data.id,
      displayName: data.displayName,
    })

    return {
      success: true,
      output: {
        sectionGroup: data,
      },
    }
  },
  outputs: {
    success: { type: 'boolean', description: 'Whether the operation was successful' },
    sectionGroup: { type: 'json', description: 'Section group details' },
  },
}
