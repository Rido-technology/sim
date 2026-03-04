import { createLogger } from '@sim/logger'
import type {
  Calendar,
  MicrosoftCalendarGetCalendarResponse,
  MicrosoftCalendarToolParams,
} from '@/tools/microsoft_calendar/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftCalendarGetCalendar')

export const getCalendarTool: ToolConfig<
  MicrosoftCalendarToolParams,
  MicrosoftCalendarGetCalendarResponse
> = {
  id: 'microsoft_calendar_get_calendar',
  name: 'Get Calendar',
  description: 'Get details of a specific calendar in Microsoft Calendar',
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
      required: true,
      visibility: 'user-or-llm',
      description: 'ID of the calendar to retrieve',
    },
    select: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Comma-separated list of properties to select (e.g., "id,name,color")',
    },
  },

  request: {
    url: (params) => {
      if (!params.calendarId) {
        throw new Error('Calendar ID is required')
      }

      const url = new URL(`https://graph.microsoft.com/v1.0/me/calendars/${params.calendarId}`)

      if (params.select) {
        url.searchParams.append('$select', params.select)
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
    logger.info('Transforming get calendar response')

    const data = await response.json()

    if (!response.ok) {
      logger.error('Error getting calendar', { error: data })
      return {
        success: false,
        error: data.error?.message || 'Failed to get calendar',
      }
    }

    const calendar = data as Calendar

    return {
      success: true,
      output: {
        data: {
          calendar,
        },
      },
    }
  },

  outputs: {
    calendar: {
      type: 'object',
      description: 'Calendar details',
    },
  },
}
