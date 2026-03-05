import { DateHelperIcon } from '@/components/icons'
import type { BlockConfig } from '@/blocks/types'
import { TIME_FORMAT_OPTIONS, TIME_FORMATS, TIMEZONE_OPTIONS } from '@/lib/date'

const WEEKDAY_OPTIONS = [
  { label: 'Sunday', id: '0' },
  { label: 'Monday', id: '1' },
  { label: 'Tuesday', id: '2' },
  { label: 'Wednesday', id: '3' },
  { label: 'Thursday', id: '4' },
  { label: 'Friday', id: '5' },
  { label: 'Saturday', id: '6' },
]

const MONTH_OPTIONS = [
  { label: 'January', id: '1' },
  { label: 'February', id: '2' },
  { label: 'March', id: '3' },
  { label: 'April', id: '4' },
  { label: 'May', id: '5' },
  { label: 'June', id: '6' },
  { label: 'July', id: '7' },
  { label: 'August', id: '8' },
  { label: 'September', id: '9' },
  { label: 'October', id: '10' },
  { label: 'November', id: '11' },
  { label: 'December', id: '12' },
]



export const DateHelperBlock: BlockConfig = {
  type: 'date_helper',
  name: 'Date Helper',
  description: 'Powerful date and time manipulation tools',
  longDescription:
    'Comprehensive date and time utilities for formatting, calculations, and conversions with timezone support',
  docsLink: 'https://docs.sim.ai/tools/date-helper',
  category: 'tools',
  bgColor: '#FF6B6B',
  icon: DateHelperIcon,

  subBlocks: [
    // Operation selector
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'Get Current Date', id: 'get_current_date' },
        { label: 'Format Date', id: 'format_date' },
        { label: 'Add/Subtract Date', id: 'add_subtract_date' },
        { label: 'Date Difference', id: 'date_difference' },
        { label: 'Extract Date Parts', id: 'extract_date_parts' },
        { label: 'Next Day of Week', id: 'next_day_of_week' },
        { label: 'Next Day of Year', id: 'next_day_of_year' },
        { label: 'First Day of Previous Month', id: 'first_day_previous_month' },
        { label: 'Last Day of Previous Month', id: 'last_day_previous_month' },
      ],
      value: () => 'get_current_date',
      required: true,
    },

    // Common fields - Output Format
    {
      id: 'outputFormat',
      title: 'Output Format',
      type: 'dropdown',
      options: TIME_FORMAT_OPTIONS.map((fmt) => ({ label: fmt.label, id: fmt.value })),
      value: () => TIME_FORMATS.format00,
      required: true,
      dependsOn: ['operation'],
      condition: {
        field: 'operation',
        value: [
          'get_current_date',
          'format_date',
          'add_subtract_date',
          'next_day_of_week',
          'next_day_of_year',
          'first_day_previous_month',
          'last_day_previous_month',
        ],
      },
    },

    // Common fields - Time Zone
    {
      id: 'timeZone',
      title: 'Time Zone',
      type: 'dropdown',
      options: TIMEZONE_OPTIONS.map((tz) => ({ label: tz.label, id: tz.value })),
      value: () => 'UTC',
      required: true,
      dependsOn: ['operation'],
      condition: {
        field: 'operation',
        value: [
          'get_current_date',
          'add_subtract_date',
          'next_day_of_week',
          'next_day_of_year',
          'first_day_previous_month',
          'last_day_previous_month',
        ],
      },
    },

    // ======================
    // Format Date inputs
    // ======================
    {
      id: 'inputDate',
      title: 'Input Date',
      type: 'short-input',
      placeholder: '2023-09-17',
      required: true,
      dependsOn: ['operation'],
      condition: {
        field: 'operation',
        value: ['format_date', 'add_subtract_date', 'extract_date_parts'],
      },
    },
    {
      id: 'inputFormat',
      title: 'Input Format',
      type: 'dropdown',
      options: TIME_FORMAT_OPTIONS.map((fmt) => ({ label: fmt.label, id: fmt.value })),
      value: () => TIME_FORMATS.format00,
      required: true,
      dependsOn: ['operation'],
      condition: {
        field: 'operation',
        value: ['format_date', 'add_subtract_date', 'extract_date_parts'],
      },
    },
    {
      id: 'inputTimeZone',
      title: 'Input Time Zone',
      type: 'dropdown',
      options: TIMEZONE_OPTIONS.map((tz) => ({ label: tz.label, id: tz.value })),
      value: () => 'UTC',
      required: false,
      dependsOn: ['operation'],
      condition: {
        field: 'operation',
        value: 'format_date',
      },
    },
    {
      id: 'outputTimeZone',
      title: 'Output Time Zone',
      type: 'dropdown',
      options: TIMEZONE_OPTIONS.map((tz) => ({ label: tz.label, id: tz.value })),
      value: () => 'UTC',
      required: false,
      dependsOn: ['operation'],
      condition: {
        field: 'operation',
        value: 'format_date',
      },
    },

    // ===========================
    // Add/Subtract Date inputs
    // ===========================
    {
      id: 'expression',
      title: 'Expression',
      type: 'short-input',
      placeholder: '+2 hour -1 day',
      required: true,
      dependsOn: ['operation'],
      condition: {
        field: 'operation',
        value: 'add_subtract_date',
      },
    },
    {
      id: 'setTime',
      title: 'Set Time (HH:mm)',
      type: 'short-input',
      placeholder: '14:30',
      required: false,
      dependsOn: ['operation'],
      condition: {
        field: 'operation',
        value: 'add_subtract_date',
      },
    },

    // =========================
    // Date Difference inputs
    // =========================
    {
      id: 'startDate',
      title: 'Start Date',
      type: 'short-input',
      placeholder: '2023-01-01',
      required: true,
      dependsOn: ['operation'],
      condition: {
        field: 'operation',
        value: 'date_difference',
      },
    },
    {
      id: 'startDateFormat',
      title: 'Start Date Format',
      type: 'dropdown',
      options: TIME_FORMAT_OPTIONS.map((fmt) => ({ label: fmt.label, id: fmt.value })),
      value: () => TIME_FORMATS.format00,
      required: true,
      dependsOn: ['operation'],
      condition: {
        field: 'operation',
        value: 'date_difference',
      },
    },
    {
      id: 'endDate',
      title: 'End Date',
      type: 'short-input',
      placeholder: '2023-12-31',
      required: true,
      dependsOn: ['operation'],
      condition: {
        field: 'operation',
        value: 'date_difference',
      },
    },
    {
      id: 'endDateFormat',
      title: 'End Date Format',
      type: 'dropdown',
      options: TIME_FORMAT_OPTIONS.map((fmt) => ({ label: fmt.label, id: fmt.value })),
      value: () => TIME_FORMATS.format00,
      required: true,
      dependsOn: ['operation'],
      condition: {
        field: 'operation',
        value: 'date_difference',
      },
    },
    // Units to Calculate (date_difference) — individual switches so the serializer
    // includes each boolean in params; config.params() aggregates them into an array.
    {
      id: 'unit_year',
      title: 'Year',
      type: 'switch',
      required: false,
      dependsOn: ['operation'],
      condition: { field: 'operation', value: 'date_difference' },
    },
    {
      id: 'unit_month',
      title: 'Month',
      type: 'switch',
      required: false,
      dependsOn: ['operation'],
      condition: { field: 'operation', value: 'date_difference' },
    },
    {
      id: 'unit_week',
      title: 'Week',
      type: 'switch',
      required: false,
      dependsOn: ['operation'],
      condition: { field: 'operation', value: 'date_difference' },
    },
    {
      id: 'unit_day',
      title: 'Day',
      type: 'switch',
      required: false,
      dependsOn: ['operation'],
      condition: { field: 'operation', value: 'date_difference' },
    },
    {
      id: 'unit_hour',
      title: 'Hour',
      type: 'switch',
      required: false,
      dependsOn: ['operation'],
      condition: { field: 'operation', value: 'date_difference' },
    },
    {
      id: 'unit_minute',
      title: 'Minute',
      type: 'switch',
      required: false,
      dependsOn: ['operation'],
      condition: { field: 'operation', value: 'date_difference' },
    },
    {
      id: 'unit_second',
      title: 'Second',
      type: 'switch',
      required: false,
      dependsOn: ['operation'],
      condition: { field: 'operation', value: 'date_difference' },
    },

    // Parts to Extract (extract_date_parts) — same pattern.
    {
      id: 'part_year',
      title: 'Year',
      type: 'switch',
      required: false,
      dependsOn: ['operation'],
      condition: { field: 'operation', value: 'extract_date_parts' },
    },
    {
      id: 'part_month',
      title: 'Month',
      type: 'switch',
      required: false,
      dependsOn: ['operation'],
      condition: { field: 'operation', value: 'extract_date_parts' },
    },
    {
      id: 'part_day',
      title: 'Day',
      type: 'switch',
      required: false,
      dependsOn: ['operation'],
      condition: { field: 'operation', value: 'extract_date_parts' },
    },
    {
      id: 'part_hour',
      title: 'Hour',
      type: 'switch',
      required: false,
      dependsOn: ['operation'],
      condition: { field: 'operation', value: 'extract_date_parts' },
    },
    {
      id: 'part_minute',
      title: 'Minute',
      type: 'switch',
      required: false,
      dependsOn: ['operation'],
      condition: { field: 'operation', value: 'extract_date_parts' },
    },
    {
      id: 'part_second',
      title: 'Second',
      type: 'switch',
      required: false,
      dependsOn: ['operation'],
      condition: { field: 'operation', value: 'extract_date_parts' },
    },
    {
      id: 'part_dayOfWeek',
      title: 'Day of Week',
      type: 'switch',
      required: false,
      dependsOn: ['operation'],
      condition: { field: 'operation', value: 'extract_date_parts' },
    },
    {
      id: 'part_monthName',
      title: 'Month Name',
      type: 'switch',
      required: false,
      dependsOn: ['operation'],
      condition: { field: 'operation', value: 'extract_date_parts' },
    },

    // ==========================
    // Next Day of Week inputs
    // ==========================
    {
      id: 'weekday',
      title: 'Weekday',
      type: 'dropdown',
      options: WEEKDAY_OPTIONS,
      value: () => '0',
      required: true,
      dependsOn: ['operation'],
      condition: {
        field: 'operation',
        value: 'next_day_of_week',
      },
    },

    // ==========================
    // Next Day of Year inputs
    // ==========================
    {
      id: 'month',
      title: 'Month',
      type: 'dropdown',
      options: MONTH_OPTIONS,
      value: () => '1',
      required: true,
      dependsOn: ['operation'],
      condition: {
        field: 'operation',
        value: 'next_day_of_year',
      },
    },
    {
      id: 'day',
      title: 'Day of Month',
      type: 'short-input',
      placeholder: '1-31',
      required: true,
      dependsOn: ['operation'],
      condition: {
        field: 'operation',
        value: 'next_day_of_year',
      },
    },

    // ===============================================
    // Time fields for next day operations
    // ===============================================
    {
      id: 'time',
      title: 'Time (24h HH:mm)',
      type: 'short-input',
      placeholder: '14:30',
      required: false,
      dependsOn: ['operation'],
      condition: {
        field: 'operation',
        value: [
          'next_day_of_week',
          'next_day_of_year',
          'first_day_previous_month',
          'last_day_previous_month',
        ],
      },
    },
    {
      id: 'currentTime',
      title: 'Use Current Time',
      type: 'switch',
      required: false,
      dependsOn: ['operation'],
      condition: {
        field: 'operation',
        value: [
          'next_day_of_week',
          'next_day_of_year',
          'first_day_previous_month',
          'last_day_previous_month',
        ],
      },
    },
  ],

  tools: {
    access: [
      'date_helper_get_current_date',
      'date_helper_format_date',
      'date_helper_add_subtract_date',
      'date_helper_date_difference',
      'date_helper_extract_date_parts',
      'date_helper_next_day_of_week',
      'date_helper_next_day_of_year',
      'date_helper_first_day_previous_month',
      'date_helper_last_day_previous_month',
    ],
    config: {
      tool: (params) => `date_helper_${params.operation}`,
      params: (params) => {
        const result: Record<string, any> = {}
        // Weekday dropdown returns a string id; convert to number
        if (params.weekday !== undefined && params.weekday !== '') {
          result.weekday = Number(params.weekday)
        }
        // Month dropdown returns a string id; convert to number
        if (params.month !== undefined && params.month !== '') {
          result.month = Number(params.month)
        }
        // Normalize date-difference format param names
        if (params.startDateFormat) {
          result.startFormat = params.startDateFormat
        }
        if (params.endDateFormat) {
          result.endFormat = params.endDateFormat
        }

        // Build units array from individual switch booleans.
        // Each switch subblock (unit_year, unit_month, …) is explicitly defined in
        // blockConfig.subBlocks so the serializer includes them in params.
        // If another block connects units directly as an array, use it as-is.
        if (params.units && Array.isArray(params.units)) {
          result.units = params.units
        } else {
          const unitMap: Array<[string, string]> = [
            ['unit_year', 'year'],
            ['unit_month', 'month'],
            ['unit_week', 'week'],
            ['unit_day', 'day'],
            ['unit_hour', 'hour'],
            ['unit_minute', 'minute'],
            ['unit_second', 'second'],
          ]
          const units: string[] = []
          for (const [key, val] of unitMap) {
            if (params[key] === true || params[key] === 'true') units.push(val)
          }
          if (units.length > 0) result.units = units
        }

        // Build parts array from individual switch booleans.
        if (params.parts && Array.isArray(params.parts)) {
          result.parts = params.parts
        } else {
          const partMap: Array<[string, string]> = [
            ['part_year', 'year'],
            ['part_month', 'month'],
            ['part_day', 'day'],
            ['part_hour', 'hour'],
            ['part_minute', 'minute'],
            ['part_second', 'second'],
            ['part_dayOfWeek', 'dayOfWeek'],
            ['part_monthName', 'monthName'],
          ]
          const parts: string[] = []
          for (const [key, val] of partMap) {
            if (params[key] === true || params[key] === 'true') parts.push(val)
          }
          if (parts.length > 0) result.parts = parts
        }
        return result
      },
    },
  },

  inputs: {
    operation: { type: 'string' },
    outputFormat: { type: 'string' },
    timeZone: { type: 'string' },
    inputDate: { type: 'string' },
    inputFormat: { type: 'string' },
    inputTimeZone: { type: 'string' },
    outputTimeZone: { type: 'string' },
    expression: { type: 'string' },
    setTime: { type: 'string' },
    startDate: { type: 'string' },
    startDateFormat: { type: 'string' },
    endDate: { type: 'string' },
    endDateFormat: { type: 'string' },
    units: { type: 'array' },
    parts: { type: 'array' },
    unit_year: { type: 'boolean' },
    unit_month: { type: 'boolean' },
    unit_week: { type: 'boolean' },
    unit_day: { type: 'boolean' },
    unit_hour: { type: 'boolean' },
    unit_minute: { type: 'boolean' },
    unit_second: { type: 'boolean' },
    part_year: { type: 'boolean' },
    part_month: { type: 'boolean' },
    part_day: { type: 'boolean' },
    part_hour: { type: 'boolean' },
    part_minute: { type: 'boolean' },
    part_second: { type: 'boolean' },
    part_dayOfWeek: { type: 'boolean' },
    part_monthName: { type: 'boolean' },
    weekday: { type: 'number' },
    month: { type: 'number' },
    day: { type: 'number' },
    time: { type: 'string' },
    currentTime: { type: 'boolean' },
  },

  outputs: {
    result: { type: 'string', description: 'Formatted date/time result' },
    year: { type: 'number', description: 'Year component' },
    month: { type: 'number', description: 'Month component' },
    day: { type: 'number', description: 'Day component' },
    hour: { type: 'number', description: 'Hour component' },
    minute: { type: 'number', description: 'Minute component' },
    second: { type: 'number', description: 'Second component' },
    dayOfWeek: { type: 'string', description: 'Day of week name' },
    monthName: { type: 'string', description: 'Month name' },
  },
}
