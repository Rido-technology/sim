import type { ToolResponse } from '@/tools/types'

export interface DiscourseAuthParams {
  apiKey: string
  apiUsername: string
  siteUrl: string
}

export interface CreatePostParams extends DiscourseAuthParams {
  raw: string
  topicId: number
}

export interface CreateTopicParams extends DiscourseAuthParams {
  title: string
  raw: string
  categoryId?: number
}

export interface ChangeTrustLevelParams extends DiscourseAuthParams {
  userId: number
  level: number
}

export interface AddUsersToGroupParams extends DiscourseAuthParams {
  groupId: number
  usernames: string
}

export interface SendPrivateMessageParams extends DiscourseAuthParams {
  title: string
  raw: string
  targetRecipients: string
}

export interface DiscoursePostOutput {
  id: number
  topicId: number
  postNumber: number
  raw: string
  cooked: string
  username: string
  createdAt: string
  url: string
}

export interface DiscourseTopicOutput {
  topicId: number
  postId: number
  title: string
  url: string
  username: string
  createdAt: string
}

export interface DiscourseTrustLevelOutput {
  userId: number
  trustLevel: number
  success: boolean
}

export interface DiscourseGroupMembersOutput {
  success: boolean
  usernames: string[]
}

export interface DiscoursePrivateMessageOutput {
  id: number
  topicId: number
  title: string
  username: string
  createdAt: string
  url: string
}

export type DiscourseResponse = ToolResponse & {
  output:
    | DiscoursePostOutput
    | DiscourseTopicOutput
    | DiscourseTrustLevelOutput
    | DiscourseGroupMembersOutput
    | DiscoursePrivateMessageOutput
}
