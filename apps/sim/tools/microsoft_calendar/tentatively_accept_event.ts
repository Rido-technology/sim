import { createLogger } from '@sim/logger'
import type {
  MicrosoftCalendarTentativelyAcceptEventResponse,
  MicrosoftCalendarToolParams,
} from '@/tools/microsoft_calendar/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftCalendarTentativelyAcceptEvent')

export const tentativelyAcceptEventTool: ToolConfig<
  MicrosoftCalendarToolParams,
  MicrosoftCalendarTentativelyAcceptEventResponse
> = {
  id: 'microsoft_calendar_tentatively_accept_event',
  name: 'Tentatively Accept Event',
  description: 'Tentatively accept an event invitation in Microsoft Calendar',
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
      description: 'ID of the event to tentatively accept',
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

      return `https://graph.microsoft.com/v1.0/me/events/${params.eventId}/tentativelyAccept`
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
    logger.info('Transforming tentatively accept event response')

    if (!response.ok) {
      const data = await response.json()
      logger.error('Error tentatively accepting event', { error: data })
      return {
        success: false,
        error: data.error?.message || 'Failed to tentatively accept event',
      }
    }

    return {
      success: true,
      output: {
        data: {
          success: true,
          message: 'Event tentatively accepted successfully',
        },
      },
    }
  },

  outputs: {
    success: {
      type: 'boolean',
      description: 'Whether the event was successfully tentatively accepted',
    },
    message: {
      type: 'string',
      description: 'Success message',
    },
  },
}
