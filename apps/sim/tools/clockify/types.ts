import type { ToolResponse } from '@/tools/types'

// ─── Shared ───────────────────────────────────────────────────────────────────

export interface ClockifyTimeInterval {
  start: string
  end: string | null
  duration: string | null
}

export interface ClockifyTaskRef {
  id: string
  name: string
  projectId: string
  status: string
}

export interface ClockifyTagRef {
  id: string
  name: string
}

// ─── Create Task ──────────────────────────────────────────────────────────────

export interface ClockifyCreateTaskParams {
  apiKey: string
  workspaceId: string
  projectId: string
  name: string
  billable?: boolean
  assigneeIds?: string[]
  estimate?: string
  status?: 'ACTIVE' | 'DONE'
}

export interface ClockifyCreateTaskResponse extends ToolResponse {
  output: {
    task: {
      id: string
      name: string
      projectId: string
      status: string
      estimate: string | null
      assigneeIds: string[]
      billable: boolean
      duration: string
      budgetEstimate: number
      hourlyRate: any
      costRate: any
    }
  }
}

// ─── Create Time Entry ────────────────────────────────────────────────────────

export interface ClockifyCreateTimeEntryParams {
  apiKey: string
  workspaceId: string
  start: string
  end: string
  taskId: string
  description?: string
  projectId?: string
  tagIds?: string[]
}

export interface ClockifyCreateTimeEntryResponse extends ToolResponse {
  output: {
    id: string
    description: string
    timeInterval: ClockifyTimeInterval
    projectId: string | null
    taskId: string | null
    tagIds: string[]
    workspaceId: string
  }
}

// ─── Start Timer ──────────────────────────────────────────────────────────────

export interface ClockifyStartTimerParams {
  apiKey: string
  workspaceId: string
  description?: string
  projectId?: string
  taskId?: string
  tagIds?: string[]
}

export interface ClockifyStartTimerResponse extends ToolResponse {
  output: {
    id: string
    description: string
    timeInterval: ClockifyTimeInterval
    projectId: string | null
    taskId: string | null
    workspaceId: string
  }
}

// ─── Stop Timer ───────────────────────────────────────────────────────────────

export interface ClockifyStopTimerParams {
  apiKey: string
  workspaceId: string
  userId?: string
  end?: string
}

export interface ClockifyStopTimerResponse extends ToolResponse {
  output: {
    id: string
    description: string
    timeInterval: ClockifyTimeInterval
    projectId: string | null
    taskId: string | null
    workspaceId: string
  }
}

// ─── Get Task ─────────────────────────────────────────────────────────────────

export interface ClockifyGetTaskParams {
  apiKey: string
  workspaceId: string
  projectId: string
  taskId?: string
  name?: string
  page?: number
  pageSize?: number
}

export interface ClockifyGetTaskResponse extends ToolResponse {
  output: {
    id?: string
    name?: string
    projectId?: string
    status?: string
    tasks?: ClockifyTaskRef[]
  }
}

// ─── Get Time Entries ─────────────────────────────────────────────────────────

export interface ClockifyGetTimeEntriesParams {
  apiKey: string
  workspaceId: string
  userId?: string
  description?: string
  start?: string
  end?: string
  project?: string
  task?: string
  page?: number
  pageSize?: number
}

export interface ClockifyGetTimeEntriesResponse extends ToolResponse {
  output: {
    timeEntries: Array<{
      id: string
      description: string
      timeInterval: ClockifyTimeInterval
      projectId: string | null
      taskId: string | null
      tagIds: string[]
    }>
  }
}

// ─── Get Current Timer ────────────────────────────────────────────────────────

export interface ClockifyGetCurrentTimerParams {
  apiKey: string
  workspaceId?: string
  userId?: string
}

export interface ClockifyGetCurrentTimerResponse extends ToolResponse {
  output: {
    id: string | null
    description: string | null
    timeInterval: ClockifyTimeInterval | null
    projectId: string | null
    taskId: string | null
    isRunning: boolean
  }
}

// ─── Get Workspaces ───────────────────────────────────────────────────────────

export interface ClockifyGetWorkspacesParams {
  apiKey: string
}

export interface ClockifyGetWorkspacesResponse extends ToolResponse {
  output: {
    workspaces: Array<{
      id: string
      name: string
      hourlyRate: {
        amount: number
        currency: string
      } | null
      memberships: Array<{
        userId: string
        hourlyRate: {
          amount: number
          currency: string
        } | null
        costRate: {
          amount: number
          currency: string
        } | null
        targetId: string
        membershipType: string
        membershipStatus: string
      }>
      workspaceSettings: {
        timeRoundingInReports: boolean
        onlyAdminsSeeBillableRates: boolean
        onlyAdminsCreateProject: boolean
        onlyAdminsSeeDashboard: boolean
        defaultBillableProjects: boolean
        lockTimeEntries: string | null
        round: {
          round: string
          minutes: string
        }
        projectFavorites: boolean
        canSeeTimeSheet: boolean
        canSeeTracker: boolean
        projectPickerSpecialFilter: boolean
        forceProjects: boolean
        forceTasks: boolean
        forceTags: boolean
        forceDescription: boolean
        onlyAdminsSeeAllTimeEntries: boolean
        onlyAdminsSeePublicProjectsEntries: boolean
        trackTimeDownToSecond: boolean
        projectGroupingLabel: string
        adminOnlyPages: string[]
        automaticLock: {
          changeDay: string
          dayOfMonth: number
          firstDay: string
          olderThanPeriod: string
          olderThanValue: number
        } | null
        onlyAdminsCreateTag: boolean
        onlyAdminsCreateTask: boolean
        timeTrackingMode: string
        isProjectPublicByDefault: boolean
      }
      imageUrl: string
      featureSubscriptionType: string | null
    }>
  }
}

// ─── Get Workspace Details ────────────────────────────────────────────────────

export interface ClockifyGetWorkspaceDetailsParams {
  apiKey: string
  workspaceId: string
}

export interface ClockifyGetWorkspaceDetailsResponse extends ToolResponse {
  output: {
    id: string
    name: string
    hourlyRate: {
      amount: number
      currency: string
    } | null
    memberships: Array<{
      userId: string
      hourlyRate: {
        amount: number
        currency: string
      } | null
      costRate: {
        amount: number
        currency: string
      } | null
      targetId: string
      membershipType: string
      membershipStatus: string
    }>
    workspaceSettings: {
      timeRoundingInReports: boolean
      onlyAdminsSeeBillableRates: boolean
      onlyAdminsCreateProject: boolean
      onlyAdminsSeeDashboard: boolean
      defaultBillableProjects: boolean
      lockTimeEntries: string | null
      round: {
        round: string
        minutes: string
      }
      projectFavorites: boolean
      canSeeTimeSheet: boolean
      canSeeTracker: boolean
      projectPickerSpecialFilter: boolean
      forceProjects: boolean
      forceTasks: boolean
      forceTags: boolean
      forceDescription: boolean
      onlyAdminsSeeAllTimeEntries: boolean
      onlyAdminsSeePublicProjectsEntries: boolean
      trackTimeDownToSecond: boolean
      projectGroupingLabel: string
      adminOnlyPages: string[]
      automaticLock: {
        changeDay: string
        dayOfMonth: number
        firstDay: string
        olderThanPeriod: string
        olderThanValue: number
      } | null
      onlyAdminsCreateTag: boolean
      onlyAdminsCreateTask: boolean
      timeTrackingMode: string
      isProjectPublicByDefault: boolean
    }
    imageUrl: string
    featureSubscriptionType: string | null
  }
}

// ─── Get Projects ─────────────────────────────────────────────────────────────

export interface ClockifyGetProjectsParams {
  apiKey: string
  workspaceId: string
  archived?: boolean
  name?: string
  page?: number
  pageSize?: number
}

export interface ClockifyGetProjectsResponse extends ToolResponse {
  output: {
    projects: Array<{
      id: string
      name: string
      hourlyRate: {
        amount: number
        currency: string
      } | null
      clientId: string | null
      workspaceId: string
      billable: boolean
      memberships: Array<{
        userId: string
        hourlyRate: {
          amount: number
          currency: string
        } | null
        costRate: {
          amount: number
          currency: string
        } | null
        membershipType: string
        membershipStatus: string
      }>
      color: string
      estimate: {
        estimate: string
        type: string
      } | null
      archived: boolean
      duration: string | null
      clientName: string | null
      note: string | null
      template: boolean
      public: boolean
    }>
  }
}

// ─── Create Project ───────────────────────────────────────────────────────────

export interface ClockifyCreateProjectParams {
  apiKey: string
  workspaceId: string
  name: string
  clientId?: string
  isPublic?: boolean
  billable?: boolean
  color?: string
  estimate?: {
    estimate: string
    type: 'AUTO' | 'MANUAL'
  }
  hourlyRate?: {
    amount: number
    currency: string
  }
  memberships?: Array<{
    userId: string
    membershipType: 'PROJECT' | 'WORKSPACE'
    membershipStatus: 'ACTIVE' | 'DECLINED' | 'INACTIVE' | 'PENDING'
    hourlyRate?: {
      amount: number
      currency: string
    }
    costRate?: {
      amount: number
      currency: string
    }
  }>
  tasks?: Array<{
    name: string
    assigneeIds?: string[]
    estimate?: string
    status?: 'ACTIVE' | 'DONE'
  }>
  note?: string
}

export interface ClockifyCreateProjectResponse extends ToolResponse {
  output: {
    id: string
    name: string
    hourlyRate: {
      amount: number
      currency: string
    } | null
    clientId: string | null
    workspaceId: string
    billable: boolean
    memberships: Array<{
      userId: string
      hourlyRate: {
        amount: number
        currency: string
      } | null
      costRate: {
        amount: number
        currency: string
      } | null
      membershipType: string
      membershipStatus: string
    }>
    color: string
    estimate: {
      estimate: string
      type: string
    } | null
    archived: boolean
    duration: string | null
    clientName: string | null
    note: string | null
    template: boolean
    public: boolean
  }
}

// ─── Custom API ───────────────────────────────────────────────────────────────

export interface ClockifyCustomApiParams {
  apiKey: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  endpoint: string
  body?: string
}

export interface ClockifyCustomApiResponse extends ToolResponse {
  output: {
    status: number
    data: unknown
  }
}

export interface ClockifyCustomApiResponse extends ToolResponse {
  output: {
    status: number
    data: unknown
  }
}
