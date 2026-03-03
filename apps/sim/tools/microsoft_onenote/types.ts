import type { ToolResponse } from '@/tools/types'

export interface OneNoteLinks {
  oneNoteClientUrl: { href: string }
  oneNoteWebUrl: { href: string }
}

export interface Notebook {
  id: string
  displayName: string
  createdDateTime: string
  lastModifiedDateTime: string
  isDefault: boolean
  userRole: string
  isShared: boolean
  sectionsUrl: string
  sectionGroupsUrl?: string
  links: OneNoteLinks
}

export interface Section {
  id: string
  displayName: string
  createdDateTime: string
  lastModifiedDateTime: string
  isDefault: boolean
  pagesUrl: string
  parentNotebook?: {
    id: string
    displayName: string
  }
}

export interface SectionGroup {
  id: string
  displayName: string
  createdDateTime: string
  lastModifiedDateTime: string
  sectionsUrl: string
  sectionGroupsUrl: string
  parentNotebook?: {
    id: string
    displayName: string
  }
  parentSectionGroup?: {
    id: string
    displayName: string
  }
}

export interface Resource {
  id: string
  content: string
  contentUrl: string
}

export interface DeltaChange {
  id: string
  '@odata.type': string
  '@removed'?: {
    reason: string
  }
}

export interface Page {
  id: string
  title: string
  createdDateTime: string
  lastModifiedDateTime: string
  level: number
  order: number
  contentUrl: string
  content?: string
  links: OneNoteLinks
  parentSection?: {
    id: string
    displayName: string
  }
}

export interface MicrosoftOneNoteToolParams {
  accessToken: string
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
}

export interface OneNoteListNotebooksResponse extends ToolResponse {
  output: {
    notebooks: Notebook[]
  }
}

export interface OneNoteGetNotebookResponse extends ToolResponse {
  output: {
    notebook: Notebook
  }
}

export interface OneNoteCreateNotebookResponse extends ToolResponse {
  output: {
    notebook: Notebook
  }
}

export interface OneNoteListSectionsResponse extends ToolResponse {
  output: {
    sections: Section[]
  }
}

export interface OneNoteGetSectionResponse extends ToolResponse {
  output: {
    section: Section
  }
}

export interface OneNoteCreateSectionResponse extends ToolResponse {
  output: {
    section: Section
  }
}

export interface OneNoteListPagesResponse extends ToolResponse {
  output: {
    pages: Page[]
  }
}

export interface OneNoteGetPageResponse extends ToolResponse {
  output: {
    page: Page
    content?: string
  }
}

export interface OneNoteCreatePageResponse extends ToolResponse {
  output: {
    page: Page
  }
}

export interface OneNoteUpdatePageResponse extends ToolResponse {
  output: {
    success: boolean
    message?: string
  }
}

export interface OneNoteDeletePageResponse extends ToolResponse {
  output: {
    success: boolean
    message?: string
  }
}

export interface OneNoteSearchPagesResponse extends ToolResponse {
  output: {
    pages: Page[]
  }
}

export interface OneNoteAppendToPageResponse extends ToolResponse {
  output: {
    success: boolean
    message?: string
  }
}

export interface OneNoteListSectionGroupsResponse extends ToolResponse {
  output: {
    sectionGroups: SectionGroup[]
  }
}

export interface OneNoteGetSectionGroupResponse extends ToolResponse {
  output: {
    sectionGroup: SectionGroup
  }
}

export interface OneNoteCreateSectionGroupResponse extends ToolResponse {
  output: {
    sectionGroup: SectionGroup
  }
}

export interface OneNoteGetPageContentResponse extends ToolResponse {
  output: {
    content: string
    pageId: string
  }
}

export interface OneNoteCopyPageResponse extends ToolResponse {
  output: {
    operationId: string
    message: string
  }
}

export interface OneNoteListResourcesResponse extends ToolResponse {
  output: {
    resources: Resource[]
  }
}

export interface OneNoteGetResourceResponse extends ToolResponse {
  output: {
    resource: Resource
  }
}

export interface OneNoteDeltaResponse extends ToolResponse {
  output: {
    changes: DeltaChange[]
    deltaToken: string
  }
}
