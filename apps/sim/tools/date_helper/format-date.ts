import type { ToolConfig } from '@/tools/types'
import type { FormatDateParams, FormatDateResponse } from './types'
import { djs, getCorrectedFormat, parseDate } from '@/lib/date'

export const formatDateTool: ToolConfig<FormatDateParams, FormatDateResponse> = {
  id: 'date_helper_format_date',
  name: 'Format Date',
  description: 'Convert a date from one format to another with timezone support',
  version: '1.0.0',

  params: {
    inputDate: {
      type: 'string',
      required: true,
      description: 'The date to format',
    },
    inputFormat: {
      type: 'string',
      required: true,
      description: 'The format of the input date',
    },
    outputFormat: {
      type: 'string',
      required: true,
      description: 'The desired output format',
    },
    inputTimeZone: {
      type: 'string',
      required: false,
      description: 'The timezone of the input date (optional)',
    },
    outputTimeZone: {
      type: 'string',
      required: false,
      description: 'The timezone for the output date (optional)',
    },
  },

  request: {
    url: '/api/tools/date-helper/format-date',
    method: 'POST',
    headers: () => ({
      'Content-Type': 'application/json',
    }),
    body: (params: FormatDateParams) => ({
      inputDate: params.inputDate,
      inputFormat: params.inputFormat,
      outputFormat: params.outputFormat,
      inputTimeZone: params.inputTimeZone,
      outputTimeZone: params.outputTimeZone,
    }),
  },

  directExecution: async (params) => {
    const { inputDate, inputFormat, outputFormat, inputTimeZone, outputTimeZone } = params
    try {
      const parsedDate = parseDate(inputDate, inputFormat ?? '')

      let dateToFormat = parsedDate
      if (inputTimeZone) {
        dateToFormat = parsedDate.tz(inputTimeZone)
      }
      if (outputTimeZone) {
        dateToFormat = dateToFormat.tz(outputTimeZone)
      }

      const result = dateToFormat.format(getCorrectedFormat(outputFormat ?? ''))
      return { success: true, output: { result } }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return { success: false, output: { error: errorMessage }, error: errorMessage }
    }
  },

  outputs: {
    result: {
      type: 'string',
      description: 'The formatted date string',
    },
  },
}
