import type {
  ClickUpAddCommentParams,
  ClickUpAddCommentResponse,
} from '@/tools/clickup/types'
import type { ToolConfig } from '@/tools/types'

export const clickupAddCommentTool: ToolConfig<
  ClickUpAddCommentParams,
  ClickUpAddCommentResponse
> = {
  id: 'clickup_add_comment',
  name: 'ClickUp Add Comment',
  description: 'Add a comment to a ClickUp task',
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
      description: 'Task ID to add comment to',
    },
    comment_text: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Comment text (supports markdown)',
    },
    assignee: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'User ID to assign the comment to',
    },
    notify_all: {
      type: 'boolean',
      required: false,
      visibility: 'user-or-llm',
      description: 'Notify all task assignees',
    },
  },

  request: {
    url: '/api/tools/clickup/add-comment',
    method: 'POST',
    headers: () => ({
      'Content-Type': 'application/json',
    }),
    body: (params) => ({
      accessToken: params.accessToken,
      taskId: params.taskId,
      comment_text: params.comment_text,
      assignee: params.assignee,
      notify_all: params.notify_all,
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
    comment: {
      type: 'object',
      description: 'Created comment details',
    },
  },
}
