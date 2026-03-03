import { createLogger } from '@sim/logger'
import type {
  MicrosoftOneNoteToolParams,
  OneNoteGetSectionResponse,
  Section,
} from '@/tools/microsoft_onenote/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftOneNoteGetSection')

export const getSectionTool: ToolConfig<MicrosoftOneNoteToolParams, OneNoteGetSectionResponse> = {
  id: 'microsoft_onenote_get_section',
  name: 'Get OneNote Section',
  description: 'Get details of a specific OneNote section',
  version: '1.0',

  oauth: {
    required: true,
    provider: 'microsoft-onenote',
  },

  params: {
    accessToken: {
      type: 'string',
      required: true,
      visibility: 'hidden',
      description: 'The access token for the Microsoft OneNote API',
    },
    sectionId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'The ID of the section to retrieve (e.g., "1-abcdef")',
    },
  },

  request: {
    url: (params) => {
      if (!params.sectionId) {
        throw new Error('Section ID is required')
      }

      return `https://graph.microsoft.com/v1.0/me/onenote/sections/${params.sectionId}`
    },
    method: 'GET',
    headers: (params) => {
      if (!params.accessToken) {
        throw new Error('Access token is required')
      }

      return {
        Authorization: `Bearer ${params.accessToken}`,
      }
    },
  },

  transformResponse: async (response: Response) => {
    const sec = await response.json()
    logger.info('Retrieved section:', sec)

    const section: Section = {
      id: sec.id,
      displayName: sec.displayName,
      createdDateTime: sec.createdDateTime,
      lastModifiedDateTime: sec.lastModifiedDateTime,
      isDefault: sec.isDefault || false,
      pagesUrl: sec.pagesUrl,
      parentNotebook: sec.parentNotebook,
    }

    return {
      success: true,
      output: {
        section,
      },
    }
  },

  outputs: {
    success: { type: 'boolean', description: 'Whether the operation was successful' },
    section: { type: 'object', description: 'The section details' },
  },
}
