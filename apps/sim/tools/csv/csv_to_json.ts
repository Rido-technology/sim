import type { CsvToJsonParams, CsvToJsonResponse } from '@/tools/csv/types'
import type { ToolConfig, ToolResponse } from '@/tools/types'

function getDelimiterChar(delimiter: CsvToJsonParams['delimiter']): string {
  return delimiter === 'tab' ? '\t' : ','
}

function parseLine(line: string, delimiterChar: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === delimiterChar && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }

  result.push(current)
  return result
}

function normalizeLines(csvText: string): string[] {
  return csvText
    .split(/\r\n|\n|\r/)
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0)
}

export const csvToJsonTool: ToolConfig<CsvToJsonParams, CsvToJsonResponse> = {
  id: 'csv_to_json',
  name: 'CSV to JSON',
  description: 'Convert CSV text into a JSON array of objects.',
  version: '1.0.0',

  params: {
    csvText: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Raw CSV text to convert.',
    },
    hasHeaders: {
      type: 'boolean',
      required: true,
      visibility: 'user-or-llm',
      description: 'Whether the first row of the CSV contains headers.',
    },
    delimiter: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Delimiter for the CSV text: "tab" or "comma".',
    },
  },

  request: {
    url: '/api/tools/csv/to_json',
    method: 'POST',
    headers: () => ({
      'Content-Type': 'application/json',
    }),
    body: () => ({}),
  },

  directExecution: async (params: CsvToJsonParams): Promise<ToolResponse> => {
    const delimiterChar = getDelimiterChar(params.delimiter)
    const lines = normalizeLines(params.csvText)

    if (lines.length === 0) {
      return {
        success: true,
        output: {
          rows: [],
        },
      }
    }

    const parsedLines = lines.map((line) => parseLine(line, delimiterChar))

    let headers: string[]
    let dataLines: string[][]

    if (params.hasHeaders) {
      headers = parsedLines[0]
      dataLines = parsedLines.slice(1)
    } else {
      const maxColumns = parsedLines.reduce(
        (max, row) => (row.length > max ? row.length : max),
        0
      )
      headers = Array.from({ length: maxColumns }, (_value, index) => `column_${index + 1}`)
      dataLines = parsedLines
    }

    const rows = dataLines.map((row) => {
      const record: Record<string, string> = {}
      headers.forEach((header, index) => {
        record[header] = row[index] ?? ''
      })
      return record
    })

    return {
      success: true,
      output: {
        rows,
      },
    }
  },

  outputs: {
    rows: {
      type: 'json',
      description: 'Parsed rows as a JSON array of objects.',
    },
  },
}

