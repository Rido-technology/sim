import { createLogger } from '@sim/logger'
import type {
  MicrosoftCalendarForwardEventResponse,
  MicrosoftCalendarToolParams,
} from '@/tools/microsoft_calendar/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftCalendarForwardEvent')

export const forwardEventTool: ToolConfig<
  MicrosoftCalendarToolParams,
  MicrosoftCalendarForwardEventResponse
> = {
  id: 'microsoft_calendar_forward_event',
  name: 'Forward Event',
  description: 'Forward an event to other recipients in Microsoft Calendar',
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
      description: 'ID of the event to forward',
    },
    toRecipients: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description:
        'JSON array of recipients (e.g., [{"emailAddress": {"address": "john@example.com", "name": "John"}}])',
    },
    comment: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Optional comment to include with the forwarded event',
    },
  },

  request: {
    url: (params) => {
      if (!params.eventId) {
        throw new Error('Event ID is required')
      }

      return `https://graph.microsoft.com/v1.0/me/events/${params.eventId}/forward`
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
      if (!params.toRecipients) {
        throw new Error('Recipients are required')
      }

      const body: Record<string, unknown> = {}

      try {
        body.toRecipients = JSON.parse(params.toRecipients)
      } catch (error) {
        logger.error('Invalid toRecipients JSON', { error })
        throw new Error('Invalid toRecipients format. Must be a valid JSON array.')
      }

      if (params.comment) {
        body.comment = params.comment
      }

      return JSON.stringify(body)
    },
  },

  transformResponse: async (response) => {
    logger.info('Transforming forward event response')

    if (!response.ok) {
      const data = await response.json()
      logger.error('Error forwarding event', { error: data })
      return {
        success: false,
        error: data.error?.message || 'Failed to forward event',
      }
    }

    return {
      success: true,
      output: {
        data: {
          success: true,
          message: 'Event forwarded successfully',
        },
      },
    }
  },

  outputs: {
    success: {
      type: 'boolean',
      description: 'Whether the event was successfully forwarded',
    },
    message: {
      type: 'string',
      description: 'Success message',
    },
  },
}
