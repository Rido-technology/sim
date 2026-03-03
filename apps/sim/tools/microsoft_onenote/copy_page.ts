import { createLogger } from '@sim/logger'
import type { ToolConfig } from '@/tools/types'
import type { MicrosoftOneNoteToolParams, OneNoteCopyPageResponse } from './types'

const logger = createLogger('MicrosoftOneNote')

export const microsoftOnenoteCopyPage: ToolConfig<
  MicrosoftOneNoteToolParams,
  OneNoteCopyPageResponse
> = {
  id: 'microsoft_onenote_copy_page',
  name: 'Copy OneNote Page',
  description: 'Copy a page to a different section',
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
    pageId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'The ID of the page to copy',
    },
    targetSectionId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'The ID of the section to copy the page to',
    },
  },
  request: {
    url: (params) => `https://graph.microsoft.com/v1.0/me/onenote/pages/${params.pageId}/copyToSection`,
    method: 'POST',
    headers: (params) => ({
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    }),
    body: (params) => JSON.stringify({ id: params.targetSectionId }),
  },
  transformResponse: async (response) => {
    if (!response.ok) {
      const data = await response.json()
      logger.error('Failed to copy page', { data })
      throw new Error(data.error?.message || 'Failed to copy page')
    }

    const operationLocation = response.headers.get('Operation-Location') || ''
    const operationId = operationLocation.split('/').pop() || ''

    logger.info('Page copy operation initiated', {
      operationId,
    })

    return {
      success: true,
      output: {
        operationId,
        message: 'Page copy operation initiated',
      },
    }
  },
  outputs: {
    success: { type: 'boolean', description: 'Whether the operation was successful' },
    operationId: { type: 'string', description: 'Operation ID for tracking the copy operation' },
    message: { type: 'string', description: 'Status message' },
  },
}
