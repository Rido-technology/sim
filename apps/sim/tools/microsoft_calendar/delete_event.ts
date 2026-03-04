import { createLogger } from '@sim/logger'
import type {
  MicrosoftCalendarDeleteEventResponse,
  MicrosoftCalendarToolParams,
} from '@/tools/microsoft_calendar/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftCalendarDeleteEvent')

export const deleteEventTool: ToolConfig<
  MicrosoftCalendarToolParams,
  MicrosoftCalendarDeleteEventResponse
> = {
  id: 'microsoft_calendar_delete_event',
  name: 'Delete Event',
  description: 'Delete an event from Microsoft Calendar',
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
      description: 'ID of the event to delete',
    },
  },

  request: {
    url: (params) => {
      if (!params.eventId) {
        throw new Error('Event ID is required')
      }

      return `https://graph.microsoft.com/v1.0/me/events/${params.eventId}`
    },
    method: 'DELETE',
    headers: (params) => {
      if (!params.accessToken) {
        throw new Error('Access token is required')
      }

      return {
        Authorization: `Bearer ${params.accessToken}`,
      }
    },
  },

  transformResponse: async (response) => {
    logger.info('Transforming delete event response')

    if (!response.ok) {
      const data = await response.json()
      logger.error('Error deleting event', { error: data })
      return {
        success: false,
        error: data.error?.message || 'Failed to delete event',
      }
    }

    return {
      success: true,
      output: {
        data: {
          success: true,
          message: 'Event deleted successfully',
        },
      },
    }
  },

  outputs: {
    success: {
      type: 'boolean',
      description: 'Whether the event was successfully deleted',
    },
    message: {
      type: 'string',
      description: 'Success message',
    },
  },
}
