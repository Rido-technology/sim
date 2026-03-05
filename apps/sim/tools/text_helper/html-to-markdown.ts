import type { ToolConfig } from '@/tools/types'
import type { HtmlToMarkdownParams, TextResult } from './types'

// Simple HTML to markdown converter - basic syntax only
function htmlToMarkdown(html: string): string {
  let markdown = html

  // Headers
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1')
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1')
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1')
  markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1')
  markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1')
  markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1')

  // Bold and italic
  markdown = markdown.replace(/<(strong|b)[^>]*>(.*?)<\/(strong|b)>/gi, '**$2**')
  markdown = markdown.replace(/<(em|i)[^>]*>(.*?)<\/(em|i)>/gi, '*$2*')

  // Links
  markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')

  // Code blocks and inline code
  markdown = markdown.replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gis, '```\n$1\n```')
  markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')

  // Line breaks and paragraphs
  markdown = markdown.replace(/<br\s*\/?>/gi, '\n')
  markdown = markdown.replace(/<\/p>/gi, '\n\n')
  markdown = markdown.replace(/<p[^>]*>/gi, '')

  // Lists (basic support)
  markdown = markdown.replace(/<ul[^>]*>/gi, '')
  markdown = markdown.replace(/<\/ul>/gi, '')
  markdown = markdown.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
  
  // Remove remaining HTML tags
  markdown = markdown.replace(/<[^>]*>/g, '')
  
  // Clean up extra whitespace
  markdown = markdown.replace(/\n{3,}/g, '\n\n')
  markdown = markdown.trim()

  return markdown
}

export const htmlToMarkdownTool: ToolConfig<HtmlToMarkdownParams, TextResult> = {
  id: 'text_helper_html_to_markdown',
  name: 'HTML to Markdown',
  description: 'Convert HTML to markdown text',
  version: '1.0.0',

  params: {
    html: {
      type: 'string',
      required: true,
      description: 'The HTML text to convert',
    },
  },

  request: {
    url: '/api/tools/text_helper/html-to-markdown',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    const html = String(params.html)
    
    if (!html.trim()) {
      return { success: true, output: { result: '' } }
    }

    const result = htmlToMarkdown(html)
    return { success: true, output: { result } }
  },

  outputs: {
    result: {
      type: 'string',
      description: 'The converted markdown text',
    },
  },
}