export interface Calendar {
  id: string
  name: string
  color:
    | 'auto'
    | 'lightBlue'
    | 'lightGreen'
    | 'lightOrange'
    | 'lightGray'
    | 'lightYellow'
    | 'lightTeal'
    | 'lightPink'
    | 'lightBrown'
    | 'lightRed'
    | 'maxColor'
  changeKey: string
  canShare: boolean
  canViewPrivateItems: boolean
  canEdit: boolean
  owner: {
    name: string
    address: string
  }
  isDefaultCalendar: boolean
  isRemovable: boolean
}

export interface DateTimeTimeZone {
  dateTime: string
  timeZone: string
}

export interface EmailAddress {
  name: string
  address: string
}

export interface Location {
  displayName: string
  address?: {
    street?: string
    city?: string
    state?: string
    countryOrRegion?: string
    postalCode?: string
  }
  coordinates?: {
    latitude: number
    longitude: number
  }
}

export interface Attendee {
  type: 'required' | 'optional' | 'resource'
  status: {
    response: 'none' | 'organizer' | 'tentativelyAccepted' | 'accepted' | 'declined' | 'notResponded'
    time: string
  }
  emailAddress: EmailAddress
}

export interface RecurrencePattern {
  pattern: {
    type: 'daily' | 'weekly' | 'absoluteMonthly' | 'relativeMonthly' | 'absoluteYearly' | 'relativeYearly'
    interval: number
    month?: number
    dayOfMonth?: number
    daysOfWeek?: string[]
    firstDayOfWeek?: string
    index?: 'first' | 'second' | 'third' | 'fourth' | 'last'
  }
  range: {
    type: 'endDate' | 'noEnd' | 'numbered'
    startDate: string
    endDate?: string
    numberOfOccurrences?: number
  }
}

export interface CalendarEvent {
  id: string
  subject: string
  body: {
    contentType: 'HTML' | 'text'
    content: string
  }
  start: DateTimeTimeZone
  end: DateTimeTimeZone
  location?: Location
  locations?: Location[]
  attendees?: Attendee[]
  organizer?: {
    emailAddress: EmailAddress
  }
  isAllDay?: boolean
  isCancelled?: boolean
  isOrganizer?: boolean
  recurrence?: RecurrencePattern
  responseStatus?: {
    response: 'none' | 'organizer' | 'tentativelyAccepted' | 'accepted' | 'declined' | 'notResponded'
    time: string
  }
  showAs?: 'free' | 'tentative' | 'busy' | 'oof' | 'workingElsewhere' | 'unknown'
  importance?: 'low' | 'normal' | 'high'
  sensitivity?: 'normal' | 'personal' | 'private' | 'confidential'
  isReminderOn?: boolean
  reminderMinutesBeforeStart?: number
  categories?: string[]
  seriesMasterId?: string
  type?: 'singleInstance' | 'occurrence' | 'exception' | 'seriesMaster'
  onlineMeeting?: {
    joinUrl: string
  }
  isOnlineMeeting?: boolean
  onlineMeetingProvider?: 'teamsForBusiness' | 'skypeForBusiness' | 'skypeForConsumer'
  createdDateTime?: string
  lastModifiedDateTime?: string
  webLink?: string
}

export interface Attachment {
  id: string
  '@odata.type': string
  name: string
  contentType?: string
  size?: number
  isInline?: boolean
  lastModifiedDateTime?: string
  contentBytes?: string
}

export interface MicrosoftCalendarToolParams {
  accessToken: string
  calendarId?: string
  eventId?: string
  attachmentId?: string
  name?: string
  color?: string
  subject?: string
  body?: string
  bodyType?: 'HTML' | 'text'
  startDateTime?: string
  startTimeZone?: string
  endDateTime?: string
  endTimeZone?: string
  location?: string
  attendees?: string
  isAllDay?: boolean
  isOnlineMeeting?: boolean
  onlineMeetingProvider?: 'teamsForBusiness' | 'skypeForBusiness' | 'skypeForConsumer'
  showAs?: 'free' | 'tentative' | 'busy' | 'oof' | 'workingElsewhere' | 'unknown'
  importance?: 'low' | 'normal' | 'high'
  sensitivity?: 'normal' | 'personal' | 'private' | 'confidential'
  isReminderOn?: boolean
  reminderMinutesBeforeStart?: number
  recurrence?: string
  categories?: string
  filter?: string
  orderby?: string
  top?: number
  select?: string
  expand?: string
  comment?: string
  sendResponse?: boolean
  toRecipients?: string
  fileName?: string
  fileContent?: string
}

/**
 * Response Types
 * These interfaces define the response structure for Microsoft Calendar tool operations.
 */

export interface MicrosoftCalendarListCalendarsResponse {
  success: boolean
  output?: {
    data: {
      calendars: Calendar[]
      nextLink?: string
    }
  }
  error?: string
}

export interface MicrosoftCalendarGetCalendarResponse {
  success: boolean
  output?: {
    data: {
      calendar: Calendar
    }
  }
  error?: string
}

export interface MicrosoftCalendarCreateCalendarResponse {
  success: boolean
  output?: {
    data: {
      calendar: Calendar
    }
  }
  error?: string
}

export interface MicrosoftCalendarUpdateCalendarResponse {
  success: boolean
  output?: {
    data: {
      calendar: Calendar
    }
  }
  error?: string
}

export interface MicrosoftCalendarDeleteCalendarResponse {
  success: boolean
  output?: {
    data: {
      success: boolean
      message: string
    }
  }
  error?: string
}

export interface MicrosoftCalendarListEventsResponse {
  success: boolean
  output?: {
    data: {
      events: CalendarEvent[]
      nextLink?: string
    }
  }
  error?: string
}

export interface MicrosoftCalendarGetEventResponse {
  success: boolean
  output?: {
    data: {
      event: CalendarEvent
    }
  }
  error?: string
}

export interface MicrosoftCalendarCreateEventResponse {
  success: boolean
  output?: {
    data: {
      event: CalendarEvent
    }
  }
  error?: string
}

export interface MicrosoftCalendarUpdateEventResponse {
  success: boolean
  output?: {
    data: {
      event: CalendarEvent
    }
  }
  error?: string
}

export interface MicrosoftCalendarDeleteEventResponse {
  success: boolean
  output?: {
    data: {
      success: boolean
      message: string
    }
  }
  error?: string
}

export interface MicrosoftCalendarAcceptEventResponse {
  success: boolean
  output?: {
    data: {
      success: boolean
      message: string
    }
  }
  error?: string
}

export interface MicrosoftCalendarDeclineEventResponse {
  success: boolean
  output?: {
    data: {
      success: boolean
      message: string
    }
  }
  error?: string
}

export interface MicrosoftCalendarTentativelyAcceptEventResponse {
  success: boolean
  output?: {
    data: {
      success: boolean
      message: string
    }
  }
  error?: string
}

export interface MicrosoftCalendarForwardEventResponse {
  success: boolean
  output?: {
    data: {
      success: boolean
      message: string
    }
  }
  error?: string
}

export interface MicrosoftCalendarListAttachmentsResponse {
  success: boolean
  output?: {
    data: {
      attachments: Attachment[]
    }
  }
  error?: string
}

export interface MicrosoftCalendarGetAttachmentResponse {
  success: boolean
  output?: {
    data: {
      attachment: Attachment
    }
  }
  error?: string
}

export interface MicrosoftCalendarAddAttachmentResponse {
  success: boolean
  output?: {
    data: {
      attachment: Attachment
    }
  }
  error?: string
}

export interface MicrosoftCalendarDeleteAttachmentResponse {
  success: boolean
  output?: {
    data: {
      success: boolean
      message: string
    }
  }
  error?: string
}
