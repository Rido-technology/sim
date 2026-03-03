import { createLogger } from '@sim/logger'
import type { ToolConfig } from '@/tools/types'
import type {
  MicrosoftOneNoteToolParams,
  OneNoteCreateSectionGroupResponse,
} from './types'

const logger = createLogger('MicrosoftOneNote')

export const microsoftOnenoteCreateSectionGroup: ToolConfig<
  MicrosoftOneNoteToolParams,
  OneNoteCreateSectionGroupResponse
> = {
  id: 'microsoft_onenote_create_section_group',
  name: 'Create OneNote Section Group',
  description: 'Create a new section group in a notebook or within another section group',
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
      required: true,
      visibility: 'user-or-llm',
      description: 'The ID of the notebook to create the section group in',
    },
    sectionGroupId: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Optional parent section group ID to create nested section group',
    },
    displayName: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Display name for the new section group',
    },
  },
  request: {
    url: (params) => {
      if (params.sectionGroupId) {
        return `https://graph.microsoft.com/v1.0/me/onenote/sectionGroups/${params.sectionGroupId}/sectionGroups`
      }
      return `https://graph.microsoft.com/v1.0/me/onenote/notebooks/${params.notebookId}/sectionGroups`
    },
    method: 'POST',
    headers: (params) => ({
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    }),
    body: (params) => JSON.stringify({ displayName: params.displayName }),
  },
  transformResponse: async (response) => {
    const data = await response.json()

    if (!response.ok) {
      logger.error('Failed to create section group', { data })
      throw new Error(data.error?.message || 'Failed to create section group')
    }

    logger.info('Section group created successfully', {
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
    sectionGroup: { type: 'json', description: 'Created section group details' },
  },
}
