import { createLogger } from '@sim/logger'
import type {
  Calendar,
  MicrosoftCalendarToolParams,
  MicrosoftCalendarUpdateCalendarResponse,
} from '@/tools/microsoft_calendar/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftCalendarUpdateCalendar')

export const updateCalendarTool: ToolConfig<
  MicrosoftCalendarToolParams,
  MicrosoftCalendarUpdateCalendarResponse
> = {
  id: 'microsoft_calendar_update_calendar',
  name: 'Update Calendar',
  description: 'Update an existing calendar in Microsoft Calendar',
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
      description: 'ID of the calendar to update',
    },
    name: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'New name for the calendar',
    },
    color: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description:
        'New color for the calendar (auto, lightBlue, lightGreen, lightOrange, lightGray, lightYellow, lightTeal, lightPink, lightBrown, lightRed)',
    },
  },

  request: {
    url: (params) => {
      if (!params.calendarId) {
        throw new Error('Calendar ID is required')
      }

      return `https://graph.microsoft.com/v1.0/me/calendars/${params.calendarId}`
    },
    method: 'PATCH',
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
      const body: Record<string, unknown> = {}

      if (params.name) {
        body.name = params.name
      }

      if (params.color) {
        body.color = params.color
      }

      if (Object.keys(body).length === 0) {
        throw new Error('At least one field (name or color) must be provided to update')
      }

      return JSON.stringify(body)
    },
  },

  transformResponse: async (response) => {
    logger.info('Transforming update calendar response')

    const data = await response.json()

    if (!response.ok) {
      logger.error('Error updating calendar', { error: data })
      return {
        success: false,
        error: data.error?.message || 'Failed to update calendar',
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
      description: 'Updated calendar details',
    },
  },
}
