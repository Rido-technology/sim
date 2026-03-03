import { createLogger } from '@sim/logger'
import type {
  MicrosoftOneNoteToolParams,
  OneNoteCreateSectionResponse,
  Section,
} from '@/tools/microsoft_onenote/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftOneNoteCreateSection')

export const createSectionTool: ToolConfig<
  MicrosoftOneNoteToolParams,
  OneNoteCreateSectionResponse
> = {
  id: 'microsoft_onenote_create_section',
  name: 'Create OneNote Section',
  description: 'Create a new section in a OneNote notebook',
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
    notebookId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'The ID of the notebook where the section will be created',
    },
    displayName: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'The name of the section (e.g., "Meeting Notes", "Ideas")',
    },
  },

  request: {
    url: (params) => {
      if (!params.notebookId) {
        throw new Error('Notebook ID is required')
      }

      return `https://graph.microsoft.com/v1.0/me/onenote/notebooks/${params.notebookId}/sections`
    },
    method: 'POST',
    headers: (params) => {
      if (!params.accessToken) {
        throw new Error('Access token is required')
      }

      return {
        Authorization: `Bearer ${params.accessToken}`,
        'Content-Type': 'application/json',
      }
    },
    body: (params) => {
      if (!params.displayName) {
        throw new Error('Display name is required')
      }

      const body = {
        displayName: params.displayName,
      }

      logger.info('Creating section with body:', body)
      return body
    },
  },

  transformResponse: async (response: Response) => {
    const sec = await response.json()
    logger.info('Created section:', sec)

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
    success: { type: 'boolean', description: 'Whether the section was created successfully' },
    section: { type: 'object', description: 'The created section details' },
  },
}
