export interface TaskList {
  id: string
  displayName: string
  isOwner: boolean
  isShared: boolean
  wellknownListName?: 'none' | 'defaultList' | 'flaggedEmails' | 'unknownFutureValue'
}

export interface DateTimeTimeZone {
  dateTime: string
  timeZone: string
}

export interface ItemBody {
  content: string
  contentType: 'text' | 'html'
}

export interface ChecklistItem {
  id: string
  displayName: string
  isChecked: boolean
  checkedDateTime?: string
  createdDateTime?: string
}

export interface LinkedResource {
  id: string
  webUrl: string
  applicationName: string
  displayName: string
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

export interface TodoTask {
  id: string
  title: string
  body?: ItemBody
  importance?: 'low' | 'normal' | 'high'
  status?: 'notStarted' | 'inProgress' | 'completed' | 'waitingOnOthers' | 'deferred'
  createdDateTime?: string
  lastModifiedDateTime?: string
  hasAttachments?: boolean
  categories?: string[]
  isReminderOn?: boolean
  reminderDateTime?: DateTimeTimeZone
  dueDateTime?: DateTimeTimeZone
  completedDateTime?: DateTimeTimeZone
  startDateTime?: DateTimeTimeZone
  recurrence?: RecurrencePattern
  linkedResources?: LinkedResource[]
  checklistItems?: ChecklistItem[]
}

export interface MicrosoftTodoToolParams {
  accessToken?: string
  listId?: string
  taskId?: string
  checklistItemId?: string
  attachmentId?: string
  displayName?: string
  title?: string
  body?: string
  bodyType?: 'text' | 'html'
  importance?: 'low' | 'normal' | 'high'
  status?: 'notStarted' | 'inProgress' | 'completed' | 'waitingOnOthers' | 'deferred'
  categories?: string
  isReminderOn?: boolean
  reminderDateTime?: string
  reminderTimeZone?: string
  dueDateTime?: string
  dueTimeZone?: string
  startDateTime?: string
  startTimeZone?: string
  recurrence?: string
  isChecked?: boolean
  attachmentType?: 'file' | 'link'
  webUrl?: string
  applicationName?: string
  fileName?: string
  fileContent?: string
  select?: string
  filter?: string
  orderby?: string
  top?: number
}

/**
 * Response Types
 * These interfaces define the response structure for Microsoft To Do tool operations.
 */

export interface MicrosoftTodoListTaskListsResponse {
  success: boolean
  output?: {
    data: {
      taskLists: TaskList[]
      nextLink?: string
    }
  }
  error?: string
}

export interface MicrosoftTodoGetTaskListResponse {
  success: boolean
  output?: {
    data: {
      taskList: TaskList
    }
  }
  error?: string
}

export interface MicrosoftTodoCreateTaskListResponse {
  success: boolean
  output?: {
    data: {
      taskList: TaskList
    }
  }
  error?: string
}

export interface MicrosoftTodoUpdateTaskListResponse {
  success: boolean
  output?: {
    data: {
      taskList: TaskList
    }
  }
  error?: string
}

export interface MicrosoftTodoDeleteTaskListResponse {
  success: boolean
  output?: {
    data: {
      success: boolean
      message: string
    }
  }
  error?: string
}

export interface MicrosoftTodoListTasksResponse {
  success: boolean
  output?: {
    data: {
      tasks: TodoTask[]
      nextLink?: string
    }
  }
  error?: string
}

export interface MicrosoftTodoGetTaskResponse {
  success: boolean
  output?: {
    data: {
      task: TodoTask
    }
  }
  error?: string
}

export interface MicrosoftTodoCreateTaskResponse {
  success: boolean
  output?: {
    data: {
      task: TodoTask
    }
  }
  error?: string
}

export interface MicrosoftTodoUpdateTaskResponse {
  success: boolean
  output?: {
    data: {
      task: TodoTask
    }
  }
  error?: string
}

export interface MicrosoftTodoDeleteTaskResponse {
  success: boolean
  output?: {
    data: {
      success: boolean
      message: string
    }
  }
  error?: string
}

export interface MicrosoftTodoCompleteTaskResponse {
  success: boolean
  output?: {
    data: {
      task: TodoTask
    }
  }
  error?: string
}

export interface MicrosoftTodoReopenTaskResponse {
  success: boolean
  output?: {
    data: {
      task: TodoTask
    }
  }
  error?: string
}

export interface MicrosoftTodoListChecklistItemsResponse {
  success: boolean
  output?: {
    data: {
      checklistItems: ChecklistItem[]
    }
  }
  error?: string
}

export interface MicrosoftTodoCreateChecklistItemResponse {
  success: boolean
  output?: {
    data: {
      checklistItem: ChecklistItem
    }
  }
  error?: string
}

export interface MicrosoftTodoUpdateChecklistItemResponse {
  success: boolean
  output?: {
    data: {
      checklistItem: ChecklistItem
    }
  }
  error?: string
}

export interface MicrosoftTodoDeleteChecklistItemResponse {
  success: boolean
  output?: {
    data: {
      success: boolean
      message: string
    }
  }
  error?: string
}

export interface MicrosoftTodoListAttachmentsResponse {
  success: boolean
  output?: {
    data: {
      attachments: LinkedResource[]
    }
  }
  error?: string
}

export interface MicrosoftTodoGetAttachmentResponse {
  success: boolean
  output?: {
    data: {
      attachment: LinkedResource
    }
  }
  error?: string
}

export interface MicrosoftTodoAddAttachmentResponse {
  success: boolean
  output?: {
    data: {
      attachment: LinkedResource
    }
  }
  error?: string
}

export interface MicrosoftTodoDeleteAttachmentResponse {
  success: boolean
  output?: {
    data: {
      success: boolean
      message: string
    }
  }
  error?: string
}
