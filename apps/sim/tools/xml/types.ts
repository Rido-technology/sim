import type { ToolResponse } from '@/tools/types'

export interface JsonToXmlParams {
  json: string
  attributeKey?: string
  includeHeader?: boolean
}

export interface JsonToXmlResponse extends ToolResponse {
  output: {
    xml: string
  }
}
