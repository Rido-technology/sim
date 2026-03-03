import { MicrosoftOneNoteIcon } from '@/components/icons'
import type { BlockConfig } from '@/blocks/types'
import { AuthMode } from '@/blocks/types'
import type { ToolResponse } from '@/tools/types'

interface MicrosoftOneNoteBlockParams {
  credential: string
  accessToken?: string
  operation: string
  notebookId?: string
  sectionId?: string
  sectionGroupId?: string
  pageId?: string
  resourceId?: string
  displayName?: string
  title?: string
  content?: string
  search?: string
  filter?: string
  orderby?: string
  top?: number
  includeContent?: boolean
  targetSectionId?: string
  deltaToken?: string
  [key: string]: string | number | boolean | undefined
}

export const MicrosoftOneNoteBlock: BlockConfig<ToolResponse> = {
  type: 'microsoft_onenote',
  name: 'Microsoft OneNote',
  description: 'Create, read, and manage notes in Microsoft OneNote',
  authMode: AuthMode.OAuth,
  longDescription:
    'Integrate Microsoft OneNote into the workflow. Create and manage notebooks, sections, and pages. Search notes, update content, and organize information.',
  docsLink: 'https://docs.sim.ai/tools/microsoft_onenote',
  category: 'tools',
  bgColor: '#7719AA',
  icon: MicrosoftOneNoteIcon,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'List Notebooks', id: 'list_notebooks' },
        { label: 'Get Notebook', id: 'get_notebook' },
        { label: 'Create Notebook', id: 'create_notebook' },
        { label: 'List Sections', id: 'list_sections' },
        { label: 'Get Section', id: 'get_section' },
        { label: 'Create Section', id: 'create_section' },
        { label: 'List Section Groups', id: 'list_section_groups' },
        { label: 'Get Section Group', id: 'get_section_group' },
        { label: 'Create Section Group', id: 'create_section_group' },
        { label: 'List Pages', id: 'list_pages' },
        { label: 'Get Page', id: 'get_page' },
        { label: 'Get Page Content', id: 'get_page_content' },
        { label: 'Create Page', id: 'create_page' },
        { label: 'Update Page', id: 'update_page' },
        { label: 'Append to Page', id: 'append_to_page' },
        { label: 'Copy Page', id: 'copy_page' },
        { label: 'Delete Page', id: 'delete_page' },
        { label: 'Search Pages', id: 'search_pages' },
        { label: 'List Resources', id: 'list_resources' },
        { label: 'Get Resource', id: 'get_resource' },
        { label: 'Get Pages Delta', id: 'get_pages_delta' },
      ],
      value: () => 'list_notebooks',
    },
    {
      id: 'credential',
      title: 'Microsoft Account',
      type: 'oauth-input',
      serviceId: 'microsoft-onenote',
      requiredScopes: [
        'openid',
        'profile',
        'email',
        'Notes.Read',
        'Notes.ReadWrite',
        'Notes.Create',
        'offline_access',
      ],
      placeholder: 'Select Microsoft account',
      required: true,
    },

    // Notebook ID
    {
      id: 'notebookId',
      title: 'Notebook ID',
      type: 'short-input',
      placeholder: 'Enter the notebook ID',
      condition: {
        field: 'operation',
        value: [
          'get_notebook',
          'list_sections',
          'create_section',
          'list_section_groups',
          'create_section_group',
        ],
      },
      required: true,
      dependsOn: ['credential'],
    },

    // Section ID
    {
      id: 'sectionId',
      title: 'Section ID',
      type: 'short-input',
      placeholder: 'Enter the section ID',
      condition: {
        field: 'operation',
        value: ['get_section', 'list_pages', 'create_page'],
      },
      required: true,
      dependsOn: ['credential'],
    },

    // Section Group ID
    {
      id: 'sectionGroupId',
      title: 'Section Group ID',
      type: 'short-input',
      placeholder: 'Enter the section group ID',
      condition: {
        field: 'operation',
        value: ['get_section_group'],
      },
      required: true,
      dependsOn: ['credential'],
    },

    // Page ID
    {
      id: 'pageId',
      title: 'Page ID',
      type: 'short-input',
      placeholder: 'Enter the page ID',
      condition: {
        field: 'operation',
        value: [
          'get_page',
          'get_page_content',
          'update_page',
          'append_to_page',
          'delete_page',
          'copy_page',
        ],
      },
      required: true,
      dependsOn: ['credential'],
    },

    // Resource ID
    {
      id: 'resourceId',
      title: 'Resource ID',
      type: 'short-input',
      placeholder: 'Enter the resource ID',
      condition: {
        field: 'operation',
        value: ['get_resource'],
      },
      required: true,
      dependsOn: ['credential'],
    },

    // Display Name (for notebooks and sections)
    {
      id: 'displayName',
      title: 'Name',
      type: 'short-input',
      placeholder: 'Enter the name',
      condition: {
        field: 'operation',
        value: ['create_notebook', 'create_section', 'create_section_group'],
      },
      required: true,
    },

    // Title (for pages)
    {
      id: 'title',
      title: 'Page Title',
      type: 'short-input',
      placeholder: 'Enter the page title',
      condition: {
        field: 'operation',
        value: ['create_page'],
      },
      required: true,
    },

    // Content (for pages)
    {
      id: 'content',
      title: 'Content',
      type: 'long-input',
      placeholder: 'Enter HTML content (e.g., <p>Your notes here</p>)',
      condition: {
        field: 'operation',
        value: ['create_page', 'update_page', 'append_to_page'],
      },
      required: {
        field: 'operation',
        value: ['create_page', 'update_page', 'append_to_page'],
      },
    },

    // Search term
    {
      id: 'search',
      title: 'Search',
      type: 'short-input',
      placeholder: 'Enter search term',
      condition: {
        field: 'operation',
        value: ['search_pages', 'list_pages'],
      },
      required: {
        field: 'operation',
        value: 'search_pages',
      },
    },

    // Filter
    {
      id: 'filter',
      title: 'Filter',
      type: 'short-input',
      placeholder: 'OData filter query (e.g., isDefault eq true)',
      condition: {
        field: 'operation',
        value: ['list_notebooks'],
      },
    },

    // Order By
    {
      id: 'orderby',
      title: 'Order By',
      type: 'short-input',
      placeholder: 'Sort field (e.g., displayName, lastModifiedDateTime desc)',
      condition: {
        field: 'operation',
        value: ['list_notebooks'],
      },
    },

    // Top (limit)
    {
      id: 'top',
      title: 'Limit',
      type: 'short-input',
      placeholder: 'Maximum number of results (e.g., 10, 50, 100)',
      condition: {
        field: 'operation',
        value: ['list_notebooks', 'list_sections', 'list_pages', 'search_pages'],
      },
    },

    // Include Content
    {
      id: 'includeContent',
      title: 'Include Content',
      type: 'dropdown',
      options: [
        { label: 'Yes', id: 'true' },
        { label: 'No', id: 'false' },
      ],
      value: () => 'false',
      condition: {
        field: 'operation',
        value: ['get_page'],
      },
    },

    // Target Section ID (for copy page)
    {
      id: 'targetSectionId',
      title: 'Target Section ID',
      type: 'short-input',
      placeholder: 'Enter the section ID to copy the page to',
      condition: {
        field: 'operation',
        value: ['copy_page'],
      },
      required: true,
      dependsOn: ['credential'],
    },

    // Delta Token (for delta sync)
    {
      id: 'deltaToken',
      title: 'Delta Token',
      type: 'short-input',
      placeholder: 'Optional: Previous delta token for incremental sync',
      condition: {
        field: 'operation',
        value: ['get_pages_delta'],
      },
    },
  ],
  tools: {
    access: [
      'microsoft_onenote_list_notebooks',
      'microsoft_onenote_get_notebook',
      'microsoft_onenote_create_notebook',
      'microsoft_onenote_list_sections',
      'microsoft_onenote_get_section',
      'microsoft_onenote_create_section',
      'microsoft_onenote_list_section_groups',
      'microsoft_onenote_get_section_group',
      'microsoft_onenote_create_section_group',
      'microsoft_onenote_list_pages',
      'microsoft_onenote_get_page',
      'microsoft_onenote_get_page_content',
      'microsoft_onenote_create_page',
      'microsoft_onenote_update_page',
      'microsoft_onenote_append_to_page',
      'microsoft_onenote_copy_page',
      'microsoft_onenote_delete_page',
      'microsoft_onenote_search_pages',
      'microsoft_onenote_list_resources',
      'microsoft_onenote_get_resource',
      'microsoft_onenote_get_pages_delta',
    ],
    config: {
      tool: (params) => `microsoft_onenote_${params.operation}`,
      params: (params) => {
        const baseParams: any = {
          accessToken: params.accessToken,
        }

        // Add operation-specific parameters
        if (params.notebookId) {
          baseParams.notebookId = params.notebookId
        }

        if (params.sectionId) {
          baseParams.sectionId = params.sectionId
        }

        if (params.sectionGroupId) {
          baseParams.sectionGroupId = params.sectionGroupId
        }

        if (params.pageId) {
          baseParams.pageId = params.pageId
        }

        if (params.resourceId) {
          baseParams.resourceId = params.resourceId
        }

        if (params.displayName) {
          baseParams.displayName = params.displayName
        }

        if (params.title) {
          baseParams.title = params.title
        }

        if (params.content) {
          baseParams.content = params.content
        }

        if (params.targetSectionId) {
          baseParams.targetSectionId = params.targetSectionId
        }

        if (params.deltaToken) {
          baseParams.deltaToken = params.deltaToken
        }

        if (params.search) {
          baseParams.search = params.search
        }

        if (params.filter) {
          baseParams.filter = params.filter
        }

        if (params.orderby) {
          baseParams.orderby = params.orderby
        }

        if (params.top) {
          const topNum = Number(params.top)
          if (!isNaN(topNum)) {
            baseParams.top = topNum
          }
        }

        if (params.includeContent === 'true') {
          baseParams.includeContent = true
        }

        return baseParams
      },
    },
  },
  inputs: {
    operation: { type: 'string', description: 'Operation to perform' },
    credential: { type: 'string', description: 'Microsoft account credential' },
    notebookId: { type: 'string', description: 'Notebook ID' },
    sectionId: { type: 'string', description: 'Section ID' },
    sectionGroupId: { type: 'string', description: 'Section Group ID' },
    pageId: { type: 'string', description: 'Page ID' },
    resourceId: { type: 'string', description: 'Resource ID' },
    displayName: { type: 'string', description: 'Name for notebook, section, or section group' },
    title: { type: 'string', description: 'Page title' },
    content: { type: 'string', description: 'HTML content' },
    search: { type: 'string', description: 'Search term' },
    filter: { type: 'string', description: 'OData filter query' },
    orderby: { type: 'string', description: 'Sort field' },
    top: { type: 'number', description: 'Maximum number of results' },
    includeContent: { type: 'boolean', description: 'Include page content' },
    targetSectionId: { type: 'string', description: 'Target section ID for copying pages' },
    deltaToken: { type: 'string', description: 'Delta token for incremental sync' },
  },
  outputs: {
    success: {
      type: 'boolean',
      description: 'Whether the operation was successful',
    },
    notebooks: {
      type: 'json',
      description: 'Array of OneNote notebooks with id, displayName, and metadata',
    },
    notebook: {
      type: 'json',
      description: 'OneNote notebook details',
    },
    sections: {
      type: 'json',
      description: 'Array of OneNote sections',
    },
    section: {
      type: 'json',
      description: 'OneNote section details',
    },
    sectionGroups: {
      type: 'json',
      description: 'Array of OneNote section groups',
    },
    sectionGroup: {
      type: 'json',
      description: 'OneNote section group details',
    },
    pages: {
      type: 'json',
      description: 'Array of OneNote pages with title, id, and metadata',
    },
    page: {
      type: 'json',
      description: 'OneNote page details including title, id, contentUrl, and links',
    },
    content: {
      type: 'string',
      description: 'HTML content of the page',
    },
    resources: {
      type: 'json',
      description: 'Array of OneNote resources (images, files)',
    },
    resource: {
      type: 'json',
      description: 'OneNote resource details',
    },
    changes: {
      type: 'json',
      description: 'Array of page changes from delta sync',
    },
    deltaToken: {
      type: 'string',
      description: 'Token for next delta sync operation',
    },
    operationId: {
      type: 'string',
      description: 'Operation ID for asynchronous operations',
    },
    message: {
      type: 'string',
      description: 'Status message from the operation',
    },
  },
}
