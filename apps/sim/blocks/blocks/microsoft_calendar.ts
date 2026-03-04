import { MicrosoftCalendarIcon } from '@/components/icons'
import type { BlockConfig } from '@/blocks/types'
import { AuthMode } from '@/blocks/types'
import type { ToolResponse } from '@/tools/types'

interface MicrosoftCalendarBlockParams {
  credential: string
  accessToken?: string
  operation: string
  calendarId?: string
  eventId?: string
  attachmentId?: string
  name?: string
  color?: string
  subject?: string
  body?: string
  bodyType?: string
  startDateTime?: string
  startTimeZone?: string
  endDateTime?: string
  endTimeZone?: string
  location?: string
  attendees?: string
  isAllDay?: string
  isOnlineMeeting?: string
  onlineMeetingProvider?: string
  showAs?: string
  importance?: string
  sensitivity?: string
  isReminderOn?: string
  reminderMinutesBeforeStart?: number
  recurrence?: string
  categories?: string
  filter?: string
  orderby?: string
  top?: number
  select?: string
  expand?: string
  comment?: string
  sendResponse?: string
  toRecipients?: string
  [key: string]: string | number | boolean | undefined
}

export const MicrosoftCalendarBlock: BlockConfig<ToolResponse> = {
  type: 'microsoft_calendar',
  name: 'Microsoft Calendar',
  description: 'Manage events and calendars in Microsoft Calendar (Outlook Calendar)',
  authMode: AuthMode.OAuth,
  longDescription:
    'Integrate Microsoft Calendar into your workflow. Create and manage calendars, events, and invitations. Accept or decline meetings, set reminders, and create online meetings.',
  docsLink: 'https://docs.sim.ai/tools/microsoft_calendar',
  category: 'tools',
  bgColor: '#0078D4',
  icon: MicrosoftCalendarIcon,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'List Calendars', id: 'list_calendars' },
        { label: 'Get Calendar', id: 'get_calendar' },
        { label: 'Create Calendar', id: 'create_calendar' },
        { label: 'Update Calendar', id: 'update_calendar' },
        { label: 'Delete Calendar', id: 'delete_calendar' },
        { label: 'List Events', id: 'list_events' },
        { label: 'Get Event', id: 'get_event' },
        { label: 'Create Event', id: 'create_event' },
        { label: 'Update Event', id: 'update_event' },
        { label: 'Delete Event', id: 'delete_event' },
        { label: 'Accept Event', id: 'accept_event' },
        { label: 'Decline Event', id: 'decline_event' },
        { label: 'Tentatively Accept Event', id: 'tentatively_accept_event' },
        { label: 'Forward Event', id: 'forward_event' },
      ],
      value: () => 'list_events',
    },
    {
      id: 'credential',
      title: 'Microsoft Account',
      type: 'oauth-input',
      serviceId: 'microsoft-calendar',
      requiredScopes: [
        'openid',
        'profile',
        'email',
        'User.Read',
        'Calendars.ReadWrite',
        'Calendars.ReadWrite.Shared',
        'offline_access',
      ],
      placeholder: 'Select Microsoft account',
      required: true,
    },

    // Calendar ID
    {
      id: 'calendarId',
      title: 'Calendar ID',
      type: 'short-input',
      placeholder: 'Enter calendar ID (optional for default calendar)',
      condition: {
        field: 'operation',
        value: [
          'get_calendar',
          'update_calendar',
          'delete_calendar',
          'list_events',
          'create_event',
        ],
      },
      dependsOn: ['credential'],
    },

    // Event ID
    {
      id: 'eventId',
      title: 'Event ID',
      type: 'short-input',
      placeholder: 'Enter the event ID',
      condition: {
        field: 'operation',
        value: [
          'get_event',
          'update_event',
          'delete_event',
          'accept_event',
          'decline_event',
          'tentatively_accept_event',
          'forward_event',
        ],
      },
      required: true,
      dependsOn: ['credential'],
    },

    // Calendar Name
    {
      id: 'name',
      title: 'Calendar Name',
      type: 'short-input',
      placeholder: 'Enter calendar name',
      condition: {
        field: 'operation',
        value: ['create_calendar', 'update_calendar'],
      },
      required: {
        field: 'operation',
        value: 'create_calendar',
      },
      dependsOn: ['credential'],
    },

    // Calendar Color
    {
      id: 'color',
      title: 'Color',
      type: 'dropdown',
      options: [
        { label: 'Auto', id: 'auto' },
        { label: 'Light Blue', id: 'lightBlue' },
        { label: 'Light Green', id: 'lightGreen' },
        { label: 'Light Orange', id: 'lightOrange' },
        { label: 'Light Gray', id: 'lightGray' },
        { label: 'Light Yellow', id: 'lightYellow' },
        { label: 'Light Teal', id: 'lightTeal' },
        { label: 'Light Pink', id: 'lightPink' },
        { label: 'Light Brown', id: 'lightBrown' },
        { label: 'Light Red', id: 'lightRed' },
      ],
      value: () => 'auto',
      condition: {
        field: 'operation',
        value: ['create_calendar', 'update_calendar'],
      },
    },

    // Event Subject
    {
      id: 'subject',
      title: 'Subject',
      type: 'short-input',
      placeholder: 'Enter event subject/title',
      condition: {
        field: 'operation',
        value: ['create_event', 'update_event'],
      },
      required: {
        field: 'operation',
        value: 'create_event',
      },
      dependsOn: ['credential'],
    },

    // Event Body
    {
      id: 'body',
      title: 'Description',
      type: 'long-input',
      placeholder: 'Enter event description',
      condition: {
        field: 'operation',
        value: ['create_event', 'update_event'],
      },
    },

    // Body Type
    {
      id: 'bodyType',
      title: 'Description Type',
      type: 'dropdown',
      options: [
        { label: 'HTML', id: 'HTML' },
        { label: 'Text', id: 'text' },
      ],
      value: () => 'HTML',
      condition: {
        field: 'operation',
        value: ['create_event', 'update_event'],
      },
    },

    // Start Date/Time
    {
      id: 'startDateTime',
      title: 'Start Date/Time',
      type: 'short-input',
      placeholder: 'ISO 8601 format (e.g., 2026-03-10T14:00:00)',
      condition: {
        field: 'operation',
        value: ['create_event', 'update_event', 'list_events'],
      },
      required: {
        field: 'operation',
        value: 'create_event',
      },
    },

    // Start Time Zone
    {
      id: 'startTimeZone',
      title: 'Start Time Zone',
      type: 'short-input',
      placeholder: 'e.g., UTC, Pacific Standard Time (default: UTC)',
      condition: {
        field: 'operation',
        value: ['create_event', 'update_event'],
      },
    },

    // End Date/Time
    {
      id: 'endDateTime',
      title: 'End Date/Time',
      type: 'short-input',
      placeholder: 'ISO 8601 format (e.g., 2026-03-10T15:00:00)',
      condition: {
        field: 'operation',
        value: ['create_event', 'update_event', 'list_events'],
      },
      required: {
        field: 'operation',
        value: 'create_event',
      },
    },

    // End Time Zone
    {
      id: 'endTimeZone',
      title: 'End Time Zone',
      type: 'short-input',
      placeholder: 'e.g., UTC, Pacific Standard Time (default: UTC)',
      condition: {
        field: 'operation',
        value: ['create_event', 'update_event'],
      },
    },

    // Location
    {
      id: 'location',
      title: 'Location',
      type: 'short-input',
      placeholder: 'Enter event location',
      condition: {
        field: 'operation',
        value: ['create_event', 'update_event'],
      },
    },

    // Attendees
    {
      id: 'attendees',
      title: 'Attendees',
      type: 'long-input',
      placeholder:
        'JSON array: [{"type": "required", "emailAddress": {"address": "user@example.com", "name": "User"}}]',
      condition: {
        field: 'operation',
        value: ['create_event', 'update_event'],
      },
    },

    // Is All Day
    {
      id: 'isAllDay',
      title: 'All Day Event',
      type: 'dropdown',
      options: [
        { label: 'No', id: 'false' },
        { label: 'Yes', id: 'true' },
      ],
      value: () => 'false',
      condition: {
        field: 'operation',
        value: ['create_event', 'update_event'],
      },
    },

    // Is Online Meeting
    {
      id: 'isOnlineMeeting',
      title: 'Create Online Meeting',
      type: 'dropdown',
      options: [
        { label: 'No', id: 'false' },
        { label: 'Yes', id: 'true' },
      ],
      value: () => 'false',
      condition: {
        field: 'operation',
        value: ['create_event', 'update_event'],
      },
    },

    // Online Meeting Provider
    {
      id: 'onlineMeetingProvider',
      title: 'Online Meeting Provider',
      type: 'dropdown',
      options: [
        { label: 'Teams for Business', id: 'teamsForBusiness' },
        { label: 'Skype for Business', id: 'skypeForBusiness' },
        { label: 'Skype for Consumer', id: 'skypeForConsumer' },
      ],
      value: () => 'teamsForBusiness',
      condition: {
        field: 'operation',
        value: ['create_event', 'update_event'],
      },
    },

    // Show As
    {
      id: 'showAs',
      title: 'Show As',
      type: 'dropdown',
      options: [
        { label: 'Free', id: 'free' },
        { label: 'Tentative', id: 'tentative' },
        { label: 'Busy', id: 'busy' },
        { label: 'Out of Office', id: 'oof' },
        { label: 'Working Elsewhere', id: 'workingElsewhere' },
        { label: 'Unknown', id: 'unknown' },
      ],
      value: () => 'busy',
      condition: {
        field: 'operation',
        value: ['create_event', 'update_event'],
      },
    },

    // Importance
    {
      id: 'importance',
      title: 'Importance',
      type: 'dropdown',
      options: [
        { label: 'Low', id: 'low' },
        { label: 'Normal', id: 'normal' },
        { label: 'High', id: 'high' },
      ],
      value: () => 'normal',
      condition: {
        field: 'operation',
        value: ['create_event', 'update_event'],
      },
    },

    // Sensitivity
    {
      id: 'sensitivity',
      title: 'Sensitivity',
      type: 'dropdown',
      options: [
        { label: 'Normal', id: 'normal' },
        { label: 'Personal', id: 'personal' },
        { label: 'Private', id: 'private' },
        { label: 'Confidential', id: 'confidential' },
      ],
      value: () => 'normal',
      condition: {
        field: 'operation',
        value: ['create_event', 'update_event'],
      },
    },

    // Is Reminder On
    {
      id: 'isReminderOn',
      title: 'Enable Reminder',
      type: 'dropdown',
      options: [
        { label: 'Yes', id: 'true' },
        { label: 'No', id: 'false' },
      ],
      value: () => 'true',
      condition: {
        field: 'operation',
        value: ['create_event', 'update_event'],
      },
    },

    // Reminder Minutes
    {
      id: 'reminderMinutesBeforeStart',
      title: 'Reminder (minutes before)',
      type: 'short-input',
      placeholder: 'e.g., 15, 30, 60',
      condition: {
        field: 'operation',
        value: ['create_event', 'update_event'],
      },
    },

    // Recurrence
    {
      id: 'recurrence',
      title: 'Recurrence Pattern',
      type: 'long-input',
      placeholder:
        'JSON: {"pattern": {"type": "daily", "interval": 1}, "range": {"type": "noEnd", "startDate": "2026-03-10"}}',
      condition: {
        field: 'operation',
        value: ['create_event', 'update_event'],
      },
    },

    // Categories
    {
      id: 'categories',
      title: 'Categories',
      type: 'short-input',
      placeholder: 'JSON array: ["Important", "Work"]',
      condition: {
        field: 'operation',
        value: ['create_event', 'update_event'],
      },
    },

    // Comment (for event responses)
    {
      id: 'comment',
      title: 'Comment',
      type: 'long-input',
      placeholder: 'Optional comment to include with the response',
      condition: {
        field: 'operation',
        value: [
          'accept_event',
          'decline_event',
          'tentatively_accept_event',
          'forward_event',
        ],
      },
    },

    // Send Response
    {
      id: 'sendResponse',
      title: 'Send Response',
      type: 'dropdown',
      options: [
        { label: 'Yes', id: 'true' },
        { label: 'No', id: 'false' },
      ],
      value: () => 'true',
      condition: {
        field: 'operation',
        value: ['accept_event', 'decline_event', 'tentatively_accept_event'],
      },
    },

    // To Recipients (for forward)
    {
      id: 'toRecipients',
      title: 'To Recipients',
      type: 'long-input',
      placeholder:
        'JSON array: [{"emailAddress": {"address": "user@example.com", "name": "User"}}]',
      condition: {
        field: 'operation',
        value: ['forward_event'],
      },
      required: true,
    },

    // Filter
    {
      id: 'filter',
      title: 'Filter',
      type: 'short-input',
      placeholder: 'OData filter (e.g., "showAs eq \'busy\'")',
      condition: {
        field: 'operation',
        value: ['list_calendars', 'list_events'],
      },
    },

    // Order By
    {
      id: 'orderby',
      title: 'Order By',
      type: 'short-input',
      placeholder: 'e.g., name, start/dateTime desc',
      condition: {
        field: 'operation',
        value: ['list_calendars', 'list_events'],
      },
    },

    // Top (limit)
    {
      id: 'top',
      title: 'Limit',
      type: 'short-input',
      placeholder: 'Maximum number of results (e.g., 10, 50, 100)',
      condition: {
        field: 'operation',
        value: ['list_calendars', 'list_events'],
      },
    },

    // Select
    {
      id: 'select',
      title: 'Select Fields',
      type: 'short-input',
      placeholder: 'Comma-separated: id,name,subject,start,end',
      condition: {
        field: 'operation',
        value: ['list_calendars', 'get_calendar', 'list_events', 'get_event'],
      },
    },

    // Expand
    {
      id: 'expand',
      title: 'Expand',
      type: 'short-input',
      placeholder: 'Related resources (e.g., attachments)',
      condition: {
        field: 'operation',
        value: ['list_events', 'get_event'],
      },
    },
  ],
  tools: {
    access: [
      'microsoft_calendar_list_calendars',
      'microsoft_calendar_get_calendar',
      'microsoft_calendar_create_calendar',
      'microsoft_calendar_update_calendar',
      'microsoft_calendar_delete_calendar',
      'microsoft_calendar_list_events',
      'microsoft_calendar_get_event',
      'microsoft_calendar_create_event',
      'microsoft_calendar_update_event',
      'microsoft_calendar_delete_event',
      'microsoft_calendar_accept_event',
      'microsoft_calendar_decline_event',
      'microsoft_calendar_tentatively_accept_event',
      'microsoft_calendar_forward_event',
    ],
    config: {
      tool: (params) => `microsoft_calendar_${params.operation}`,
      params: (params) => {
        const baseParams: any = {
          accessToken: params.accessToken,
        }

        // Add operation-specific parameters
        if (params.calendarId) {
          baseParams.calendarId = params.calendarId
        }

        if (params.eventId) {
          baseParams.eventId = params.eventId
        }

        if (params.name) {
          baseParams.name = params.name
        }

        if (params.color) {
          baseParams.color = params.color
        }

        if (params.subject) {
          baseParams.subject = params.subject
        }

        if (params.body) {
          baseParams.body = params.body
        }

        if (params.bodyType) {
          baseParams.bodyType = params.bodyType
        }

        if (params.startDateTime) {
          baseParams.startDateTime = params.startDateTime
        }

        if (params.startTimeZone) {
          baseParams.startTimeZone = params.startTimeZone
        }

        if (params.endDateTime) {
          baseParams.endDateTime = params.endDateTime
        }

        if (params.endTimeZone) {
          baseParams.endTimeZone = params.endTimeZone
        }

        if (params.location) {
          baseParams.location = params.location
        }

        if (params.attendees) {
          baseParams.attendees = params.attendees
        }

        if (params.isAllDay) {
          baseParams.isAllDay = params.isAllDay === 'true'
        }

        if (params.isOnlineMeeting) {
          baseParams.isOnlineMeeting = params.isOnlineMeeting === 'true'
        }

        if (params.onlineMeetingProvider) {
          baseParams.onlineMeetingProvider = params.onlineMeetingProvider
        }

        if (params.showAs) {
          baseParams.showAs = params.showAs
        }

        if (params.importance) {
          baseParams.importance = params.importance
        }

        if (params.sensitivity) {
          baseParams.sensitivity = params.sensitivity
        }

        if (params.isReminderOn) {
          baseParams.isReminderOn = params.isReminderOn === 'true'
        }

        if (params.reminderMinutesBeforeStart) {
          baseParams.reminderMinutesBeforeStart = Number(params.reminderMinutesBeforeStart)
        }

        if (params.recurrence) {
          baseParams.recurrence = params.recurrence
        }

        if (params.categories) {
          baseParams.categories = params.categories
        }

        if (params.comment) {
          baseParams.comment = params.comment
        }

        if (params.sendResponse) {
          baseParams.sendResponse = params.sendResponse === 'true'
        }

        if (params.toRecipients) {
          baseParams.toRecipients = params.toRecipients
        }

        if (params.filter) {
          baseParams.filter = params.filter
        }

        if (params.orderby) {
          baseParams.orderby = params.orderby
        }

        if (params.top) {
          baseParams.top = Number(params.top)
        }

        if (params.select) {
          baseParams.select = params.select
        }

        if (params.expand) {
          baseParams.expand = params.expand
        }

        return baseParams
      },
    },
  },
  inputs: {},
  outputs: {
    data: {
      type: 'json',
      description: 'The response data from the Microsoft Calendar API',
    },
  },
}
