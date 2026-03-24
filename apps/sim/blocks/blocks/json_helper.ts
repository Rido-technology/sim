import { JsonHelperIcon } from '@/components/icons'
import type { BlockConfig } from '@/blocks/types'

export const JsonHelperBlock: BlockConfig = {
  type: 'json_helper',
  name: 'JSON Helper',
  description: 'Comprehensive JSON operations: parse, extract, transform, and manipulate JSON data',
  longDescription:
    'Perform all common JSON tasks including parsing, stringifying, reading/writing values by path, merging, flattening, filtering keys, and array operations',
  docsLink: 'https://docs.sim.ai/tools/json-helper',
  category: 'tools',
  bgColor: '#F0A500',
  icon: JsonHelperIcon,

  subBlocks: [
    // Operation selector
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'Parse JSON String', id: 'parse' },
        { label: 'Stringify to JSON', id: 'stringify' },
        { label: 'Get Value by Path', id: 'get' },
        { label: 'Set Value by Path', id: 'set' },
        { label: 'Delete Key by Path', id: 'delete' },
        { label: 'Merge Objects', id: 'merge' },
        { label: 'Flatten Object', id: 'flatten' },
        { label: 'Get Keys', id: 'keys' },
        { label: 'Get Values', id: 'values' },
        { label: 'Object to Entries Array', id: 'entries' },
        { label: 'Filter Keys', id: 'filter_keys' },
        { label: 'Array – Get Element', id: 'array_get' },
        { label: 'Array – Filter Items', id: 'array_filter' },
        { label: 'Array – Map Field', id: 'array_map' },
        { label: 'Size / Length', id: 'size' },
        { label: 'Type Check', id: 'type_check' },
      ],
      placeholder: 'Select JSON operation',
      required: true,
    },

    // parse: JSON string input
    {
      id: 'jsonString',
      title: 'JSON String',
      type: 'long-input',
      placeholder: '{"key": "value"}',
      required: true,
      condition: { field: 'operation', value: 'parse' },
    },

    // stringify: data + optional indent
    {
      id: 'data',
      title: 'Data',
      type: 'long-input',
      placeholder: 'JSON object or value to stringify',
      required: true,
      condition: { field: 'operation', value: 'stringify' },
    },
    {
      id: 'indent',
      title: 'Indent (spaces)',
      type: 'short-input',
      placeholder: '2 for pretty-print (optional)',
      required: false,
      condition: { field: 'operation', value: 'stringify' },
    },

    // get: data + path
    {
      id: 'data',
      title: 'JSON Object',
      type: 'long-input',
      placeholder: 'JSON object to query',
      required: true,
      condition: { field: 'operation', value: 'get' },
    },
    {
      id: 'path',
      title: 'Path',
      type: 'short-input',
      placeholder: 'e.g. user.address.city or items.0.id',
      required: true,
      condition: { field: 'operation', value: 'get' },
    },

    // set: data + path + value
    {
      id: 'data',
      title: 'JSON Object',
      type: 'long-input',
      placeholder: 'JSON object to update',
      required: true,
      condition: { field: 'operation', value: 'set' },
    },
    {
      id: 'path',
      title: 'Path',
      type: 'short-input',
      placeholder: 'e.g. user.name',
      required: true,
      condition: { field: 'operation', value: 'set' },
    },
    {
      id: 'value',
      title: 'New Value',
      type: 'short-input',
      placeholder: 'Value to set (string, number, or JSON)',
      required: true,
      condition: { field: 'operation', value: 'set' },
    },

    // delete: data + path
    {
      id: 'data',
      title: 'JSON Object',
      type: 'long-input',
      placeholder: 'JSON object to update',
      required: true,
      condition: { field: 'operation', value: 'delete' },
    },
    {
      id: 'path',
      title: 'Path',
      type: 'short-input',
      placeholder: 'e.g. user.address',
      required: true,
      condition: { field: 'operation', value: 'delete' },
    },

    // merge: data (base) + source
    {
      id: 'data',
      title: 'Base Object',
      type: 'long-input',
      placeholder: 'Base JSON object',
      required: true,
      condition: { field: 'operation', value: 'merge' },
    },
    {
      id: 'source',
      title: 'Source Object',
      type: 'long-input',
      placeholder: 'Object to merge into base',
      required: true,
      condition: { field: 'operation', value: 'merge' },
    },

    // flatten: data + optional separator
    {
      id: 'data',
      title: 'JSON Object',
      type: 'long-input',
      placeholder: 'Nested JSON object to flatten',
      required: true,
      condition: { field: 'operation', value: 'flatten' },
    },
    {
      id: 'separator',
      title: 'Separator',
      type: 'short-input',
      placeholder: '.(default)',
      required: false,
      condition: { field: 'operation', value: 'flatten' },
    },

    // keys / values / entries / size / type_check: data only
    {
      id: 'data',
      title: 'JSON Object / Array',
      type: 'long-input',
      placeholder: 'JSON input',
      required: true,
      condition: { field: 'operation', value: ['keys', 'values', 'entries', 'size', 'type_check'] },
    },

    // filter_keys: data + keys list
    {
      id: 'data',
      title: 'JSON Object',
      type: 'long-input',
      placeholder: 'JSON object to filter',
      required: true,
      condition: { field: 'operation', value: 'filter_keys' },
    },
    {
      id: 'keys',
      title: 'Keys to Keep',
      type: 'short-input',
      placeholder: 'Comma-separated keys: name,email,age',
      required: true,
      condition: { field: 'operation', value: 'filter_keys' },
    },

    // array_get: data + index
    {
      id: 'data',
      title: 'JSON Array',
      type: 'long-input',
      placeholder: 'JSON array',
      required: true,
      condition: { field: 'operation', value: 'array_get' },
    },
    {
      id: 'index',
      title: 'Index',
      type: 'short-input',
      placeholder: '0 for first, -1 for last',
      required: true,
      condition: { field: 'operation', value: 'array_get' },
    },

    // array_filter: data + field + value
    {
      id: 'data',
      title: 'JSON Array',
      type: 'long-input',
      placeholder: 'JSON array of objects',
      required: true,
      condition: { field: 'operation', value: 'array_filter' },
    },
    {
      id: 'field',
      title: 'Field',
      type: 'short-input',
      placeholder: 'Field name to match on',
      required: true,
      condition: { field: 'operation', value: 'array_filter' },
    },
    {
      id: 'value',
      title: 'Match Value',
      type: 'short-input',
      placeholder: 'Value the field must equal',
      required: true,
      condition: { field: 'operation', value: 'array_filter' },
    },

    // array_map: data + field
    {
      id: 'data',
      title: 'JSON Array',
      type: 'long-input',
      placeholder: 'JSON array of objects',
      required: true,
      condition: { field: 'operation', value: 'array_map' },
    },
    {
      id: 'field',
      title: 'Field to Extract',
      type: 'short-input',
      placeholder: 'Field name to extract from each item',
      required: true,
      condition: { field: 'operation', value: 'array_map' },
    },
  ],

  tools: {
    access: [
      'json_helper_parse',
      'json_helper_stringify',
      'json_helper_get',
      'json_helper_set',
      'json_helper_delete',
      'json_helper_merge',
      'json_helper_flatten',
      'json_helper_keys',
      'json_helper_values',
      'json_helper_entries',
      'json_helper_filter_keys',
      'json_helper_array_get',
      'json_helper_array_filter',
      'json_helper_array_map',
      'json_helper_size',
      'json_helper_type_check',
    ],
    config: {
      tool: (params) => `json_helper_${params.operation}`,
    },
  },

  inputs: {
    operation: {
      type: 'string',
      description: 'The JSON operation to perform',
    },
    data: {
      type: 'json',
      description: 'Input JSON object or array',
    },
    jsonString: {
      type: 'string',
      description: 'JSON string to parse',
    },
    path: {
      type: 'string',
      description: 'Dot-notation path (e.g. "user.address.city")',
    },
    value: {
      type: 'json',
      description: 'Value to set or match against',
    },
    source: {
      type: 'json',
      description: 'Source object for merge operations',
    },
    keys: {
      type: 'string',
      description: 'Comma-separated list of keys to keep',
    },
    field: {
      type: 'string',
      description: 'Field name for array operations',
    },
    index: {
      type: 'number',
      description: 'Array index for array_get',
    },
    indent: {
      type: 'number',
      description: 'Indentation spaces for stringify',
    },
    separator: {
      type: 'string',
      description: 'Key separator for flatten',
    },
  },

  outputs: {
    result: {
      type: {
        type: 'json',
        description: 'Result of the JSON operation',
      },
      description: 'The output of the selected operation',
    },
  },
}
