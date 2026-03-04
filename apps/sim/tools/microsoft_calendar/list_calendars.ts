import { createLogger } from '@sim/logger'
import type {
  Calendar,
  MicrosoftCalendarListCalendarsResponse,
  MicrosoftCalendarToolParams,
} from '@/tools/microsoft_calendar/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftCalendarListCalendars')

export const listCalendarsTool: ToolConfig<
  MicrosoftCalendarToolParams,
  MicrosoftCalendarListCalendarsResponse
> = {
  id: 'microsoft_calendar_list_calendars',
  name: 'List Calendars',
  description: 'List all calendars accessible to the user in Microsoft Calendar',
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
    select: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Comma-separated list of properties to select (e.g., "id,name,color")',
    },
    filter: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'OData filter query (e.g., "canEdit eq true")',
    },
    orderby: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Sort field (e.g., "name", "name desc")',
    },
    top: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'Maximum number of calendars to return (e.g., 10, 50, 100)',
    },
  },

  request: {
    url: (params) => {
      const url = new URL('https://graph.microsoft.com/v1.0/me/calendars')

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

  transformResponse: async (response): Promise<MicrosoftCalendarListCalendarsResponse> => {
    logger.info('Transforming list calendars response')

    const data = await response.json()

    if (!response.ok) {
      logger.error('Error listing calendars', { error: data })
      return {
        success: false,
        error: data.error?.message || 'Failed to list calendars',
      }
    }

    const calendars = data.value as Calendar[]

    return {
      success: true,
      output: {
        data: {
          calendars,
          nextLink: data['@odata.nextLink'],
        },
      },
    }
  },

  outputs: {
    calendars: {
      type: 'array',
      description: 'List of calendars',
    },
    nextLink: {
      type: 'string',
      description: 'Link to next page of results if pagination is available',
    },
  },
}
