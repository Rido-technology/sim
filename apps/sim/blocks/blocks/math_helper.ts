import { MathHelperIcon } from '@/components/icons'
import type { BlockConfig } from '@/blocks/types'

export const MathHelperBlock: BlockConfig = {
  type: 'math_helper',
  name: 'Math Helper',
  description: 'Comprehensive mathematical operations and utilities',
  longDescription:
    'Perform various mathematical calculations including basic arithmetic, statistical functions, and number transformations',
  docsLink: 'https://docs.sim.ai/tools/math-helper',
  category: 'tools',
  bgColor: '#4A90E2',
  icon: MathHelperIcon,

  subBlocks: [
    // Operation selector
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'Addition', id: 'add' },
        { label: 'Subtraction', id: 'subtract' },
        { label: 'Multiplication', id: 'multiply' },
        { label: 'Division', id: 'divide' },
        { label: 'Modulo (Remainder)', id: 'modulo' },
        { label: 'Power', id: 'power' },
        { label: 'Square Root', id: 'sqrt' },
        { label: 'Absolute Value', id: 'abs' },
        { label: 'Round', id: 'round' },
        { label: 'Floor', id: 'floor' },
        { label: 'Ceiling', id: 'ceil' },
        { label: 'Minimum', id: 'min' },
        { label: 'Maximum', id: 'max' },
        { label: 'Random Number', id: 'random' },
        { label: 'Clamp', id: 'clamp' },
        { label: 'Percentage', id: 'percentage' },
      ],
      placeholder: 'Select mathematical operation',
      required: true,
    },

    // Basic arithmetic - two numbers (add, subtract, multiply, divide, modulo)
    {
      id: 'a',
      title: 'First Number',
      type: 'short-input',
      placeholder: 'Enter first number',
      required: true,
      condition: { field: 'operation', value: ['add', 'subtract', 'multiply', 'divide', 'modulo'] },
    },
    {
      id: 'b',
      title: 'Second Number',
      type: 'short-input',
      placeholder: 'Enter second number',
      required: true,
      condition: { field: 'operation', value: ['add', 'subtract', 'multiply', 'divide', 'modulo'] },
    },

    // Power operation - base and exponent
    {
      id: 'base',
      title: 'Base',
      type: 'short-input',
      placeholder: 'Enter base number',
      required: true,
      condition: { field: 'operation', value: 'power' },
    },
    {
      id: 'exponent',
      title: 'Exponent',
      type: 'short-input',
      placeholder: 'Enter exponent',
      required: true,
      condition: { field: 'operation', value: 'power' },
    },

    // Single number operations (sqrt, abs, round, floor, ceil)
    {
      id: 'a',
      title: 'Number',
      type: 'short-input',
      placeholder: 'Enter number',
      required: true,
      condition: { field: 'operation', value: ['sqrt', 'abs', 'round', 'floor', 'ceil'] },
    },

    // Round precision
    {
      id: 'precision',
      title: 'Decimal Places',
      type: 'short-input',
      placeholder: 'Number of decimal places (optional)',
      required: false,
      condition: { field: 'operation', value: 'round' },
    },

    // Min/Max - comma-separated values
    {
      id: 'values',
      title: 'Numbers',
      type: 'short-input',
      placeholder: 'Enter comma-separated numbers (e.g. 1, 2, 3)',
      required: true,
      condition: { field: 'operation', value: ['min', 'max'] },
    },

    // Random number generation
    {
      id: 'min',
      title: 'Minimum',
      type: 'short-input',
      placeholder: 'Minimum bound',
      required: true,
      condition: { field: 'operation', value: ['random', 'clamp'] },
    },
    {
      id: 'max',
      title: 'Maximum',
      type: 'short-input',
      placeholder: 'Maximum bound',
      required: true,
      condition: { field: 'operation', value: ['random', 'clamp'] },
    },
    {
      id: 'integer',
      title: 'Integer Only',
      type: 'switch',
      required: false,
      condition: { field: 'operation', value: 'random' },
    },

    // Clamp - value to clamp
    {
      id: 'value',
      title: 'Value to Clamp',
      type: 'short-input',
      placeholder: 'Enter value to clamp',
      required: true,
      condition: { field: 'operation', value: 'clamp' },
    },

    // Percentage calculation
    {
      id: 'value',
      title: 'Partial Value',
      type: 'short-input',
      placeholder: 'Enter the partial value',
      required: true,
      condition: { field: 'operation', value: 'percentage' },
    },
    {
      id: 'total',
      title: 'Total Value',
      type: 'short-input',
      placeholder: 'Enter the total value',
      required: true,
      condition: { field: 'operation', value: 'percentage' },
    },
  ],

  tools: {
    access: [
      'math_helper_add',
      'math_helper_subtract', 
      'math_helper_multiply',
      'math_helper_divide',
      'math_helper_modulo',
      'math_helper_power',
      'math_helper_sqrt',
      'math_helper_abs',
      'math_helper_round',
      'math_helper_floor',
      'math_helper_ceil',
      'math_helper_min',
      'math_helper_max',
      'math_helper_random',
      'math_helper_clamp',
      'math_helper_percentage',
    ],
    config: {
      tool: (params) => `math_helper_${params.operation}`,
    },
  },

  inputs: {
    operation: {
      type: 'string',
      description: 'The mathematical operation to perform',
    },
    // Generic inputs that will be mapped based on operation
    a: {
      type: 'number',
      description: 'First number for binary operations',
    },
    b: {
      type: 'number',
      description: 'Second number for binary operations',
    },
    base: {
      type: 'number',
      description: 'Base number for power operation',
    },
    exponent: {
      type: 'number',
      description: 'Exponent for power operation',
    },
    value: {
      type: 'number',
      description: 'Input number for unary operations, clamp operations, and percentage calculations',
    },
    precision: {
      type: 'number',
      description: 'Number of decimal places for rounding',
    },
    values: {
      type: 'string',
      description: 'Comma-separated list of numbers',
    },
    min: {
      type: 'number',
      description: 'Minimum bound',
    },
    max: {
      type: 'number',
      description: 'Maximum bound',
    },
    integer: {
      type: 'boolean',
      description: 'Whether to return integer for random operations',
    },
    total: {
      type: 'number',
      description: 'Total value for percentage calculation',
    },
  },

  outputs: {
    result: {
      type: 'number',
      description: 'The result of the mathematical operation',
    },
    remainder: {
      type: 'number',
      description: 'Remainder value for division operations',
    },
  },
}