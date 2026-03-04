import { createLogger } from '@sim/logger'
import type {
  MicrosoftCalendarDeleteCalendarResponse,
  MicrosoftCalendarToolParams,
} from '@/tools/microsoft_calendar/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftCalendarDeleteCalendar')

export const deleteCalendarTool: ToolConfig<
  MicrosoftCalendarToolParams,
  MicrosoftCalendarDeleteCalendarResponse
> = {
  id: 'microsoft_calendar_delete_calendar',
  name: 'Delete Calendar',
  description: 'Delete a calendar from Microsoft Calendar',
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
      description: 'ID of the calendar to delete',
    },
  },

  request: {
    url: (params) => {
      if (!params.calendarId) {
        throw new Error('Calendar ID is required')
      }

      return `https://graph.microsoft.com/v1.0/me/calendars/${params.calendarId}`
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
    logger.info('Transforming delete calendar response')

    if (!response.ok) {
      const data = await response.json()
      logger.error('Error deleting calendar', { error: data })
      return {
        success: false,
        error: data.error?.message || 'Failed to delete calendar',
      }
    }

    return {
      success: true,
      output: {
        data: {
          success: true,
          message: 'Calendar deleted successfully',
        },
      },
    }
  },

  outputs: {
    success: {
      type: 'boolean',
      description: 'Whether the calendar was successfully deleted',
    },
    message: {
      type: 'string',
      description: 'Success message',
    },
  },
}
