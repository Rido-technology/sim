import type { ToolResponse } from '@/tools/types'

export interface InstagramGetProfileParams {
  accessToken: string
}

export interface InstagramGetMediaParams {
  accessToken: string
  limit?: number
}

export interface InstagramGetPageParams {
  accessToken: string
  pageId?: string
}

export interface InstagramGetMediaByIdParams {
  accessToken: string
  mediaId: string
}

export interface InstagramCreatePostParams {
  accessToken: string
  imageUrl: string
  caption?: string
  altText?: string
}

export interface InstagramCreateCommentParams {
  accessToken: string
  mediaId: string
  message: string
}

export interface InstagramReplyToCommentParams {
  accessToken: string
  commentId: string
  message: string
}

export interface InstagramProfile {
  id: string
  username: string
  name?: string
  profile_picture_url?: string
  media_count?: number
  followers_count?: number
}

export interface InstagramGetCommentsParams {
  accessToken: string
  mediaId: string
  limit?: number
}

export interface InstagramMediaItem {
  id: string
  caption?: string
  media_type: string
  media_url?: string
  permalink?: string
  timestamp?: string
}

export interface InstagramPageInfo {
  id: string
  name?: string
  instagram_business_account?: InstagramProfile
}

export interface InstagramGetProfileResponse extends ToolResponse {
  output: {
    profile: InstagramProfile
  }
}

export interface InstagramGetMediaResponse extends ToolResponse {
  output: {
    media: InstagramMediaItem[]
    paging?: { next?: string; previous?: string }
  }
}

export interface InstagramGetPageResponse extends ToolResponse {
  output: {
    page: InstagramPageInfo
  }
}

export interface InstagramGetMediaByIdResponse extends ToolResponse {
  output: {
    media: InstagramMediaItem
  }
}

export interface InstagramCreatePostResponse extends ToolResponse {
  output: {
    mediaId: string
    permalink?: string
  }
}

export interface InstagramCreateCommentResponse extends ToolResponse {
  output: {
    commentId: string
  }
}

export interface InstagramReplyToCommentResponse extends ToolResponse {
  output: {
    commentId: string
  }
}

export interface InstagramCommentItem {
  id: string
  text?: string
  timestamp?: string
  username?: string
  from?: { id: string; username?: string }
}

export interface InstagramGetCommentsResponse extends ToolResponse {
  output: {
    comments: InstagramCommentItem[]
    paging?: { next?: string; previous?: string }
  }
}
