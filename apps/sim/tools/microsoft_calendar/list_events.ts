import { createLogger } from '@sim/logger'
import type {
  CalendarEvent,
  MicrosoftCalendarListEventsResponse,
  MicrosoftCalendarToolParams,
} from '@/tools/microsoft_calendar/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftCalendarListEvents')

export const listEventsTool: ToolConfig<
  MicrosoftCalendarToolParams,
  MicrosoftCalendarListEventsResponse
> = {
  id: 'microsoft_calendar_list_events',
  name: 'List Events',
  description: 'List events from Microsoft Calendar with optional calendar view filtering',
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
    calendarId: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'ID of the calendar (if omitted, all events from all calendars are returned)',
    },
    startDateTime: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Start date/time for calendar view (ISO 8601 format, e.g., "2026-03-10T00:00:00")',
    },
    endDateTime: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'End date/time for calendar view (ISO 8601 format, e.g., "2026-03-17T00:00:00")',
    },
    select: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Comma-separated list of properties to select (e.g., "subject,start,end,location")',
    },
    filter: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'OData filter query (e.g., "showAs eq \'busy\'")',
    },
    orderby: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Sort field (e.g., "start/dateTime", "subject desc")',
    },
    top: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'Maximum number of events to return (e.g., 10, 50, 100)',
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
      let baseUrl: string

      // Use calendarView if startDateTime and endDateTime are provided
      if (params.startDateTime && params.endDateTime) {
        if (params.calendarId) {
          baseUrl = `https://graph.microsoft.com/v1.0/me/calendars/${params.calendarId}/calendarView`
        } else {
          baseUrl = 'https://graph.microsoft.com/v1.0/me/calendarView'
        }

        const url = new URL(baseUrl)
        url.searchParams.append('startDateTime', params.startDateTime)
        url.searchParams.append('endDateTime', params.endDateTime)

        if (params.select) {
          url.searchParams.append('$select', params.select)
        }

        if (params.filter) {
          url.searchParams.append('$filter', params.filter)
        }

        if (params.orderby) {
          url.searchParams.append('$orderby', params.orderby)
        }

        if (params.top) {
          url.searchParams.append('$top', params.top.toString())
        }

        if (params.expand) {
          url.searchParams.append('$expand', params.expand)
        }

        return url.toString()
      }

      // Otherwise, use /events endpoint
      if (params.calendarId) {
        baseUrl = `https://graph.microsoft.com/v1.0/me/calendars/${params.calendarId}/events`
      } else {
        baseUrl = 'https://graph.microsoft.com/v1.0/me/events'
      }

      const url = new URL(baseUrl)

      if (params.select) {
        url.searchParams.append('$select', params.select)
      }

      if (params.filter) {
        url.searchParams.append('$filter', params.filter)
      }

      if (params.orderby) {
        url.searchParams.append('$orderby', params.orderby)
      }

      if (params.top) {
        url.searchParams.append('$top', params.top.toString())
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
    logger.info('Transforming list events response')

    const data = await response.json()

    if (!response.ok) {
      logger.error('Error listing events', { error: data })
      return {
        success: false,
        error: data.error?.message || 'Failed to list events',
      }
    }

    const events = data.value as CalendarEvent[]

    return {
      success: true,
      output: {
        data: {
          events,
          nextLink: data['@odata.nextLink'],
        },
      },
    }
  },

  outputs: {
    events: {
      type: 'array',
      description: 'List of events',
    },
    nextLink: {
      type: 'string',
      description: 'Link to next page of results if pagination is available',
    },
  },
}
