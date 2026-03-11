import { DiscourseIcon } from '@/components/icons'
import type { BlockConfig } from '@/blocks/types'
import type { DiscourseResponse } from '@/tools/discourse/types'

export const DiscourseBlock: BlockConfig<DiscourseResponse> = {
  type: 'discourse',
  name: 'Discourse',
  description: 'Interact with your Discourse forum',
  longDescription:
    'Integrate Discourse into your workflow. Create posts, topics, send private messages, manage group memberships, and change user trust levels.',
  docsLink: 'https://docs.discourse.org/',
  category: 'tools',
  bgColor: '#00AEEF',
  icon: DiscourseIcon,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'Create Post', id: 'discourse_create_post' },
        { label: 'Create Topic', id: 'discourse_create_topic' },
        { label: 'Change User Trust Level', id: 'discourse_change_trust_level' },
        { label: 'Add Users to Group', id: 'discourse_add_users_to_group' },
        { label: 'Send Private Message', id: 'discourse_send_private_message' },
      ],
      value: () => 'discourse_create_post',
    },
    {
      id: 'apiKey',
      title: 'API Key',
      type: 'short-input',
      placeholder: 'Enter your Discourse API key',
      password: true,
      required: true,
    },
    {
      id: 'apiUsername',
      title: 'API Username',
      type: 'short-input',
      placeholder: 'Enter your Discourse API username',
      required: true,
    },
    {
      id: 'siteUrl',
      title: 'Website URL',
      type: 'short-input',
      placeholder: 'https://discourse.yourinstance.com',
      required: true,
      description: 'URL of your Discourse instance',
    },

    {
      id: 'topicId',
      title: 'Topic ID',
      type: 'short-input',
      placeholder: 'Enter the topic ID to reply to',
      required: true,
      condition: { field: 'operation', value: 'discourse_create_post' },
      dependsOn: ['siteUrl', 'apiKey', 'apiUsername'],
      description: 'ID of the topic to post in',
    },
    {
      id: 'postContent',
      title: 'Post Content',
      type: 'long-input',
      placeholder: 'Enter the content of your post',
      required: true,
      condition: { field: 'operation', value: 'discourse_create_post' },
      rows: 5,
    },

    {
      id: 'topicTitle',
      title: 'Post Title',
      type: 'short-input',
      placeholder: 'Enter the title of the topic',
      required: true,
      condition: { field: 'operation', value: 'discourse_create_topic' },
      description: 'Title of the Topic',
    },
    {
      id: 'topicContent',
      title: 'Topic Content',
      type: 'long-input',
      placeholder: 'Enter the content of the topic',
      required: true,
      condition: { field: 'operation', value: 'discourse_create_topic' },
      rows: 5,
      description: 'Content of the topic',
    },
    {
      id: 'categoryId',
      title: 'Category ID',
      type: 'combobox',
      options: [],
      placeholder: 'Please connect your discourse account',
      required: false,
      condition: { field: 'operation', value: 'discourse_create_topic' },
      dependsOn: ['siteUrl', 'apiKey', 'apiUsername'],
      description: 'ID of the category to post in',
      fetchOptions: async (blockId: string) => {
        const { useSubBlockStore } = await import('@/stores/workflows/subblock/store')
        const { useWorkflowRegistry } = await import('@/stores/workflows/registry/store')

        const activeWorkflowId = useWorkflowRegistry.getState().activeWorkflowId
        if (!activeWorkflowId) return []

        const workflowValues = useSubBlockStore.getState().workflowValues[activeWorkflowId]
        const blockValues = workflowValues?.[blockId]

        const siteUrl = blockValues?.siteUrl as string | undefined
        const apiKey = blockValues?.apiKey as string | undefined
        const apiUsername = blockValues?.apiUsername as string | undefined

        if (!siteUrl || !apiKey || !apiUsername) return []

        try {
          const params = new URLSearchParams({ siteUrl, apiKey, apiUsername })
          const response = await fetch(`/api/tools/discourse/categories?${params.toString()}`)
          if (!response.ok) return []

          const data = await response.json()
          return data.categories || []
        } catch {
          return []
        }
      },
    },
    {
      id: 'userId',
      title: 'User ID',
      type: 'short-input',
      placeholder: 'Enter the user ID',
      required: true,
      condition: { field: 'operation', value: 'discourse_change_trust_level' },
      description: 'ID of the user',
    },
    {
      id: 'trustLevel',
      title: 'New Trust Level',
      type: 'dropdown',
      options: [
        { label: '0 - New User', id: '0' },
        { label: '1 - Basic User', id: '1' },
        { label: '2 - Member', id: '2' },
        { label: '3 - Regular', id: '3' },
        { label: '4 - Leader', id: '4' },
      ],
      required: true,
      condition: { field: 'operation', value: 'discourse_change_trust_level' },
      description: 'New trust level of the user',
    },
    {
      id: 'groupId',
      title: 'Group ID',
      type: 'short-input',
      placeholder: 'Enter the group ID',
      required: true,
      condition: { field: 'operation', value: 'discourse_add_users_to_group' },
      description: 'ID of the group',
    },
    {
      id: 'groupUsernames',
      title: 'Users',
      type: 'table',
      columns: ['Username'],
      required: true,
      condition: { field: 'operation', value: 'discourse_add_users_to_group' },
      description: 'List of users to add to the group',
    },

    {
      id: 'pmTitle',
      title: 'Post Title',
      type: 'short-input',
      placeholder: 'Enter the subject of the private message',
      required: true,
      condition: { field: 'operation', value: 'discourse_send_private_message' },
      description: 'Title of the private message',
    },
    {
      id: 'pmContent',
      title: 'Post Content',
      type: 'long-input',
      placeholder: 'Enter the content of the private message',
      required: true,
      condition: { field: 'operation', value: 'discourse_send_private_message' },
      rows: 5,
    },
    {
      id: 'pmRecipients',
      title: 'Recipients',
      type: 'table',
      columns: ['Username'],
      required: true,
      condition: { field: 'operation', value: 'discourse_send_private_message' },
      description: 'List of users to send the private message to',
    },
  ],

  tools: {
    access: [
      'discourse_create_post',
      'discourse_create_topic',
      'discourse_change_trust_level',
      'discourse_add_users_to_group',
      'discourse_send_private_message',
    ],
    config: {
      tool: (params) => params.operation as string,
      params: (params) => {
        const base = {
          apiKey: params.apiKey,
          apiUsername: params.apiUsername,
          siteUrl: params.siteUrl,
        }

        switch (params.operation) {
          case 'discourse_create_post':
            return {
              ...base,
              topicId: Number(params.topicId),
              raw: params.postContent,
            }

          case 'discourse_create_topic': {
            const result: Record<string, unknown> = {
              ...base,
              title: params.topicTitle,
              raw: params.topicContent,
            }
            if (params.categoryId) {
              result.categoryId = Number(params.categoryId)
            }
            return result
          }

          case 'discourse_change_trust_level':
            return {
              ...base,
              userId: Number(params.userId),
              level: Number(params.trustLevel),
            }

          case 'discourse_add_users_to_group': {
            const rows = Array.isArray(params.groupUsernames) ? params.groupUsernames : []
            const usernames = rows
              .map((row: Record<string, string>) => row.Username || row.username || '')
              .filter(Boolean)
              .join(',')
            return {
              ...base,
              groupId: Number(params.groupId),
              usernames,
            }
          }

          case 'discourse_send_private_message': {
            const rows = Array.isArray(params.pmRecipients) ? params.pmRecipients : []
            const recipients = rows
              .map((row: Record<string, string>) => row.Username || row.username || '')
              .filter(Boolean)
              .join(',')
            return {
              ...base,
              title: params.pmTitle,
              raw: params.pmContent,
              targetRecipients: recipients,
            }
          }

          default:
            return base
        }
      },
    },
  },

  inputs: {
    apiKey: { type: 'string', description: 'Discourse API key' },
    apiUsername: { type: 'string', description: 'Discourse API username' },
    siteUrl: { type: 'string', description: 'Discourse site URL' },
    operation: { type: 'string', description: 'Operation to perform' },
    topicId: { type: 'number', description: 'Topic ID (create post)' },
    postContent: { type: 'string', description: 'Post content (create post)' },
    topicTitle: { type: 'string', description: 'Topic title (create topic)' },
    topicContent: { type: 'string', description: 'Topic content (create topic)' },
    categoryId: { type: 'number', description: 'Category ID (create topic)' },
    userId: { type: 'number', description: 'User ID (change trust level)' },
    trustLevel: { type: 'number', description: 'Trust level (change trust level)' },
    groupId: { type: 'number', description: 'Group ID (add users to group)' },
    groupUsernames: { type: 'json', description: 'Usernames table (add users to group)' },
    pmTitle: { type: 'string', description: 'Private message title' },
    pmContent: { type: 'string', description: 'Private message content' },
    pmRecipients: { type: 'json', description: 'Recipients table (send private message)' },
  },

  outputs: {
    id: { type: 'number', description: 'ID of the created post/message' },
    topicId: { type: 'number', description: 'Topic ID' },
    postNumber: { type: 'number', description: 'Post number in topic' },
    title: { type: 'string', description: 'Title (topic/private message)' },
    url: { type: 'string', description: 'URL of the created item' },
    username: { type: 'string', description: 'Author username' },
    createdAt: { type: 'string', description: 'Creation timestamp' },
    raw: { type: 'string', description: 'Raw content' },
    cooked: { type: 'string', description: 'Rendered HTML content' },
    trustLevel: { type: 'number', description: 'Updated trust level' },
    userId: { type: 'number', description: 'User ID' },
    success: { type: 'boolean', description: 'Whether the operation succeeded' },
    usernames: { type: 'array', description: 'List of usernames' },
  },
}
