import { createLogger } from '@sim/logger'
import type {
  Calendar,
  MicrosoftCalendarCreateCalendarResponse,
  MicrosoftCalendarToolParams,
} from '@/tools/microsoft_calendar/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftCalendarCreateCalendar')

export const createCalendarTool: ToolConfig<
  MicrosoftCalendarToolParams,
  MicrosoftCalendarCreateCalendarResponse
> = {
  id: 'microsoft_calendar_create_calendar',
  name: 'Create Calendar',
  description: 'Create a new calendar in Microsoft Calendar',
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
    name: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Name of the calendar to create',
    },
    color: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description:
        'Color for the calendar (auto, lightBlue, lightGreen, lightOrange, lightGray, lightYellow, lightTeal, lightPink, lightBrown, lightRed)',
    },
  },

  request: {
    url: () => 'https://graph.microsoft.com/v1.0/me/calendars',
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
      if (!params.name) {
        throw new Error('Calendar name is required')
      }

      const body: Record<string, unknown> = {
        name: params.name,
      }

      if (params.color) {
        body.color = params.color
      }

      return JSON.stringify(body)
    },
  },

  transformResponse: async (response) => {
    logger.info('Transforming create calendar response')

    const data = await response.json()

    if (!response.ok) {
      logger.error('Error creating calendar', { error: data })
      return {
        success: false,
        error: data.error?.message || 'Failed to create calendar',
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
      description: 'Created calendar details',
    },
  },
}
