import { createLogger } from '@sim/logger'
import type {
  MicrosoftOneNoteToolParams,
  Notebook,
  OneNoteCreateNotebookResponse,
} from '@/tools/microsoft_onenote/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftOneNoteCreateNotebook')

export const createNotebookTool: ToolConfig<
  MicrosoftOneNoteToolParams,
  OneNoteCreateNotebookResponse
> = {
  id: 'microsoft_onenote_create_notebook',
  name: 'Create OneNote Notebook',
  description: 'Create a new OneNote notebook',
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
    displayName: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'The name of the notebook (e.g., "Project Notes", "Meeting Notes")',
    },
  },

  request: {
    url: () => 'https://graph.microsoft.com/v1.0/me/onenote/notebooks',
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

      logger.info('Creating notebook with body:', body)
      return body
    },
  },

  transformResponse: async (response: Response) => {
    const nb = await response.json()
    logger.info('Created notebook:', nb)

    const notebook: Notebook = {
      id: nb.id,
      displayName: nb.displayName,
      createdDateTime: nb.createdDateTime,
      lastModifiedDateTime: nb.lastModifiedDateTime,
      isDefault: nb.isDefault || false,
      userRole: nb.userRole || 'Owner',
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
    success: { type: 'boolean', description: 'Whether the notebook was created successfully' },
    notebook: { type: 'object', description: 'The created notebook details' },
  },
}
