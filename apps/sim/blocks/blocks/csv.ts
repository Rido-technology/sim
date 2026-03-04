import { CsvIcon } from '@/components/icons'
import type { BlockConfig } from '@/blocks/types'

export const CsvBlock: BlockConfig = {
  type: 'csv',
  name: 'CSV',
  description: 'Convert between CSV text and JSON arrays.',
  longDescription:
    'Use the CSV block to convert raw CSV text into JSON arrays and back. Supports tab or comma delimiters, optional headers, and automatic flattening of nested JSON objects when generating CSV.',
  category: 'tools',
  bgColor: '#F97316',
  icon: CsvIcon,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'CSV to JSON', id: 'csv_to_json' },
        { label: 'JSON to CSV', id: 'json_to_csv' },
      ],
      value: () => 'csv_to_json',
    },

    // CSV to JSON inputs
    {
      id: 'csvText',
      title: 'CSV Text',
      type: 'long-input',
      rows: 8,
      placeholder: 'Paste CSV text here…',
      required: true,
      condition: { field: 'operation', value: 'csv_to_json' },
    },
    {
      id: 'hasHeaders',
      title: 'Does the CSV have headers?',
      type: 'switch',
      required: true,
      condition: { field: 'operation', value: 'csv_to_json' },
    },
    {
      id: 'delimiter',
      title: 'Delimiter Type',
      type: 'dropdown',
      required: true,
      options: [
        { label: 'Tab', id: 'tab' },
        { label: 'Comma', id: 'comma' },
      ],
      value: () => 'tab',
      condition: { field: 'operation', value: ['csv_to_json', 'json_to_csv'] },
    },
    {
      id: 'jsonArray',
      title: 'JSON Array',
      type: 'long-input',
      rows: 8,
      placeholder: 'Paste a JSON array here…',
      required: true,
      condition: { field: 'operation', value: 'json_to_csv' },
    },
  ],
  tools: {
    access: ['csv_to_json', 'json_to_csv'],
    config: {
      tool: (params) => {
        if (params.operation === 'json_to_csv') {
          return 'json_to_csv'
        }
        return 'csv_to_json'
      },
      params: (params) => {
        if (params.operation === 'json_to_csv') {
          return {
            jsonArray: params.jsonArray,
            delimiter: params.delimiter ?? 'tab',
          }
        }

        return {
          csvText: params.csvText,
          hasHeaders: Boolean(params.hasHeaders),
          delimiter: params.delimiter ?? 'tab',
        }
      },
    },
  },
  inputs: {
    operation: {
      type: 'string',
      description: 'CSV operation to perform: csv_to_json or json_to_csv.',
    },
    csvText: {
      type: 'string',
      description: 'Raw CSV text to convert into JSON.',
    },
    hasHeaders: {
      type: 'boolean',
      description: 'Whether the first row of the CSV contains headers.',
    },
    delimiter: {
      type: 'string',
      description: 'Delimiter type for CSV values: "tab" or "comma".',
    },
    jsonArray: {
      type: 'string',
      description:
        'JSON array to convert into CSV. The input should be a JSON array. Nested objects will be flattened and keys used as headers.',
    },
  },
  outputs: {
    rows: {
      type: 'json',
      description:
        'Parsed rows as a JSON array of objects when using the CSV to JSON operation.',
    },
    csv: {
      type: 'string',
      description:
        'CSV text generated from the JSON array when using the JSON to CSV operation.',
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
