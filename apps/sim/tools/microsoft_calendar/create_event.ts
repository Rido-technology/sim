import { createLogger } from '@sim/logger'
import type {
  CalendarEvent,
  MicrosoftCalendarCreateEventResponse,
  MicrosoftCalendarToolParams,
} from '@/tools/microsoft_calendar/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftCalendarCreateEvent')

export const createEventTool: ToolConfig<
  MicrosoftCalendarToolParams,
  MicrosoftCalendarCreateEventResponse
> = {
  id: 'microsoft_calendar_create_event',
  name: 'Create Event',
  description: 'Create a new event in Microsoft Calendar',
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
      description: 'ID of the calendar (if omitted, the default calendar is used)',
    },
    subject: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Title/subject of the event',
    },
    body: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Description/body of the event',
    },
    bodyType: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Body content type: "HTML" or "text" (default: "HTML")',
    },
    startDateTime: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Start date/time (ISO 8601 format, e.g., "2026-03-10T14:00:00")',
    },
    startTimeZone: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Start time zone (e.g., "Pacific Standard Time", "UTC") (default: "UTC")',
    },
    endDateTime: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'End date/time (ISO 8601 format, e.g., "2026-03-10T15:00:00")',
    },
    endTimeZone: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'End time zone (e.g., "Pacific Standard Time", "UTC") (default: "UTC")',
    },
    location: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Location of the event',
    },
    attendees: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description:
        'JSON array of attendees with type and email (e.g., [{"type": "required", "emailAddress": {"address": "john@example.com", "name": "John"}}])',
    },
    isAllDay: {
      type: 'boolean',
      required: false,
      visibility: 'user-or-llm',
      description: 'Whether the event is an all-day event',
    },
    isOnlineMeeting: {
      type: 'boolean',
      required: false,
      visibility: 'user-or-llm',
      description: 'Whether to create an online meeting (Teams)',
    },
    onlineMeetingProvider: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Online meeting provider: "teamsForBusiness", "skypeForBusiness", "skypeForConsumer"',
    },
    showAs: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Show as status: "free", "tentative", "busy", "oof", "workingElsewhere", "unknown"',
    },
    importance: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Importance level: "low", "normal", "high"',
    },
    sensitivity: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Sensitivity: "normal", "personal", "private", "confidential"',
    },
    isReminderOn: {
      type: 'boolean',
      required: false,
      visibility: 'user-or-llm',
      description: 'Whether to enable reminder',
    },
    reminderMinutesBeforeStart: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'Minutes before start to trigger reminder (e.g., 15, 30, 60)',
    },
    recurrence: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'JSON object defining recurrence pattern and range',
    },
    categories: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'JSON array of category names (e.g., ["Important", "Work"])',
    },
  },

  request: {
    url: (params) => {
      if (params.calendarId) {
        return `https://graph.microsoft.com/v1.0/me/calendars/${params.calendarId}/events`
      }
      return 'https://graph.microsoft.com/v1.0/me/events'
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
      if (!params.subject || !params.startDateTime || !params.endDateTime) {
        throw new Error('Subject, start date/time, and end date/time are required')
      }

      const body: Record<string, unknown> = {
        subject: params.subject,
        start: {
          dateTime: params.startDateTime,
          timeZone: params.startTimeZone || 'UTC',
        },
        end: {
          dateTime: params.endDateTime,
          timeZone: params.endTimeZone || 'UTC',
        },
      }

      if (params.body) {
        body.body = {
          contentType: params.bodyType || 'HTML',
          content: params.body,
        }
      }

      if (params.location) {
        body.location = {
          displayName: params.location,
        }
      }

      if (params.attendees) {
        try {
          body.attendees = JSON.parse(params.attendees)
        } catch (error) {
          logger.error('Invalid attendees JSON', { error })
          throw new Error('Invalid attendees format. Must be a valid JSON array.')
        }
      }

      if (params.isAllDay !== undefined) {
        body.isAllDay = params.isAllDay
      }

      if (params.isOnlineMeeting !== undefined) {
        body.isOnlineMeeting = params.isOnlineMeeting
      }

      if (params.onlineMeetingProvider) {
        body.onlineMeetingProvider = params.onlineMeetingProvider
      }

      if (params.showAs) {
        body.showAs = params.showAs
      }

      if (params.importance) {
        body.importance = params.importance
      }

      if (params.sensitivity) {
        body.sensitivity = params.sensitivity
      }

      if (params.isReminderOn !== undefined) {
        body.isReminderOn = params.isReminderOn
      }

      if (params.reminderMinutesBeforeStart !== undefined) {
        body.reminderMinutesBeforeStart = params.reminderMinutesBeforeStart
      }

      if (params.recurrence) {
        try {
          body.recurrence = JSON.parse(params.recurrence)
        } catch (error) {
          logger.error('Invalid recurrence JSON', { error })
          throw new Error('Invalid recurrence format. Must be a valid JSON object.')
        }
      }

      if (params.categories) {
        try {
          body.categories = JSON.parse(params.categories)
        } catch (error) {
          logger.error('Invalid categories JSON', { error })
          throw new Error('Invalid categories format. Must be a valid JSON array.')
        }
      }

      return JSON.stringify(body)
    },
  },

  transformResponse: async (response) => {
    logger.info('Transforming create event response')

    const data = await response.json()

    if (!response.ok) {
      logger.error('Error creating event', { error: data })
      return {
        success: false,
        error: data.error?.message || 'Failed to create event',
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
      description: 'Created event details',
    },
  },
}
