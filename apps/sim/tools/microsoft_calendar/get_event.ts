import { createLogger } from '@sim/logger'
import type {
  CalendarEvent,
  MicrosoftCalendarGetEventResponse,
  MicrosoftCalendarToolParams,
} from '@/tools/microsoft_calendar/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftCalendarGetEvent')

export const getEventTool: ToolConfig<
  MicrosoftCalendarToolParams,
  MicrosoftCalendarGetEventResponse
> = {
  id: 'microsoft_calendar_get_event',
  name: 'Get Event',
  description: 'Get details of a specific event in Microsoft Calendar',
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
      description: 'ID of the event to retrieve',
    },
    select: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Comma-separated list of properties to select (e.g., "subject,start,end,attendees")',
    },
    expand: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Related resources to expand (e.g., "attachments")',
    },
  },

  request: {
    url: (params) => {
      if (!params.eventId) {
        throw new Error('Event ID is required')
      }

      const url = new URL(`https://graph.microsoft.com/v1.0/me/events/${params.eventId}`)

      if (params.select) {
        url.searchParams.append('$select', params.select)
      }

      if (params.expand) {
        url.searchParams.append('$expand', params.expand)
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

  transformResponse: async (response) => {
    logger.info('Transforming get event response')

    const data = await response.json()

    if (!response.ok) {
      logger.error('Error getting event', { error: data })
      return {
        success: false,
        error: data.error?.message || 'Failed to get event',
      }
    }

    const event = data as CalendarEvent

    return {
      success: true,
      output: {
        data: {
          event,
        },
      },
    }
  },

  outputs: {
    event: {
      type: 'object',
      description: 'Event details',
    },
  },
}
