import { createLogger } from '@sim/logger'
import type {
  MicrosoftOneNoteToolParams,
  Notebook,
  OneNoteListNotebooksResponse,
} from '@/tools/microsoft_onenote/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftOneNoteListNotebooks')

export const listNotebooksTool: ToolConfig<
  MicrosoftOneNoteToolParams,
  OneNoteListNotebooksResponse
> = {
  id: 'microsoft_onenote_list_notebooks',
  name: 'List OneNote Notebooks',
  description: 'List all OneNote notebooks accessible to the user',
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
    filter: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'OData filter query (e.g., "isDefault eq true")',
    },
    orderby: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Sort field (e.g., "displayName", "lastModifiedDateTime desc")',
    },
    top: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'Maximum number of notebooks to return (e.g., 10, 50, 100)',
    },
  },

  request: {
    url: (params) => {
      const url = new URL('https://graph.microsoft.com/v1.0/me/onenote/notebooks')

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
    logger.info('Listed notebooks:', data)

    const notebooks: Notebook[] = data.value?.map((nb: any) => ({
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
    }))

    return {
      success: true,
      output: {
        notebooks: notebooks || [],
      },
    }
  },

  outputs: {
    success: { type: 'boolean', description: 'Whether the operation was successful' },
    notebooks: { type: 'array', description: 'List of OneNote notebooks' },
  },
}
