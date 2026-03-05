import { TextHelperIcon } from '@/components/icons'
import type { BlockConfig } from '@/blocks/types'

export const TextHelperBlock: BlockConfig = {
  type: 'text_helper',
  name: 'Text Helper',
  description: 'Comprehensive text processing and manipulation tools',
  longDescription:
    'Powerful text utilities for splitting, concatenating, replacing, searching, format conversion, and text transformation operations',
  docsLink: 'https://docs.sim.ai/tools/text-helper',
  category: 'tools',
  bgColor: '#16A085',
  icon: TextHelperIcon,

  subBlocks: [
    // Operation selector
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'Split Text', id: 'split' },
        { label: 'Concatenate Texts', id: 'concatenate' },
        { label: 'Replace Text', id: 'replace' },
        { label: 'Search in Text', id: 'search' },
        { label: 'Markdown to HTML', id: 'markdown_to_html' },
        { label: 'HTML to Markdown', id: 'html_to_markdown' },
        { label: 'Strip HTML Tags', id: 'strip_html' },
        { label: 'Slugify Text', id: 'slugify' },
        { label: 'Default Value', id: 'default_value' },
        { label: 'List to Table', id: 'list_to_table' },
      ],
      placeholder: 'Select text operation',
      required: true,
    },

    // Split operation
    {
      id: 'text',
      title: 'Text to Split',
      type: 'long-input',
      placeholder: 'Enter text to split',
      required: true,
      condition: { field: 'operation', value: 'split' },
    },
    {
      id: 'separator',
      title: 'Separator',
      type: 'short-input',
      placeholder: 'Enter separator (e.g. ",", "\\n", " ")',
      required: true,
      condition: { field: 'operation', value: 'split' },
    },
    {
      id: 'limit',
      title: 'Limit (Optional)',
      type: 'short-input',
      placeholder: 'Maximum number of splits',
      required: false,
      condition: { field: 'operation', value: 'split' },
    },

    // Concatenate operation
    {
      id: 'texts',
      title: 'Texts to Concatenate',
      type: 'long-input',
      placeholder: 'Enter texts to join (one per line or comma-separated)',
      required: true,
      condition: { field: 'operation', value: 'concatenate' },
    },
    {
      id: 'separator',
      title: 'Join Separator',
      type: 'short-input',
      placeholder: 'Separator between texts (optional)',
      required: false,
      condition: { field: 'operation', value: 'concatenate' },
    },

    // Replace operation
    {
      id: 'text',
      title: 'Original Text',
      type: 'long-input',
      placeholder: 'Enter the text to modify',
      required: true,
      condition: { field: 'operation', value: 'replace' },
    },
    {
      id: 'search',
      title: 'Search For',
      type: 'short-input',
      placeholder: 'Text to find and replace',
      required: true,
      condition: { field: 'operation', value: 'replace' },
    },
    {
      id: 'replace',
      title: 'Replace With',
      type: 'short-input',
      placeholder: 'Replacement text',
      required: true,
      condition: { field: 'operation', value: 'replace' },
    },
    {
      id: 'replaceAll',
      title: 'Replace All Occurrences',
      type: 'switch',
      required: false,
      condition: { field: 'operation', value: 'replace' },
    },

    // Search operation
    {
      id: 'text',
      title: 'Text to Search In',
      type: 'long-input',
      placeholder: 'Enter text to search',
      required: true,
      condition: { field: 'operation', value: 'search' },
    },
    {
      id: 'pattern',
      title: 'Search Pattern',
      type: 'short-input',
      placeholder: 'Text pattern to find',
      required: true,
      condition: { field: 'operation', value: 'search' },
    },
    {
      id: 'caseSensitive',
      title: 'Case Sensitive',
      type: 'switch',
      required: false,
      condition: { field: 'operation', value: 'search' },
    },

    // Markdown to HTML
    {
      id: 'markdown',
      title: 'Markdown Text',
      type: 'long-input',
      placeholder: 'Enter markdown text',
      required: true,
      condition: { field: 'operation', value: 'markdown_to_html' },
    },

    // HTML to Markdown
    {
      id: 'html',
      title: 'HTML Text',
      type: 'long-input',
      placeholder: 'Enter HTML text',
      required: true,
      condition: { field: 'operation', value: ['html_to_markdown', 'strip_html'] },
    },

    // Strip HTML options
    {
      id: 'preserveSpaces',
      title: 'Preserve Spacing',
      type: 'switch',
      required: false,
      condition: { field: 'operation', value: 'strip_html' },
    },

    // Slugify operation
    {
      id: 'text',
      title: 'Text to Slugify',
      type: 'short-input',
      placeholder: 'Enter text to convert to slug',
      required: true,
      condition: { field: 'operation', value: 'slugify' },
    },
    {
      id: 'separator',
      title: 'Separator Character',
      type: 'short-input',
      placeholder: 'Separator (default: "-")',
      required: false,
      condition: { field: 'operation', value: 'slugify' },
    },
    {
      id: 'lowercase',
      title: 'Convert to Lowercase',
      type: 'switch',
      required: false,
      condition: { field: 'operation', value: 'slugify' },
    },

    // Default value operation
    {
      id: 'input',
      title: 'Input Text',
      type: 'short-input',
      placeholder: 'Input text to check',
      required: true,
      condition: { field: 'operation', value: 'default_value' },
    },
    {
      id: 'defaultValue',
      title: 'Default Value',
      type: 'short-input',
      placeholder: 'Default value to use if input is empty',
      required: true,
      condition: { field: 'operation', value: 'default_value' },
    },
    {
      id: 'emptyCheck',
      title: 'Empty Check Type',
      type: 'dropdown',
      options: [
        { label: 'Empty String Only', id: 'empty' },
        { label: 'Whitespace Only', id: 'whitespace' },
        { label: 'Null/Undefined', id: 'null' },
      ],
      required: false,
      condition: { field: 'operation', value: 'default_value' },
    },

    // List to table operation
    {
      id: 'items',
      title: 'List Items',
      type: 'long-input',
      placeholder: 'Enter items (one per line or comma-separated)',
      required: true,
      condition: { field: 'operation', value: 'list_to_table' },
    },
    {
      id: 'columns',
      title: 'Number of Columns',
      type: 'short-input',
      placeholder: 'Number of columns in table',
      required: true,
      condition: { field: 'operation', value: 'list_to_table' },
    },
    {
      id: 'headers',
      title: 'Column Headers (Optional)',
      type: 'short-input',
      placeholder: 'Comma-separated headers',
      required: false,
      condition: { field: 'operation', value: 'list_to_table' },
    },
    {
      id: 'format',
      title: 'Table Format',
      type: 'dropdown',
      options: [
        { label: 'Markdown', id: 'markdown' },
        { label: 'Plain Text', id: 'text' },
      ],
      required: false,
      condition: { field: 'operation', value: 'list_to_table' },
    },
  ],

  tools: {
    access: [
      'text_helper_split',
      'text_helper_concatenate',
      'text_helper_replace',
      'text_helper_search',
      'text_helper_markdown_to_html',
      'text_helper_html_to_markdown',
      'text_helper_strip_html',
      'text_helper_slugify',
      'text_helper_default_value',
      'text_helper_list_to_table',
    ],
    config: {
      tool: (params) => `text_helper_${params.operation}`,
    },
  },

  inputs: {
    operation: {
      type: 'string',
      description: 'The text operation to perform',
    },
    text: {
      type: 'string',
      description: 'Text input for various operations (split, replace, search, slugify)',
    },
    separator: {
      type: 'string',
      description: 'Separator character or string used in split, concatenate, and slugify operations',
    },
    limit: {
      type: 'number',
      description: 'Limit for split operations',
    },
    texts: {
      type: 'array',
      description: 'Array of texts for concatenation',
    },
    search: {
      type: 'string',
      description: 'Text to search for in replace operations',
    },
    replace: {
      type: 'string',
      description: 'Replacement text',
    },
    replaceAll: {
      type: 'boolean',
      description: 'Whether to replace all occurrences',
    },
    pattern: {
      type: 'string',
      description: 'Search pattern for text search operations',
    },
    caseSensitive: {
      type: 'boolean',
      description: 'Case sensitive search',
    },
    markdown: {
      type: 'string',
      description: 'Markdown text to convert',
    },
    html: {
      type: 'string',
      description: 'HTML text for conversion or processing',
    },
    preserveSpaces: {
      type: 'boolean',
      description: 'Preserve spacing when stripping HTML',
    },
    lowercase: {
      type: 'boolean',
      description: 'Convert to lowercase in slugify operations',
    },
    input: {
      type: 'string',
      description: 'Input text for default value check',
    },
    defaultValue: {
      type: 'string',
      description: 'Default value to use',
    },
    emptyCheck: {
      type: 'string',
      description: 'Type of empty check to perform',
    },
    items: {
      type: 'array',
      description: 'Items to convert to table',
    },
    columns: {
      type: 'number',
      description: 'Number of columns in table',
    },
    headers: {
      type: 'array',
      description: 'Column headers',
    },
    format: {
      type: 'string',
      description: 'Output format for table',
    },
  },

  outputs: {
    result: {
      type: 'string',
      description: 'The processed text result',
    },
    found: {
      type: 'boolean',
      description: 'Whether search pattern was found',
    },
    matches: {
      type: 'array',
      description: 'Array of search matches',
    },
    positions: {
      type: 'array',
      description: 'Positions of matches',
    },
    count: {
      type: 'number',
      description: 'Number of matches found',
    },
    rows: {
      type: 'number',
      description: 'Number of rows in generated table',
    },
    columns: {
      type: 'number',
      description: 'Number of columns in generated table',
    },
  },
}