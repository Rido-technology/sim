import type { ToolConfig } from '@/tools/types'
import type { GetCurrentDateParams, GetCurrentDateResponse } from './types'
import { djs, getCorrectedFormat } from '@/lib/date'

export const getCurrentDateTool: ToolConfig<GetCurrentDateParams, GetCurrentDateResponse> = {
  id: 'date_helper_get_current_date',
  name: 'Get Current Date',
  description: 'Get the current date and time in a specified format and timezone',
  version: '1.0.0',

  params: {
    outputFormat: {
      type: 'string',
      required: true,
      description: 'The format for the output date',
    },
    timeZone: {
      type: 'string',
      required: true,
      description: 'The timezone for the output date',
    },
  },

  request: {
    url: '/api/tools/date-helper/get-current-date',
    method: 'POST',
    headers: () => ({
      'Content-Type': 'application/json',
    }),
    body: (params: GetCurrentDateParams) => ({
      outputFormat: params.outputFormat,
      timeZone: params.timeZone,
    }),
  },

  directExecution: async (params) => {
    const { outputFormat, timeZone } = params
    try {
      const format = getCorrectedFormat(outputFormat ?? '')
      const result = djs().tz(timeZone ?? 'UTC').format(format)
      return { success: true, output: { result } }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return { success: false, output: { error: errorMessage }, error: errorMessage }
    }
  },

  outputs: {
    result: {
      type: 'string',
      description: 'The current date and time in the specified format',
    },
  },
}
