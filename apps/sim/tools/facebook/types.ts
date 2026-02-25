import type { ToolResponse } from '@/tools/types'

export interface FacebookPostToPageParams {
  accessToken: string
  pageId: string
  message: string
  link?: string
}

export interface FacebookGetPageParams {
  accessToken: string
  pageId: string
}

export interface FacebookGetPostsParams {
  accessToken: string
  pageId: string
  limit?: number
}

export interface FacebookGetCommentsParams {
  accessToken: string
  pageId: string
  postId: string
}

export interface FacebookDeletePostParams {
  accessToken: string
  pageId: string
  postId: string
}

export interface FacebookGetMyPagesParams {
  accessToken: string
}

export type FacebookResponse = ToolResponse & {
  output: {
    id?: string
    name?: string
    followersCount?: number
    fanCount?: number
    message?: string
    posts?: Array<{
      id: string
      message?: string
      created_time: string
    }>
    comments?: Array<{
      id: string
      message: string
      created_time: string
    }>
    pages?: Array<{
      id: string
      name: string
      category?: string
      followersCount?: number
      fanCount?: number
    }>
    success?: boolean
    deleted?: boolean
  }
}
