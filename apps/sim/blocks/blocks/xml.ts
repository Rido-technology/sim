import { XmlIcon } from '@/components/icons'
import type { BlockConfig } from '@/blocks/types'

export const XmlBlock: BlockConfig = {
  type: 'xml',
  name: 'XML',
  description: 'Convert JSON to XML.',
  longDescription:
    'Use the XML block to convert JSON objects or arrays into formatted XML. Optionally specify a key whose value is serialized as tag attributes, and toggle the XML declaration header.',
  category: 'tools',
  bgColor: '#F59E0B',
  icon: XmlIcon,
  subBlocks: [
    {
      id: 'json',
      title: 'JSON',
      type: 'long-input',
      rows: 8,
      placeholder: 'Paste JSON here…',
      required: true,
    },
    {
      id: 'attributeKey',
      title: 'Attribute Key',
      type: 'short-input',
      placeholder: 'e.g. @attributes',
      required: false,
    },
    {
      id: 'includeHeader',
      title: 'Include XML Header',
      type: 'switch',
      required: false,
    },
  ],
  tools: {
    access: ['json_to_xml'],
    config: {
      tool: () => 'json_to_xml',
      params: (params) => ({
        json: params.json,
        attributeKey: params.attributeKey || undefined,
        includeHeader: Boolean(params.includeHeader),
      }),
    },
  },
  inputs: {
    json: {
      type: 'string',
      description: 'JSON string to convert into XML.',
    },
    attributeKey: {
      type: 'string',
      description:
        'Key within each object whose value is serialized as XML attributes on the parent tag.',
    },
    includeHeader: {
      type: 'boolean',
      description: 'When true, prepends the XML declaration header.',
    },
  },
  outputs: {
    xml: {
      type: 'string',
      description: 'XML string generated from the input JSON.',
    },
    error: {
      type: 'string',
      description: 'Error message if the conversion failed.',
    },
    success: {
      type: 'boolean',
      description: 'Whether the conversion operation succeeded.',
    },
  },
}
