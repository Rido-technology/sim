import { createLogger } from '@sim/logger'
import type {
  MicrosoftOneNoteToolParams,
  OneNoteListSectionsResponse,
  Section,
} from '@/tools/microsoft_onenote/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftOneNoteListSections')

export const listSectionsTool: ToolConfig<
  MicrosoftOneNoteToolParams,
  OneNoteListSectionsResponse
> = {
  id: 'microsoft_onenote_list_sections',
  name: 'List OneNote Sections',
  description: 'List all sections in a OneNote notebook',
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
      description: 'The ID of the notebook (e.g., "1-123456789")',
    },
    top: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'Maximum number of sections to return (e.g., 10, 50, 100)',
    },
  },

  request: {
    url: (params) => {
      if (!params.notebookId) {
        throw new Error('Notebook ID is required')
      }

      const url = new URL(
        `https://graph.microsoft.com/v1.0/me/onenote/notebooks/${params.notebookId}/sections`
      )

      if (params.top) {
        url.searchParams.append('$top', params.top.toString())
      }

      return url.toString()
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
    const data = await response.json()
    logger.info('Listed sections:', data)

    const sections: Section[] = data.value?.map((sec: any) => ({
      id: sec.id,
      displayName: sec.displayName,
      createdDateTime: sec.createdDateTime,
      lastModifiedDateTime: sec.lastModifiedDateTime,
      isDefault: sec.isDefault || false,
      pagesUrl: sec.pagesUrl,
      parentNotebook: sec.parentNotebook,
    }))

    return {
      success: true,
      output: {
        sections: sections || [],
      },
    }
  },

  outputs: {
    success: { type: 'boolean', description: 'Whether the operation was successful' },
    sections: { type: 'array', description: 'List of sections in the notebook' },
  },
}
