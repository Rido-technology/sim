import { InstagramIcon } from '@/components/icons'
import type { BlockConfig } from '@/blocks/types'
import { AuthMode } from '@/blocks/types'
import type {
  InstagramCreateCommentResponse,
  InstagramCreatePostResponse,
  InstagramGetCommentsResponse,
  InstagramGetMediaByIdResponse,
  InstagramGetMediaResponse,
  InstagramGetPageResponse,
  InstagramGetProfileResponse,
  InstagramReplyToCommentResponse,
} from '@/tools/instagram/types'
import { getTrigger } from '@/triggers'

type InstagramBlockOutput =
  | InstagramGetProfileResponse
  | InstagramGetMediaResponse
  | InstagramGetPageResponse
  | InstagramGetMediaByIdResponse
  | InstagramGetCommentsResponse
  | InstagramCreatePostResponse
  | InstagramCreateCommentResponse
  | InstagramReplyToCommentResponse

export const InstagramBlock: BlockConfig<InstagramBlockOutput> = {
  type: 'instagram',
  name: 'Instagram',
  description: 'Get profile, media, page; create posts and comments; reply to comments; or trigger from webhooks',
  authMode: AuthMode.ApiKey,
  longDescription:
    'Integrate Instagram into the workflow. Get profile, get page by ID, list or fetch media by ID, create image posts, create comments, reply to comments, or trigger from Instagram webhook events.',
  docsLink: 'https://docs.sim.ai/tools/instagram',
  category: 'tools',
  bgColor: '#E4405F',
  icon: InstagramIcon,
  triggerAllowed: true,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'Get Profile', id: 'instagram_get_profile' },
        { label: 'Get Page', id: 'instagram_get_page' },
        { label: 'Get Media', id: 'instagram_get_media' },
        { label: 'Get Media by ID (post details)', id: 'instagram_get_media_by_id' },
        { label: 'Get Comments', id: 'instagram_get_comments' },
        { label: 'Create Post', id: 'instagram_create_post' },
        { label: 'Create Comment', id: 'instagram_create_comment' },
        { label: 'Reply to Comment', id: 'instagram_reply_to_comment' },
      ],
      value: () => 'instagram_get_profile',
    },
    {
      id: 'accessToken',
      title: 'Page Access Token',
      type: 'short-input',
      placeholder: 'Meta Page Access Token (instagram_basic, instagram_content_publish for Create Post)',
      password: true,
      required: true,
    },
    {
      id: 'limit',
      title: 'Max Results',
      type: 'short-input',
      placeholder: '25',
      condition: {
        field: 'operation',
        value: ['instagram_get_media', 'instagram_get_comments'],
      },
    },
    {
      id: 'pageId',
      title: 'Page ID',
      type: 'short-input',
      placeholder: 'Leave empty for current page (me)',
      condition: { field: 'operation', value: 'instagram_get_page' },
    },
    {
      id: 'mediaId',
      title: 'Media ID',
      type: 'short-input',
      placeholder: 'Numeric Instagram media ID',
      required: true,
      condition: {
        field: 'operation',
        value: [
          'instagram_get_media_by_id',
          'instagram_get_comments',
          'instagram_create_comment',
        ],
      },
    },
    {
      id: 'imageUrl',
      title: 'Image URL',
      type: 'short-input',
      placeholder: 'Public JPEG URL (320–1440px width, 4:5–1.91:1)',
      required: true,
      condition: { field: 'operation', value: 'instagram_create_post' },
    },
    {
      id: 'caption',
      title: 'Caption',
      type: 'short-input',
      placeholder: 'Post caption',
      condition: { field: 'operation', value: 'instagram_create_post' },
    },
    {
      id: 'altText',
      title: 'Alt text',
      type: 'short-input',
      placeholder: 'Accessibility alt text',
      condition: { field: 'operation', value: 'instagram_create_post' },
    },
    {
      id: 'message',
      title: 'Comment / Reply text',
      type: 'short-input',
      placeholder: 'Comment or reply text (max 300 characters)',
      required: true,
      condition: {
        field: 'operation',
        value: ['instagram_create_comment', 'instagram_reply_to_comment'],
      },
    },
    {
      id: 'commentId',
      title: 'Comment ID',
      type: 'short-input',
      placeholder: 'Numeric Instagram comment ID to reply to',
      required: true,
      condition: { field: 'operation', value: 'instagram_reply_to_comment' },
    },
    ...getTrigger('instagram_webhook').subBlocks,
  ],
  tools: {
    access: [
      'instagram_get_profile',
      'instagram_get_media',
      'instagram_get_page',
      'instagram_get_media_by_id',
      'instagram_get_comments',
      'instagram_create_post',
      'instagram_create_comment',
      'instagram_reply_to_comment',
    ],
    config: {
      tool: (params) => (params.operation as string) || 'instagram_get_profile',
      params: (params) => {
        const {
          accessToken,
          limit,
          pageId,
          mediaId,
          imageUrl,
          caption,
          altText,
          message,
          commentId,
          ...rest
        } = params
        const parsed: Record<string, unknown> = { accessToken }
        const limitVal = limit !== undefined && limit !== '' ? Number(limit) : undefined
        if (limitVal !== undefined && !Number.isNaN(limitVal)) parsed.limit = limitVal
        if (pageId !== undefined && pageId !== '') parsed.pageId = pageId
        if (mediaId !== undefined && mediaId !== '') parsed.mediaId = mediaId
        if (imageUrl !== undefined && imageUrl !== '') parsed.imageUrl = imageUrl
        if (caption !== undefined && caption !== '') parsed.caption = caption
        if (altText !== undefined && altText !== '') parsed.altText = altText
        if (message !== undefined && message !== '') parsed.message = message
        if (commentId !== undefined && commentId !== '') parsed.commentId = commentId
        return { ...rest, ...parsed }
      },
    },
  },
  inputs: {
    operation: { type: 'string', description: 'Operation to perform' },
    accessToken: { type: 'string', description: 'Meta Page Access Token' },
    limit: { type: 'number', description: 'Max media items to return' },
    pageId: { type: 'string', description: 'Facebook Page ID (optional for Get Page)' },
    mediaId: { type: 'string', description: 'Instagram media ID' },
    imageUrl: { type: 'string', description: 'Public image URL for post' },
    caption: { type: 'string', description: 'Post caption' },
    altText: { type: 'string', description: 'Alt text for image' },
    message: { type: 'string', description: 'Comment or reply text' },
    commentId: { type: 'string', description: 'Comment ID to reply to' },
  },
  outputs: {
    profile: {
      type: 'json',
      description: 'Instagram profile (id, username, name, media_count)',
      condition: { field: 'operation', value: 'instagram_get_profile' },
    },
    media: {
      type: 'json',
      description: 'List of media items or single media (Get Media by ID)',
      condition: {
        field: 'operation',
        value: ['instagram_get_media', 'instagram_get_media_by_id'],
      },
    },
    comments: {
      type: 'json',
      description: 'List of comments on the post',
      condition: { field: 'operation', value: 'instagram_get_comments' },
    },
    page: {
      type: 'json',
      description: 'Page with linked Instagram account',
      condition: { field: 'operation', value: 'instagram_get_page' },
    },
    mediaId: {
      type: 'string',
      description: 'Published media ID',
      condition: { field: 'operation', value: 'instagram_create_post' },
    },
    permalink: {
      type: 'string',
      description: 'Permalink to the post',
      condition: { field: 'operation', value: 'instagram_create_post' },
    },
    commentId: {
      type: 'string',
      description: 'Created comment or reply ID',
      condition: {
        field: 'operation',
        value: ['instagram_create_comment', 'instagram_reply_to_comment'],
      },
    },
    messageId: { type: 'string', description: 'Webhook message ID' },
    from: { type: 'string', description: 'Sender ID' },
    text: { type: 'string', description: 'Message text' },
    timestamp: { type: 'string', description: 'Message timestamp' },
    raw: { type: 'json', description: 'Raw webhook payload' },
  },
  triggers: {
    enabled: true,
    available: ['instagram_webhook'],
  },
}
