import type { ToolResponse } from '@/tools/types'

export type CsvDelimiter = 'tab' | 'comma'

export interface CsvToJsonParams {
  csvText: string
  hasHeaders: boolean
  delimiter: CsvDelimiter
}

export interface CsvToJsonResponse extends ToolResponse {
  output: {
    rows: Array<Record<string, string>>
  }
}

export interface JsonToCsvParams {
  jsonArray: string
  delimiter: CsvDelimiter
}

export interface JsonToCsvResponse extends ToolResponse {
  output: {
    csv: string
  }
}

