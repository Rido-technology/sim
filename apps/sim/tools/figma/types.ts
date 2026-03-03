import type { ToolResponse } from '@/tools/types'

export interface FigmaGetFileParams {
  accessToken: string
  fileKey: string
}

export interface FigmaGetFileResponse extends ToolResponse {
  output: {
    file: unknown
  }
}

export interface FigmaListFileCommentsParams {
  accessToken: string
  fileKey: string
  cursor?: string
  as_number?: boolean
}

export interface FigmaListFileCommentsResponse extends ToolResponse {
  output: {
    comments: unknown
    threadCount?: number
    pagination?: {
      cursor?: string
    }
    raw?: unknown
  }
}

export interface FigmaPostCommentParams {
  accessToken: string
  fileKey: string
  message: string
  client_meta?: unknown
}

export interface FigmaPostCommentResponse extends ToolResponse {
  output: {
    comment: unknown
    raw?: unknown
  }
}

export interface FigmaListTeamComponentsParams {
  accessToken: string
  teamId: string
  cursor?: string
}

export interface FigmaListTeamComponentsResponse extends ToolResponse {
  output: {
    components: unknown
    pagination?: {
      cursor?: string
    }
    raw?: unknown
  }
}

export interface FigmaListProjectFilesParams {
  accessToken: string
  projectId: string
}

export interface FigmaListProjectFilesResponse extends ToolResponse {
  output: {
    files: unknown
    raw?: unknown
  }
}

export interface FigmaListTeamProjectsParams {
  accessToken: string
  teamId: string
}

export interface FigmaListTeamProjectsResponse extends ToolResponse {
  output: {
    projects: Array<{
      id: string
      name: string
      description?: string | null
      created_at?: string
      updated_at?: string
      archived?: boolean
    }>
    raw?: unknown
  }
}
