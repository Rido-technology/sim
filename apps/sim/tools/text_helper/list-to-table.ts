import type { ToolConfig } from '@/tools/types'
import type { ListToTableParams, TextTableResult } from './types'

export const listToTableTool: ToolConfig<ListToTableParams, TextTableResult> = {
  id: 'text_helper_list_to_table',
  name: 'List to Table',
  description: 'Convert a list of items into a formatted table',
  version: '1.0.0',

  params: {
    items: {
      type: 'array',
      required: true,
      description: 'Array of items to arrange in table format, or string with items separated by newlines/commas',
    },
    columns: {
      type: 'number',
      required: true,
      description: 'Number of columns for the table',
    },
    headers: {
      type: 'array',
      required: false,
      description: 'Optional array of column headers, or comma-separated string',
    },
    format: {
      type: 'string',
      required: false,
      description: 'Output format: "markdown" or "text" (default: "markdown")',
    },
  },

  request: {
    url: '/api/tools/text_helper/list-to-table',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  directExecution: async (params) => {
    // Handle items parameter - can be array or string
    let items: string[] = []
    if (Array.isArray(params.items)) {
      items = params.items.map(item => String(item))
    } else if (typeof params.items === 'string') {
      const stringInput = String(params.items).trim()
      if (stringInput.includes('\n')) {
        items = stringInput.split('\n').map(item => item.trim()).filter(item => item.length > 0)
      } else if (stringInput.includes(',')) {
        items = stringInput.split(',').map(item => item.trim()).filter(item => item.length > 0)
      } else {
        items = stringInput ? [stringInput] : []
      }
    }

    const columns = Math.max(1, Number(params.columns) || 1)

    // Handle headers parameter - can be array or string
    let headers: string[] = []
    if (Array.isArray(params.headers)) {
      headers = params.headers.map(header => String(header))
    } else if (typeof params.headers === 'string' && (params.headers as string).trim()) {
      headers = (params.headers as string).split(',').map(header => header.trim()).filter(header => header.length > 0)
    }

    const format = params.format === 'text' ? 'text' : 'markdown'

    if (items.length === 0) {
      return {
        success: true,
        output: {
          result: '',
          rows: 0,
          columns: columns,
        },
      }
    }

    // Calculate number of rows needed
    const rows = Math.ceil(items.length / columns)

    // Build table data
    const tableData: string[][] = []
    
    // Add headers if provided
    if (headers.length > 0) {
      const headerRow = []
      for (let col = 0; col < columns; col++) {
        headerRow.push(headers[col] || `Column ${col + 1}`)
      }
      tableData.push(headerRow)
    }

    // Add data rows
    for (let row = 0; row < rows; row++) {
      const tableRow = []
      for (let col = 0; col < columns; col++) {
        const index = row * columns + col
        tableRow.push(index < items.length ? items[index] : '')
      }
      tableData.push(tableRow)
    }

    // Format output
    let result: string

    if (format === 'markdown') {
      result = formatMarkdownTable(tableData)
    } else {
      result = formatTextTable(tableData)
    }

    return {
      success: true,
      output: {
        result,
        rows: headers.length > 0 ? rows + 1 : rows,
        columns: columns,
      },
    }
  },

  outputs: {
    result: {
      type: 'string',
      description: 'The formatted table text',
    },
    rows: {
      type: 'number',
      description: 'Number of rows in the table (including headers)',
    },
    columns: {
      type: 'number',
      description: 'Number of columns in the table',
    },
  },
}

function formatMarkdownTable(tableData: string[][]): string {
  if (tableData.length === 0) return ''

  const rows = tableData.map(row => 
    '| ' + row.join(' | ') + ' |'
  )

  // Add separator after first row if it exists (header row)
  if (rows.length > 0) {
    const separator = '| ' + tableData[0].map(() => '---').join(' | ') + ' |'
    rows.splice(1, 0, separator)
  }

  return rows.join('\n')
}

function formatTextTable(tableData: string[][]): string {
  if (tableData.length === 0) return ''

  // Calculate column widths
  const colWidths = tableData[0].map((_, colIndex) => {
    return Math.max(...tableData.map(row => (row[colIndex] || '').length))
  })

  // Format rows with proper padding
  const rows = tableData.map(row => 
    row.map((cell, colIndex) => (cell || '').padEnd(colWidths[colIndex])).join(' | ')
  )

  // Add separator after header row if exists
  if (rows.length > 1) {
    const separator = colWidths.map(width => '-'.repeat(width)).join(' | ')
    rows.splice(1, 0, separator)
  }

  return rows.join('\n')
}