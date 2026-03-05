import type { JsonToXmlParams, JsonToXmlResponse } from '@/tools/xml/types'
import type { ToolConfig, ToolResponse } from '@/tools/types'

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildAttributes(attrs: Record<string, unknown>): string {
  return Object.entries(attrs)
    .map(([k, v]) => ` ${escapeXml(k)}="${escapeXml(String(v ?? ''))}"`)
    .join('')
}

function valueToXml(tagName: string, value: unknown, attributeKey: string, indent: string): string {
  const nextIndent = `${indent}  `

  if (value === null || value === undefined) {
    return `${indent}<${tagName} />`
  }

  if (typeof value !== 'object') {
    return `${indent}<${tagName}>${escapeXml(String(value))}</${tagName}>`
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => valueToXml(tagName, item, attributeKey, indent))
      .join('\n')
  }

  const obj = value as Record<string, unknown>
  const attrObj = attributeKey && obj[attributeKey] && typeof obj[attributeKey] === 'object'
    ? (obj[attributeKey] as Record<string, unknown>)
    : null

  const attrs = attrObj ? buildAttributes(attrObj) : ''

  const childEntries = Object.entries(obj).filter(([k]) => k !== attributeKey)

  if (childEntries.length === 0) {
    return `${indent}<${tagName}${attrs} />`
  }

  const children = childEntries
    .map(([k, v]) => {
      if (Array.isArray(v)) {
        return v.map((item) => valueToXml(k, item, attributeKey, nextIndent)).join('\n')
      }
      return valueToXml(k, v, attributeKey, nextIndent)
    })
    .join('\n')

  return `${indent}<${tagName}${attrs}>\n${children}\n${indent}</${tagName}>`
}

function jsonToXml(parsed: unknown, attributeKey: string): string {
  if (parsed === null || parsed === undefined) {
    return '<root />'
  }

  if (typeof parsed !== 'object') {
    return `<root>${escapeXml(String(parsed))}</root>`
  }

  if (Array.isArray(parsed)) {
    const items = parsed
      .map((item) => valueToXml('item', item, attributeKey, '  '))
      .join('\n')
    return `<root>\n${items}\n</root>`
  }

  const obj = parsed as Record<string, unknown>
  const entries = Object.entries(obj)

  if (entries.length === 1) {
    const [rootTag, rootValue] = entries[0]
    return valueToXml(rootTag, rootValue, attributeKey, '')
  }

  const children = entries
    .map(([k, v]) => {
      if (Array.isArray(v)) {
        return v.map((item) => valueToXml(k, item, attributeKey, '  ')).join('\n')
      }
      return valueToXml(k, v, attributeKey, '  ')
    })
    .join('\n')

  return `<root>\n${children}\n</root>`
}

export const jsonToXmlTool: ToolConfig<JsonToXmlParams, JsonToXmlResponse> = {
  id: 'json_to_xml',
  name: 'JSON to XML',
  description: 'Convert a JSON object or array into formatted XML.',
  version: '1.0.0',

  params: {
    json: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'JSON string to convert into XML.',
    },
    attributeKey: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description:
        'Key within each object whose value (an object) is serialized as XML attributes on the parent tag.',
    },
    includeHeader: {
      type: 'boolean',
      required: false,
      visibility: 'user-or-llm',
      description: 'When true, prepends the XML declaration header: <?xml version="1.0" encoding="UTF-8"?>.',
    },
  },

  request: {
    url: '/api/tools/xml/from_json',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: () => ({}),
  },

  directExecution: async (params: JsonToXmlParams): Promise<ToolResponse> => {
    let parsed: unknown

    try {
      parsed = JSON.parse(params.json)
    } catch {
      return {
        success: false,
        output: { xml: '' },
        error: 'Failed to parse input. The input must be a valid JSON string.',
      }
    }

    const attributeKey = params.attributeKey?.trim() ?? ''
    const xml = jsonToXml(parsed, attributeKey)
    const header = params.includeHeader ? '<?xml version="1.0" encoding="UTF-8"?>\n' : ''

    return {
      success: true,
      output: { xml: `${header}${xml}` },
    }
  },

  outputs: {
    xml: {
      type: 'string',
      description: 'XML string generated from the input JSON.',
    },
  },
}
