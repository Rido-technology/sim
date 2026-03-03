import type { Logger } from '@sim/logger'
import { secureFetchWithValidation } from '@/lib/core/security/input-validation.server'

const CLICKUP_API_BASE = 'https://api.clickup.com/api/v2'

/**
 * Makes an authenticated request to the ClickUp API
 */
async function clickupApiRequest(
  endpoint: string,
  accessToken: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any,
  requestId?: string,
  logger?: Logger
): Promise<any> {
  const url = `${CLICKUP_API_BASE}${endpoint}`

  logger?.info(`[${requestId}] Making ClickUp API request: ${method} ${endpoint}`)

  const response = await secureFetchWithValidation(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: accessToken,
    },
    ...(body && { body: JSON.stringify(body) }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    let errorMessage: string

    try {
      const errorData = JSON.parse(errorText)
      errorMessage = errorData.err || errorData.error || errorText
    } catch {
      errorMessage = errorText
    }

    logger?.error(`[${requestId}] ClickUp API error:`, errorMessage)
    throw new Error(errorMessage)
  }

  return response.json()
}

/**
 * Get workspace (team) information
 */
export async function getClickUpWorkspace(
  accessToken: string,
  workspaceId: string,
  requestId: string,
  logger: Logger
): Promise<{ success: boolean; output?: any; error?: string }> {
  try {
    const data = await clickupApiRequest(`/team/${workspaceId}`, accessToken, 'GET', undefined, requestId, logger)

    return {
      success: true,
      output: {
        workspace: data.team,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get workspace',
    }
  }
}

/**
 * List spaces in a workspace
 */
export async function listClickUpSpaces(
  accessToken: string,
  workspaceId: string,
  archived?: boolean,
  requestId?: string,
  logger?: Logger
): Promise<{ success: boolean; output?: any; error?: string }> {
  try {
    const params = archived !== undefined ? `?archived=${archived}` : ''
    const data = await clickupApiRequest(
      `/team/${workspaceId}/space${params}`,
      accessToken,
      'GET',
      undefined,
      requestId,
      logger
    )

    return {
      success: true,
      output: {
        spaces: data.spaces,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list spaces',
    }
  }
}

/**
 * List lists in a space or folder
 */
export async function listClickUpLists(
  accessToken: string,
  params: {
    spaceId?: string
    folderId?: string
    archived?: boolean
  },
  requestId?: string,
  logger?: Logger
): Promise<{ success: boolean; output?: any; error?: string }> {
  try {
    let endpoint: string

    if (params.folderId) {
      endpoint = `/folder/${params.folderId}/list`
    } else if (params.spaceId) {
      endpoint = `/space/${params.spaceId}/list`
    } else {
      throw new Error('Either spaceId or folderId is required')
    }

    const queryParams = params.archived !== undefined ? `?archived=${params.archived}` : ''
    const data = await clickupApiRequest(
      `${endpoint}${queryParams}`,
      accessToken,
      'GET',
      undefined,
      requestId,
      logger
    )

    return {
      success: true,
      output: {
        lists: data.lists,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list lists',
    }
  }
}

/**
 * Get a specific task
 */
export async function getClickUpTask(
  accessToken: string,
  taskId: string,
  includeSubtasks?: boolean,
  requestId?: string,
  logger?: Logger
): Promise<{ success: boolean; output?: any; error?: string }> {
  try {
    const params = includeSubtasks ? '?include_subtasks=true' : ''
    const data = await clickupApiRequest(`/task/${taskId}${params}`, accessToken, 'GET', undefined, requestId, logger)

    return {
      success: true,
      output: {
        task: data,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get task',
    }
  }
}

/**
 * List tasks in a list
 */
export async function listClickUpTasks(
  accessToken: string,
  listId: string,
  params?: {
    archived?: boolean
    page?: number
    orderBy?: string
    reverse?: boolean
    subtasks?: boolean
    statuses?: string[]
    includeClosed?: boolean
    assignees?: string[]
    tags?: string[]
    dueDateGt?: number
    dueDateLt?: number
    dateCreatedGt?: number
    dateCreatedLt?: number
    dateUpdatedGt?: number
    dateUpdatedLt?: number
  },
  requestId?: string,
  logger?: Logger
): Promise<{ success: boolean; output?: any; error?: string }> {
  try {
    const queryParams = new URLSearchParams()

    if (params?.archived !== undefined) queryParams.set('archived', String(params.archived))
    if (params?.page !== undefined) queryParams.set('page', String(params.page))
    if (params?.orderBy) queryParams.set('order_by', params.orderBy)
    if (params?.reverse !== undefined) queryParams.set('reverse', String(params.reverse))
    if (params?.subtasks !== undefined) queryParams.set('subtasks', String(params.subtasks))
    if (params?.includeClosed !== undefined) queryParams.set('include_closed', String(params.includeClosed))
    if (params?.statuses?.length) {
      for (const status of params.statuses) {
        queryParams.append('statuses[]', status)
      }
    }
    if (params?.assignees?.length) {
      for (const assignee of params.assignees) {
        queryParams.append('assignees[]', assignee)
      }
    }
    if (params?.tags?.length) {
      for (const tag of params.tags) {
        queryParams.append('tags[]', tag)
      }
    }
    if (params?.dueDateGt !== undefined) queryParams.set('due_date_gt', String(params.dueDateGt))
    if (params?.dueDateLt !== undefined) queryParams.set('due_date_lt', String(params.dueDateLt))
    if (params?.dateCreatedGt !== undefined) queryParams.set('date_created_gt', String(params.dateCreatedGt))
    if (params?.dateCreatedLt !== undefined) queryParams.set('date_created_lt', String(params.dateCreatedLt))
    if (params?.dateUpdatedGt !== undefined) queryParams.set('date_updated_gt', String(params.dateUpdatedGt))
    if (params?.dateUpdatedLt !== undefined) queryParams.set('date_updated_lt', String(params.dateUpdatedLt))

    const queryString = queryParams.toString()
    const endpoint = `/list/${listId}/task${queryString ? `?${queryString}` : ''}`

    const data = await clickupApiRequest(endpoint, accessToken, 'GET', undefined, requestId, logger)

    return {
      success: true,
      output: {
        tasks: data.tasks,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list tasks',
    }
  }
}

/**
 * Create a new task
 */
export async function createClickUpTask(
  accessToken: string,
  params: {
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
    custom_fields?: Array<{ id: string; value: any }>
  },
  requestId?: string,
  logger?: Logger
): Promise<{ success: boolean; output?: any; error?: string }> {
  try {
    const body: any = {
      name: params.name,
    }

    if (params.description) body.description = params.description
    if (params.assignees) body.assignees = params.assignees
    if (params.tags) body.tags = params.tags
    if (params.status) body.status = params.status
    if (params.priority !== undefined) body.priority = params.priority
    if (params.due_date !== undefined) body.due_date = params.due_date
    if (params.due_date_time !== undefined) body.due_date_time = params.due_date_time
    if (params.time_estimate !== undefined) body.time_estimate = params.time_estimate
    if (params.start_date !== undefined) body.start_date = params.start_date
    if (params.start_date_time !== undefined) body.start_date_time = params.start_date_time
    if (params.notify_all !== undefined) body.notify_all = params.notify_all
    if (params.parent) body.parent = params.parent
    if (params.links_to) body.links_to = params.links_to
    if (params.check_required_custom_fields !== undefined)
      body.check_required_custom_fields = params.check_required_custom_fields
    if (params.custom_fields) body.custom_fields = params.custom_fields

    const data = await clickupApiRequest(`/list/${params.listId}/task`, accessToken, 'POST', body, requestId, logger)

    return {
      success: true,
      output: {
        task: data,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create task',
    }
  }
}

/**
 * Update an existing task
 */
export async function updateClickUpTask(
  accessToken: string,
  params: {
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
  },
  requestId?: string,
  logger?: Logger
): Promise<{ success: boolean; output?: any; error?: string }> {
  try {
    const body: any = {}

    if (params.name) body.name = params.name
    if (params.description) body.description = params.description
    if (params.status) body.status = params.status
    if (params.priority !== undefined) body.priority = params.priority
    if (params.due_date !== undefined) body.due_date = params.due_date
    if (params.due_date_time !== undefined) body.due_date_time = params.due_date_time
    if (params.time_estimate !== undefined) body.time_estimate = params.time_estimate
    if (params.start_date !== undefined) body.start_date = params.start_date
    if (params.start_date_time !== undefined) body.start_date_time = params.start_date_time
    if (params.assignees) body.assignees = params.assignees
    if (params.archived !== undefined) body.archived = params.archived

    const data = await clickupApiRequest(`/task/${params.taskId}`, accessToken, 'PUT', body, requestId, logger)

    return {
      success: true,
      output: {
        task: data,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update task',
    }
  }
}

/**
 * Add a comment to a task
 */
export async function addClickUpComment(
  accessToken: string,
  params: {
    taskId: string
    commentText: string
    assignee?: number
    notifyAll?: boolean
  },
  requestId?: string,
  logger?: Logger
): Promise<{ success: boolean; output?: any; error?: string }> {
  try {
    const body: any = {
      comment_text: params.commentText,
    }

    if (params.assignee !== undefined) body.assignee = params.assignee
    if (params.notifyAll !== undefined) body.notify_all = params.notifyAll

    const data = await clickupApiRequest(`/task/${params.taskId}/comment`, accessToken, 'POST', body, requestId, logger)

    return {
      success: true,
      output: {
        comment: data,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add comment',
    }
  }
}
