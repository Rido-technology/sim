import type { ToolConfig } from '@/tools/types'
import type { MarkdownToHtmlParams, TextResult } from './types'

// Simple markdown to HTML converter - basic syntax only
function markdownToHtml(markdown: string): string {
  let html = markdown

  // Headers
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>')

  // Bold and italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

  // Code blocks
  html = html.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>')
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>')
  html = html.replace(/\n/g, '<br>')

  // Wrap in paragraphs if not already wrapped
  if (!html.match(/^<[h1-6]|<pre|<ul|<ol/)) {
    html = `<p>${html}</p>`
  }

  return html
}

export const markdownToHtmlTool: ToolConfig<MarkdownToHtmlParams, TextResult> = {
  id: 'text_helper_markdown_to_html',
  name: 'Markdown to HTML',
  description: 'Convert markdown text to HTML',
  version: '1.0.0',

  params: {
    markdown: {
      type: 'string',
      required: true,
      description: 'The markdown text to convert',
    },
  },

  request: {
    url: '/api/tools/text_helper/markdown-to-html',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    const markdown = String(params.markdown)
    
    if (!markdown.trim()) {
      return { success: true, output: { result: '' } }
    }

    const result = markdownToHtml(markdown)
    return { success: true, output: { result } }
  },

  outputs: {
    result: {
      type: 'string',
      description: 'The converted HTML',
    },
  },
}