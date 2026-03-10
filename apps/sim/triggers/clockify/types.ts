import type { TriggerOutput } from '@/triggers/types'

// ─── Clockify Webhook Event Types ─────────────────────────────────────────────

export interface ClockifyWebhookEvent {
  eventType: 
    | 'TIME_ENTRY_CREATED' 
    | 'TIME_ENTRY_UPDATED' 
    | 'TIME_ENTRY_DELETED'
    | 'PROJECT_CREATED' 
    | 'PROJECT_UPDATED' 
    | 'PROJECT_DELETED'
    | 'TASK_CREATED' 
    | 'TASK_UPDATED'
    | 'TASK_DELETED'
    | 'USER_JOINED_WORKSPACE'
    | 'USER_LEFT_WORKSPACE'
  workspaceId: string
  userId: string
  data: ClockifyEventData
  timestamp: string
}

export interface ClockifyEventData {
  id: string
  name?: string
  description?: string
  projectId?: string
  taskId?: string
  workspaceId: string
  userId?: string
  timeInterval?: {
    start: string
    end: string | null
    duration: string | null
  }
  billable?: boolean
  hourlyRate?: {
    amount: number
    currency: string
  }
  tags?: Array<{
    id: string
    name: string
  }>
}

export interface ClockifyTimeEntryEvent extends ClockifyEventData {
  timeInterval: {
    start: string
    end: string | null
    duration: string | null
  }
  projectId?: string
  taskId?: string
  description?: string
  billable: boolean
  tags: Array<{
    id: string
    name: string
  }>
}

export interface ClockifyProjectEvent extends ClockifyEventData {
  name: string
  clientId?: string
  color: string
  archived: boolean
  billable: boolean
  public: boolean
  template: boolean
}

export interface ClockifyTaskEvent extends ClockifyEventData {
  name: string
  projectId: string
  status: 'ACTIVE' | 'DONE'
  estimate?: string
  assigneeIds: string[]
  billable: boolean
}

// ─── Trigger Outputs ──────────────────────────────────────────────────────────

export const clockifyWebhookOutputs: Record<string, TriggerOutput> = {
  eventType: {
    type: 'string',
    description: 'Type of Clockify event that triggered the workflow',
  },
  workspaceId: {
    type: 'string', 
    description: 'Clockify workspace ID where the event occurred',
  },
  userId: {
    type: 'string',
    description: 'ID of the user who triggered the event',
  },
  timestamp: {
    type: 'string',
    description: 'ISO 8601 timestamp when the event occurred',
  },
  data: {
    type: 'json',
    description: 'Complete event data from Clockify',
  },
  
  // Conditional outputs based on event type
  timeEntry: {
    type: 'json',
    description: 'Time entry data (available for TIME_ENTRY_* events)',
  },
  project: {
    type: 'json', 
    description: 'Project data (available for PROJECT_* events)',
  },
  task: {
    type: 'json',
    description: 'Task data (available for TASK_* events)',
  },
}