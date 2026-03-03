import { FigmaIcon } from '@/components/icons'
import type { BlockConfig } from '@/blocks/types'
import { AuthMode } from '@/blocks/types'

export const FigmaBlock: BlockConfig = {
  type: 'figma',
  name: 'Figma',
  description: 'Read files and manage comments in Figma',
  authMode: AuthMode.ApiKey,
  longDescription:
    'Integrate Figma into the workflow using a personal access token. Supports reading file contents, listing and posting comments, listing a team’s components, and listing a project’s files.',
  docsLink: 'https://developers.figma.com/docs/rest-api/',
  category: 'tools',
  bgColor: '#0ACF83',
  icon: FigmaIcon,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'Get File', id: 'get_file' },
        { label: 'List File Comments', id: 'list_comments' },
        { label: 'Post Comment', id: 'post_comment' },
        { label: 'List Team Components', id: 'list_team_components' },
        { label: 'List Project Files', id: 'list_project_files' },
        { label: 'List Team Projects', id: 'list_team_projects' },
      ],
      value: () => 'get_file',
    },
    {
      id: 'accessToken',
      title: 'Figma Access Token',
      type: 'short-input',
      placeholder: 'Paste your Figma personal access token',
      password: true,
      required: true,
      description:
        'Generate in Figma settings → Security → Personal access tokens. Include scopes like file_content:read and file_comments:read/write as needed.',
    },

    // Get File
    {
      id: 'fileKey',
      title: 'File Key',
      type: 'short-input',
      placeholder: 'Figma file key (from the file URL)',
      required: true,
      condition: { field: 'operation', value: ['get_file', 'list_comments'] },
    },

    // List File Comments
    {
      id: 'cursor',
      title: 'Cursor',
      type: 'short-input',
      placeholder: 'Pagination cursor (optional)',
      condition: { field: 'operation', value: 'list_comments' },
    },
    {
      id: 'as_number',
      title: 'Return Thread Count Only',
      type: 'switch',
      description: 'If enabled, only the number of comment threads is returned.',
      condition: { field: 'operation', value: 'list_comments' },
    },

    // Post Comment
    {
      id: 'commentFileKey',
      title: 'File Key',
      type: 'short-input',
      placeholder: 'Figma file key to comment on',
      required: true,
      condition: { field: 'operation', value: 'post_comment' },
    },
    {
      id: 'message',
      title: 'Comment Message',
      type: 'long-input',
      placeholder: 'What do you want to say?',
      required: true,
      condition: { field: 'operation', value: 'post_comment' },
    },
    {
      id: 'client_meta',
      title: 'Client Meta (optional)',
      type: 'long-input',
      placeholder: 'JSON with position or node references (client_meta from Figma API)',
      condition: { field: 'operation', value: 'post_comment' },
    },

    // List Team Components
    {
      id: 'teamId',
      title: 'Team ID',
      type: 'short-input',
      placeholder: 'Figma team ID',
      required: true,
      condition: {
        field: 'operation',
        value: ['list_team_components', 'list_team_projects'],
      },
    },
    {
      id: 'teamCursor',
      title: 'Cursor',
      type: 'short-input',
      placeholder: 'Pagination cursor (optional)',
      condition: { field: 'operation', value: 'list_team_components' },
    },

    // List Project Files
    {
      id: 'projectId',
      title: 'Project ID',
      type: 'short-input',
      placeholder: 'Figma project ID',
      required: true,
      condition: { field: 'operation', value: 'list_project_files' },
    },
  ],
  tools: {
    access: [
      'figma_get_file',
      'figma_list_comments',
      'figma_post_comment',
      'figma_list_team_components',
      'figma_list_project_files',
      'figma_list_team_projects',
    ],
    config: {
      tool: (params) => {
        switch (params.operation) {
          case 'get_file':
            return 'figma_get_file'
          case 'list_comments':
            return 'figma_list_comments'
          case 'post_comment':
            return 'figma_post_comment'
          case 'list_team_components':
            return 'figma_list_team_components'
          case 'list_team_projects':
            return 'figma_list_team_projects'
          case 'list_project_files':
            return 'figma_list_project_files'
          default:
            return 'figma_get_file'
        }
      },
      params: (params) => {
        const base = {
          accessToken: params.accessToken,
        }

        switch (params.operation) {
          case 'get_file':
            return {
              ...base,
              fileKey: params.fileKey,
            }
          case 'list_comments':
            return {
              ...base,
              fileKey: params.fileKey,
              cursor: params.cursor,
              as_number: Boolean(params.as_number),
            }
          case 'post_comment': {
            let clientMeta: unknown
            if (params.client_meta) {
              try {
                clientMeta = JSON.parse(params.client_meta)
              } catch {
                clientMeta = params.client_meta
              }
            }
            return {
              ...base,
              fileKey: params.commentFileKey,
              message: params.message,
              client_meta: clientMeta,
            }
          }
          case 'list_team_components':
            return {
              ...base,
              teamId: params.teamId,
              cursor: params.teamCursor,
            }
          case 'list_team_projects':
            return {
              ...base,
              teamId: params.teamId,
            }
          case 'list_project_files':
            return {
              ...base,
              projectId: params.projectId,
            }
          default:
            return base
        }
      },
    },
  },
  inputs: {
    operation: { type: 'string', description: 'Figma operation to perform' },
    accessToken: { type: 'string', description: 'Figma personal access token' },
    fileKey: { type: 'string', description: 'Figma file key (from URL)' },
    cursor: { type: 'string', description: 'Cursor for pagination' },
    as_number: {
      type: 'boolean',
      description: 'If true, return only the number of comment threads',
    },
    commentFileKey: {
      type: 'string',
      description: 'File key to post a comment on (if different from fileKey)',
    },
    message: { type: 'string', description: 'Comment message' },
    client_meta: {
      type: 'json',
      description: 'Position or node reference metadata for the comment',
    },
    teamId: { type: 'string', description: 'Figma team ID' },
    teamCursor: { type: 'string', description: 'Cursor for team components pagination' },
    projectId: { type: 'string', description: 'Figma project ID' },
  },
  outputs: {
    success: { type: 'boolean', description: 'Whether the Figma operation succeeded' },
    status: { type: 'number', description: 'HTTP status code from Figma (if available)' },
    error: { type: 'string', description: 'Error message, if any' },
    file: { type: 'json', description: 'Figma file JSON for Get File' },
    comments: { type: 'json', description: 'Comments list for List File Comments' },
    comment: { type: 'json', description: 'Created comment for Post Comment' },
    components: { type: 'json', description: 'Team components list' },
    projects: { type: 'json', description: 'Team projects list' },
    files: { type: 'json', description: 'Project files list' },
    pagination: { type: 'json', description: 'Pagination metadata (cursor, etc.)' },
  },
}
