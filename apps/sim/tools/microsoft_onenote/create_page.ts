import { createLogger } from '@sim/logger'
import type {
  MicrosoftOneNoteToolParams,
  OneNoteCreatePageResponse,
  Page,
} from '@/tools/microsoft_onenote/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftOneNoteCreatePage')

/**
 * Helper function to escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

/**
 * Helper function to create OneNote HTML format
 */
function createOneNoteHTML(title: string, content: string): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <title>${escapeHtml(title)}</title>
  </head>
  <body>
    ${content}
  </body>
</html>`
}

export const createPageTool: ToolConfig<MicrosoftOneNoteToolParams, OneNoteCreatePageResponse> = {
  id: 'microsoft_onenote_create_page',
  name: 'Create OneNote Page',
  description: 'Create a new page in a OneNote section',
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
      description: 'The ID of the section where the page will be created',
    },
    title: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'The title of the page (e.g., "Meeting Notes - March 3")',
    },
    content: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'The HTML content of the page (e.g., "<p>Notes go here</p>")',
    },
  },

  request: {
    url: (params) => {
      if (!params.sectionId) {
        throw new Error('Section ID is required')
      }

      return `https://graph.microsoft.com/v1.0/me/onenote/sections/${params.sectionId}/pages`
    },
    method: 'POST',
    headers: (params) => {
      if (!params.accessToken) {
        throw new Error('Access token is required')
      }

      return {
        Authorization: `Bearer ${params.accessToken}`,
        'Content-Type': 'text/html',
      }
    },
    body: (params) => {
      if (!params.title) {
        throw new Error('Title is required')
      }
      if (!params.content) {
        throw new Error('Content is required')
      }

      const html = createOneNoteHTML(params.title, params.content)
      logger.info('Creating page with title:', params.title)
      return html
    },
  },

  transformResponse: async (response: Response) => {
    const pageData = await response.json()
    logger.info('Created page:', pageData)

    const page: Page = {
      id: pageData.id,
      title: pageData.title,
      createdDateTime: pageData.createdDateTime,
      lastModifiedDateTime: pageData.lastModifiedDateTime,
      level: pageData.level || 0,
      order: pageData.order || 0,
      contentUrl: pageData.contentUrl,
      links: pageData.links,
      parentSection: pageData.parentSection,
    }

    return {
      success: true,
      output: {
        page,
      },
    }
  },

  outputs: {
    success: { type: 'boolean', description: 'Whether the page was created successfully' },
    page: { type: 'object', description: 'The created page details' },
  },
}
