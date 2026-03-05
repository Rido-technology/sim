export interface TextSplitParams {
  text: string
  separator: string
  limit?: number
}

export interface TextConcatenateParams {
  texts: string[]
  separator?: string
}

export interface TextReplaceParams {
  text: string
  search: string
  replace: string
  replaceAll?: boolean
}

export interface TextSearchParams {
  text: string
  pattern: string
  caseSensitive?: boolean
}

export interface MarkdownToHtmlParams {
  markdown: string
}

export interface HtmlToMarkdownParams {
  html: string
}

export interface StripHtmlParams {
  html: string
  preserveSpaces?: boolean
}

export interface SlugifyParams {
  text: string
  separator?: string
  lowercase?: boolean
}

export interface DefaultValueParams {
  input: string
  defaultValue: string
  emptyCheck?: 'empty' | 'whitespace' | 'null'
}

export interface ListToTableParams {
  items: string[]
  columns: number
  headers?: string[]
  format?: 'markdown' | 'text'
}

export interface TextResult {
  result: string
}

export interface TextArrayResult {
  result: string[]
}

export interface TextSearchResult {
  found: boolean
  matches: string[]
  positions: number[]
  count: number
}

export interface TextTableResult {
  result: string
  rows: number
  columns: number
}