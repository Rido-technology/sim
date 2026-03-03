import type { ToolResponse } from '@/tools/types'

/**
 * ClickUp Workspace/Team
 */
export interface ClickUpWorkspace {
  id: string
  name: string
  color?: string
  avatar?: string
  members: Array<{
    user: {
      id: number
      username: string
      email: string
      color: string
      profilePicture?: string
    }
  }>
}

export interface ClickUpGetWorkspaceParams {
  accessToken: string
  teamId?: string
}

export interface ClickUpGetWorkspaceResponse extends ToolResponse {
  output: {
    ts: string
    teams: ClickUpWorkspace[]
  }
}

/**
 * ClickUp Space
 */
export interface ClickUpSpace {
  id: string
  name: string
  private: boolean
  statuses: Array<{
    id: string
    status: string
    type: string
    orderindex: number
    color: string
  }>
  multiple_assignees: boolean
  features: {
    due_dates: {
      enabled: boolean
      start_date: boolean
      remap_due_dates: boolean
      remap_closed_due_date: boolean
    }
    time_tracking: {
      enabled: boolean
    }
    tags: {
      enabled: boolean
    }
    time_estimates: {
      enabled: boolean
    }
    checklists: {
      enabled: boolean
    }
    custom_fields: {
      enabled: boolean
    }
    remap_dependencies: {
      enabled: boolean
    }
    dependency_warning: {
      enabled: boolean
    }
    portfolios: {
      enabled: boolean
    }
  }
  archived: boolean
}

export interface ClickUpListSpacesParams {
  accessToken: string
  teamId: string
  archived?: boolean
}

export interface ClickUpListSpacesResponse extends ToolResponse {
  output: {
    ts: string
    spaces: ClickUpSpace[]
  }
}

/**
 * ClickUp List
 */
export interface ClickUpList {
  id: string
  name: string
  orderindex: number
  status?: {
    status: string
    color: string
    hide_label: boolean
  }
  priority?: {
    priority: string
    color: string
  }
  assignee?: {
    id: number
    username: string
    color: string
    email: string
    profilePicture?: string
  }
  task_count?: number
  due_date?: string
  start_date?: string
  folder?: {
    id: string
    name: string
    hidden: boolean
    access: boolean
  }
  space: {
    id: string
    name: string
    access: boolean
  }
  archived: boolean
  override_statuses?: boolean
  statuses?: Array<{
    id: string
    status: string
    orderindex: number
    color: string
    type: string
  }>
  permission_level: string
}

export interface ClickUpListListsParams {
  accessToken: string
  spaceId: string
  archived?: boolean
}

export interface ClickUpListListsResponse extends ToolResponse {
  output: {
    ts: string
    lists: ClickUpList[]
  }
}

/**
 * ClickUp Task
 */
export interface ClickUpTask {
  id: string
  custom_id?: string
  name: string
  text_content?: string
  description?: string
  status: {
    status: string
    color: string
    orderindex: number
    type: string
  }
  orderindex: string
  date_created: string
  date_updated: string
  date_closed?: string
  archived: boolean
  creator: {
    id: number
    username: string
    color: string
    email: string
    profilePicture?: string
  }
  assignees: Array<{
    id: number
    username: string
    color: string
    email: string
    profilePicture?: string
  }>
  watchers: Array<{
    id: number
    username: string
    color: string
    email: string
    profilePicture?: string
  }>
  checklists: Array<{
    id: string
    task_id: string
    name: string
    orderindex: number
    resolved: number
    unresolved: number
  }>
  tags: Array<{
    name: string
    tag_fg: string
    tag_bg: string
  }>
  parent?: string
  priority?: {
    id: string
    priority: string
    color: string
    orderindex: string
  }
  due_date?: string
  start_date?: string
  points?: number
  time_estimate?: number
  time_spent?: number
  custom_fields: Array<{
    id: string
    name: string
    type: string
    type_config: Record<string, unknown>
    date_created: string
    hide_from_guests: boolean
    value?: unknown
    required: boolean
  }>
  dependencies: Array<unknown>
  linked_tasks: Array<unknown>
  team_id: string
  url: string
  permission_level: string
  list: {
    id: string
    name: string
    access: boolean
  }
  project: {
    id: string
    name: string
    hidden: boolean
    access: boolean
  }
  folder: {
    id: string
    name: string
    hidden: boolean
    access: boolean
  }
  space: {
    id: string
  }
}

export interface ClickUpGetTaskParams {
  accessToken: string
  taskId: string
  custom_task_ids?: boolean
  team_id?: string
  include_subtasks?: boolean
}

export interface ClickUpGetTaskResponse extends ToolResponse {
  output: {
    ts: string
    task: ClickUpTask
  }
}

export interface ClickUpListTasksParams {
  accessToken: string
  listId: string
  archived?: boolean
  page?: number
  order_by?: string
  reverse?: boolean
  subtasks?: boolean
  statuses?: string[]
  include_closed?: boolean
  assignees?: string[]
  tags?: string[]
  due_date_gt?: number
  due_date_lt?: number
  date_created_gt?: number
  date_created_lt?: number
  date_updated_gt?: number
  date_updated_lt?: number
}

export interface ClickUpListTasksResponse extends ToolResponse {
  output: {
    ts: string
    tasks: ClickUpTask[]
    last_page?: boolean
  }
}

export interface ClickUpCreateTaskParams {
  accessToken: string
  listId: string
  name: string
  description?: string
  assignees?: number[]
  tags?: string[]
  status?: string
  priority?: number
  due_date?: number
  due_date_time?: boolean
  time_estimate?: number
  start_date?: number
  start_date_time?: boolean
  notify_all?: boolean
  parent?: string
  links_to?: string
  check_required_custom_fields?: boolean
  custom_fields?: Array<{
    id: string
    value: unknown
  }>
}

export interface ClickUpCreateTaskResponse extends ToolResponse {
  output: {
    ts: string
    task: ClickUpTask
  }
}

export interface ClickUpUpdateTaskParams {
  accessToken: string
  taskId: string
  name?: string
  description?: string
  status?: string
  priority?: number
  due_date?: number
  due_date_time?: boolean
  time_estimate?: number
  start_date?: number
  start_date_time?: boolean
  assignees?: {
    add?: number[]
    rem?: number[]
  }
  archived?: boolean
}

export interface ClickUpUpdateTaskResponse extends ToolResponse {
  output: {
    ts: string
    task: ClickUpTask
  }
}

export interface ClickUpComment {
  id: string
  comment: Array<{
    text: string
  }>
  comment_text: string
  user: {
    id: number
    username: string
    email: string
    color: string
    profilePicture?: string
  }
  resolved: boolean
  assignee?: {
    id: number
    username: string
    email: string
    color: string
    profilePicture?: string
  }
  assigned_by?: {
    id: number
    username: string
    email: string
    color: string
    profilePicture?: string
  }
  reactions: Array<unknown>
  date: string
}

export interface ClickUpAddCommentParams {
  accessToken: string
  taskId: string
  comment_text: string
  assignee?: number
  notify_all?: boolean
}

export interface ClickUpAddCommentResponse extends ToolResponse {
  output: {
    ts: string
    comment: ClickUpComment
  }
}

export type ClickUpResponse =
  | ClickUpGetWorkspaceResponse
  | ClickUpListSpacesResponse
  | ClickUpListListsResponse
  | ClickUpGetTaskResponse
  | ClickUpListTasksResponse
  | ClickUpCreateTaskResponse
  | ClickUpUpdateTaskResponse
  | ClickUpAddCommentResponse
