import { createLogger } from '@sim/logger'
import type {
  MicrosoftOneNoteToolParams,
  Notebook,
  OneNoteGetNotebookResponse,
} from '@/tools/microsoft_onenote/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftOneNoteGetNotebook')

export const getNotebookTool: ToolConfig<
  MicrosoftOneNoteToolParams,
  OneNoteGetNotebookResponse
> = {
  id: 'microsoft_onenote_get_notebook',
  name: 'Get OneNote Notebook',
  description: 'Get details of a specific OneNote notebook',
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
      description: 'The ID of the notebook to retrieve (e.g., "1-123456789")',
    },
  },

  request: {
    url: (params) => {
      if (!params.notebookId) {
        throw new Error('Notebook ID is required')
      }

      return `https://graph.microsoft.com/v1.0/me/onenote/notebooks/${params.notebookId}`
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
    const nb = await response.json()
    logger.info('Retrieved notebook:', nb)

    const notebook: Notebook = {
      id: nb.id,
      displayName: nb.displayName,
      createdDateTime: nb.createdDateTime,
      lastModifiedDateTime: nb.lastModifiedDateTime,
      isDefault: nb.isDefault || false,
      userRole: nb.userRole || 'Unknown',
      isShared: nb.isShared || false,
      sectionsUrl: nb.sectionsUrl,
      sectionGroupsUrl: nb.sectionGroupsUrl,
      links: nb.links,
    }

    return {
      success: true,
      output: {
        notebook,
      },
    }
  },

  outputs: {
    success: { type: 'boolean', description: 'Whether the operation was successful' },
    notebook: { type: 'object', description: 'The notebook details' },
  },
}
