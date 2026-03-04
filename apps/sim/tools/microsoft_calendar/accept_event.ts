import { createLogger } from '@sim/logger'
import type {
  MicrosoftCalendarAcceptEventResponse,
  MicrosoftCalendarToolParams,
} from '@/tools/microsoft_calendar/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftCalendarAcceptEvent')

export const acceptEventTool: ToolConfig<
  MicrosoftCalendarToolParams,
  MicrosoftCalendarAcceptEventResponse
> = {
  id: 'microsoft_calendar_accept_event',
  name: 'Accept Event',
  description: 'Accept an event invitation in Microsoft Calendar',
  version: '1.0',

  oauth: {
    required: true,
    provider: 'microsoft-calendar',
  },

  params: {
    accessToken: {
      type: 'string',
      required: true,
      visibility: 'hidden',
      description: 'The access token for the Microsoft Calendar API',
    },
    eventId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'ID of the event to accept',
    },
    comment: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Optional comment to include in the response',
    },
    sendResponse: {
      type: 'boolean',
      required: false,
      visibility: 'user-or-llm',
      description: 'Whether to send a response to the organizer (default: true)',
    },
  },

  request: {
    url: (params) => {
      if (!params.eventId) {
        throw new Error('Event ID is required')
      }

      return `https://graph.microsoft.com/v1.0/me/events/${params.eventId}/accept`
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
      const body: Record<string, unknown> = {
        sendResponse: params.sendResponse !== false,
      }

      if (params.comment) {
        body.comment = params.comment
      }

      return JSON.stringify(body)
    },
  },

  transformResponse: async (response) => {
    logger.info('Transforming accept event response')

    if (!response.ok) {
      const data = await response.json()
      logger.error('Error accepting event', { error: data })
      return {
        success: false,
        error: data.error?.message || 'Failed to accept event',
      }
    }

    return {
      success: true,
      output: {
        data: {
          success: true,
          message: 'Event accepted successfully',
        },
      },
    }
  },

  outputs: {
    success: {
      type: 'boolean',
      description: 'Whether the event was successfully accepted',
    },
    message: {
      type: 'string',
      description: 'Success message',
    },
  },
}
