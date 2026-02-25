import { FacebookIcon } from '@/components/icons'
import type { BlockConfig } from '@/blocks/types'
import { AuthMode } from '@/blocks/types'
import type { FacebookResponse } from '@/tools/facebook/types'

export const FacebookBlock: BlockConfig<FacebookResponse> = {
  type: 'facebook',
  name: 'Facebook',
  description: 'Manage Facebook Pages and Posts',
  authMode: AuthMode.OAuth,
  longDescription:
    'Integrate Facebook into your workflows. Publish posts to Pages, retrieve page info, list and delete posts, and read comments via the Facebook Graph API.',
  docsLink: 'https://docs.sim.ai/tools/facebook',
  category: 'tools',
  bgColor: '#1877F2',
  icon: FacebookIcon,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'Post to Page', id: 'post_to_page' },
        { label: 'Get Page Info', id: 'get_page' },
        { label: 'Get Posts', id: 'get_posts' },
        { label: 'Get Comments', id: 'get_comments' },
        { label: 'Delete Post', id: 'delete_post' },
        { label: 'Get My Pages', id: 'get_my_pages' },
      ],
      value: () => 'post_to_page',
    },
    {
      id: 'credential',
      title: 'Facebook Account',
      type: 'oauth-input',
      serviceId: 'facebook',
      requiredScopes: ['pages_manage_posts', 'pages_read_engagement', 'pages_show_list'],
      placeholder: 'Select Facebook account',
      required: true,
    },
    {
      id: 'pageId',
      title: 'Page ID',
      type: 'short-input',
      placeholder: 'Enter Facebook Page ID',
      required: true,
      condition: {
        field: 'operation',
        value: ['post_to_page', 'get_page', 'get_posts', 'get_comments', 'delete_post'],
      },
    },
    {
      id: 'message',
      title: 'Message',
      type: 'long-input',
      placeholder: 'What do you want to post?',
      condition: { field: 'operation', value: 'post_to_page' },
      required: true,
    },
    {
      id: 'link',
      title: 'Link URL',
      type: 'short-input',
      placeholder: 'https://example.com (optional)',
      condition: { field: 'operation', value: 'post_to_page' },
    },
    {
      id: 'limit',
      title: 'Number of Posts',
      type: 'short-input',
      placeholder: '10',
      condition: { field: 'operation', value: 'get_posts' },
    },
    {
      id: 'postId',
      title: 'Post ID',
      type: 'short-input',
      placeholder: 'Enter Post ID',
      condition: {
        field: 'operation',
        value: ['get_comments', 'delete_post'],
      },
      required: true,
    },
  ],
  tools: {
    access: [
      'facebook_post_to_page',
      'facebook_get_page',
      'facebook_get_posts',
      'facebook_get_comments',
      'facebook_delete_post',
      'facebook_get_my_pages',
    ],
    config: {
      tool: (inputs) => `facebook_${inputs.operation || 'post_to_page'}`,
      params: (inputs) => {
        const { credential, operation, ...rest } = inputs

        const base = { accessToken: credential }

        switch (operation) {
          case 'post_to_page':
            return { ...base, pageId: rest.pageId, message: rest.message, link: rest.link }
          case 'get_page':
            return { ...base, pageId: rest.pageId }
          case 'get_posts':
            return { ...base, pageId: rest.pageId, limit: rest.limit ? Number(rest.limit) : 10 }
          case 'get_comments':
            return { ...base, pageId: rest.pageId, postId: rest.postId }
          case 'delete_post':
            return { ...base, pageId: rest.pageId, postId: rest.postId }
          case 'get_my_pages':
            return base
          default:
            return base
        }
      },
    },
  },
  inputs: {
    operation: { type: 'string', description: 'Operation to perform' },
    credential: { type: 'string', description: 'Facebook access token' },
    pageId: { type: 'string', description: 'Facebook Page ID' },
    message: { type: 'string', description: 'Post message content' },
    link: { type: 'string', description: 'Optional URL to attach to the post' },
    limit: { type: 'number', description: 'Number of posts to retrieve' },
    postId: { type: 'string', description: 'Facebook Post ID' },
  },
  outputs: {
    id: { type: 'string', description: 'ID of created post or page' },
    name: { type: 'string', description: 'Page name' },
    followersCount: { type: 'number', description: 'Number of followers' },
    fanCount: { type: 'number', description: 'Number of fans (likes)' },
    posts: { type: 'json', description: 'List of page posts' },
    comments: { type: 'json', description: 'List of post comments' },
    pages: { type: 'json', description: 'List of Facebook Pages managed by the user' },
    deleted: { type: 'boolean', description: 'Whether the post was successfully deleted' },
    success: { type: 'boolean', description: 'Operation success status' },
    error: { type: 'string', description: 'Error message if operation failed' },
  },
}
