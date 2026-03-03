import type { ClickUpGetTaskParams, ClickUpGetTaskResponse } from '@/tools/clickup/types'
import type { ToolConfig } from '@/tools/types'

export const clickupGetTaskTool: ToolConfig<ClickUpGetTaskParams, ClickUpGetTaskResponse> = {
  id: 'clickup_get_task',
  name: 'ClickUp Get Task',
  description: 'Get details of a specific ClickUp task',
  version: '1.0.0',

  oauth: {
    required: true,
    provider: 'clickup',
  },

  params: {
    accessToken: {
      type: 'string',
      required: true,
      visibility: 'hidden',
      description: 'OAuth access token for ClickUp',
    },
    taskId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Task ID to retrieve',
    },
    custom_task_ids: {
      type: 'boolean',
      required: false,
      visibility: 'user-or-llm',
      description: 'If true, taskId is treated as custom task ID',
    },
    team_id: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Required when using custom_task_ids',
    },
    include_subtasks: {
      type: 'boolean',
      required: false,
      visibility: 'user-or-llm',
      description: 'Include subtasks in response',
    },
  },

  request: {
    url: '/api/tools/clickup/get-task',
    method: 'POST',
    headers: () => ({
      'Content-Type': 'application/json',
    }),
    body: (params) => ({
      accessToken: params.accessToken,
      taskId: params.taskId,
      custom_task_ids: params.custom_task_ids,
      team_id: params.team_id,
      include_subtasks: params.include_subtasks,
    }),
  },

  transformResponse: async (response: Response) => {
    const data = await response.json()
    return {
      success: data.success ?? true,
      output: data.output ?? data,
      error: data.error,
    }
  },

  outputs: {
    success: { type: 'boolean', description: 'Operation success status' },
    ts: { type: 'string', description: 'Timestamp of the response' },
    task: {
      type: 'object',
      description: 'Task details',
    },
  },
}
