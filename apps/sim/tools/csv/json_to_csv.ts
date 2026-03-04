import type { JsonToCsvParams, JsonToCsvResponse } from '@/tools/csv/types'
import type { ToolConfig, ToolResponse } from '@/tools/types'

function getDelimiterChar(delimiter: JsonToCsvParams['delimiter']): string {
  return delimiter === 'tab' ? '\t' : ','
}

function flattenObject(
  value: unknown,
  parentKey = ''
): Record<string, string> {
  if (value === null || typeof value !== 'object') {
    return { [parentKey || 'value']: String(value ?? '') }
  }

  const result: Record<string, string> = {}

  const entries = Object.entries(value as Record<string, unknown>)
  for (const [key, child] of entries) {
    const nextKey = parentKey ? `${parentKey}.${key}` : key

    if (child !== null && typeof child === 'object') {
      const nested = flattenObject(child, nextKey)
      for (const [nestedKey, nestedValue] of Object.entries(nested)) {
        result[nestedKey] = nestedValue
      }
    } else {
      result[nextKey] = String(child ?? '')
    }
  }

  return result
}

function buildCsvRow(values: string[], delimiterChar: string): string {
  return values
    .map((raw) => {
      const value = raw ?? ''
      const shouldQuote = /["\r\n]/.test(value) || value.includes(delimiterChar)
      if (!shouldQuote) {
        return value
      }
      const escaped = value.replace(/"/g, '""')
      return `"${escaped}"`
    })
    .join(delimiterChar)
}

export const jsonToCsvTool: ToolConfig<JsonToCsvParams, JsonToCsvResponse> = {
  id: 'json_to_csv',
  name: 'JSON to CSV',
  description:
    'Convert a JSON array into CSV text. Nested objects are flattened and their keys are used as headers.',
  version: '1.0.0',

  params: {
    jsonArray: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description:
        'JSON array to convert. The input should be a JSON array. Nested objects will be flattened and keys used as headers.',
    },
    delimiter: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Delimiter for the CSV output: "tab" or "comma".',
    },
  },

  request: {
    url: '/api/tools/csv/from_json',
    method: 'POST',
    headers: () => ({
      'Content-Type': 'application/json',
    }),
    body: () => ({}),
  },

  directExecution: async (params: JsonToCsvParams): Promise<ToolResponse> => {
    let parsed: unknown

    try {
      parsed = JSON.parse(params.jsonArray)
    } catch (error) {
      return {
        success: false,
        output: {
          csv: '',
        },
        error:
          'Failed to parse input. The input should be a valid JSON array string.',
      }
    }

    if (!Array.isArray(parsed)) {
      return {
        success: false,
        output: {
          csv: '',
        },
        error:
          'Invalid input type. The input should be a JSON array.',
      }
    }

    const flattenedRows = parsed.map((item) => flattenObject(item))

    const headerSet = new Set<string>()
    for (const row of flattenedRows) {
      for (const key of Object.keys(row)) {
        headerSet.add(key)
      }
    }

    const headers = Array.from(headerSet)
    const delimiterChar = getDelimiterChar(params.delimiter)

    if (headers.length === 0) {
      return {
        success: true,
        output: {
          csv: '',
        },
      }
    }

    const csvLines: string[] = []
    csvLines.push(buildCsvRow(headers, delimiterChar))

    for (const row of flattenedRows) {
      const values = headers.map((header) => row[header] ?? '')
      csvLines.push(buildCsvRow(values, delimiterChar))
    }

    const csv = csvLines.join('\n')

    return {
      success: true,
      output: {
        csv,
      },
    }
  },

  outputs: {
    csv: {
      type: 'string',
      description:
        'CSV text generated from the input JSON array. Nested objects are flattened and their keys are used as headers.',
    },
  },
}

