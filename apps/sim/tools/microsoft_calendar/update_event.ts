import { createLogger } from '@sim/logger'
import type {
  CalendarEvent,
  MicrosoftCalendarToolParams,
  MicrosoftCalendarUpdateEventResponse,
} from '@/tools/microsoft_calendar/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftCalendarUpdateEvent')

export const updateEventTool: ToolConfig<
  MicrosoftCalendarToolParams,
  MicrosoftCalendarUpdateEventResponse
> = {
  id: 'microsoft_calendar_update_event',
  name: 'Update Event',
  description: 'Update an existing event in Microsoft Calendar',
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
      description: 'ID of the event to update',
    },
    subject: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'New title/subject of the event',
    },
    body: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'New description/body of the event',
    },
    bodyType: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Body content type: "HTML" or "text"',
    },
    startDateTime: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'New start date/time (ISO 8601 format)',
    },
    startTimeZone: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'New start time zone',
    },
    endDateTime: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'New end date/time (ISO 8601 format)',
    },
    endTimeZone: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'New end time zone',
    },
    location: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'New location of the event',
    },
    attendees: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'JSON array of attendees',
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
      description: 'Whether to create an online meeting',
    },
    onlineMeetingProvider: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Online meeting provider',
    },
    showAs: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Show as status',
    },
    importance: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Importance level',
    },
    sensitivity: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Sensitivity',
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
      description: 'Minutes before start to trigger reminder',
    },
    recurrence: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'JSON object defining recurrence pattern',
    },
    categories: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'JSON array of category names',
    },
  },

  request: {
    url: (params) => {
      if (!params.eventId) {
        throw new Error('Event ID is required')
      }

      return `https://graph.microsoft.com/v1.0/me/events/${params.eventId}`
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

      if (params.subject) {
        body.subject = params.subject
      }

      if (params.body) {
        body.body = {
          contentType: params.bodyType || 'HTML',
          content: params.body,
        }
      }

      if (params.startDateTime) {
        body.start = {
          dateTime: params.startDateTime,
          timeZone: params.startTimeZone || 'UTC',
        }
      }

      if (params.endDateTime) {
        body.end = {
          dateTime: params.endDateTime,
          timeZone: params.endTimeZone || 'UTC',
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

      if (Object.keys(body).length === 0) {
        throw new Error('At least one field must be provided to update')
      }

      return JSON.stringify(body)
    },
  },

  transformResponse: async (response) => {
    logger.info('Transforming update event response')

    const data = await response.json()

    if (!response.ok) {
      logger.error('Error updating event', { error: data })
      return {
        success: false,
        error: data.error?.message || 'Failed to update event',
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
      description: 'Updated event details',
    },
  },
}
