import type { ToolConfig } from '@/tools/types'
import type { AddSubtractDateParams, AddSubtractDateResponse } from './types'
import { djs, getCorrectedFormat, parseDate } from '@/lib/date'

export const addSubtractDateTool: ToolConfig<AddSubtractDateParams, AddSubtractDateResponse> = {
  id: 'date_helper_add_subtract_date',
  name: 'Add/Subtract Date',
  description: 'Add or subtract time from a date using expressions like "+2 hour -1 day"',
  version: '1.0.0',

  params: {
    inputDate: {
      type: 'string',
      required: true,
      description: 'The starting date',
    },
    inputFormat: {
      type: 'string',
      required: true,
      description: 'The format of the input date',
    },
    expression: {
      type: 'string',
      required: true,
      description: 'Time to add/subtract (e.g., "+2 hour -1 day")',
    },
    outputFormat: {
      type: 'string',
      required: true,
      description: 'The desired output format',
    },
    timeZone: {
      type: 'string',
      required: false,
      description: 'The timezone for the output date',
    },
    setTime: {
      type: 'string',
      required: false,
      description: 'Optional: Set a specific time (24-hour format HH:mm)',
    },
  },

  request: {
    url: '/api/tools/date-helper/add-subtract-date',
    method: 'POST',
    headers: () => ({
      'Content-Type': 'application/json',
    }),
    body: (params: AddSubtractDateParams) => ({
      inputDate: params.inputDate,
      inputFormat: params.inputFormat,
      expression: params.expression,
      outputFormat: params.outputFormat,
      timeZone: params.timeZone,
      setTime: params.setTime,
    }),
  },

  directExecution: async (params) => {
    const { inputDate, inputFormat, expression, outputFormat, timeZone, setTime } = params
    try {
      let parsedDate = parseDate(inputDate, inputFormat ?? '')

      const unitMap: Record<string, string> = {
        year: 'year', years: 'year',
        month: 'month', months: 'month',
        week: 'week', weeks: 'week',
        day: 'day', days: 'day',
        hour: 'hour', hours: 'hour',
        minute: 'minute', minutes: 'minute',
        second: 'second', seconds: 'second',
      }

      const tokens = (expression ?? '').trim().split(/\s+/)
      for (let i = 0; i < tokens.length; i += 2) {
        const operator = tokens[i]
        const unit = tokens[i + 1]
        if (!operator || !unit) continue
        const value = Number.parseInt(operator, 10)
        if (Number.isNaN(value)) continue
        const dayjsUnit = unitMap[unit.toLowerCase()]
        if (dayjsUnit) {
          parsedDate = parsedDate.add(value, dayjsUnit as any)
        }
      }

      if (setTime) {
        const [hours, minutes] = setTime.split(':').map(Number)
        if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
          parsedDate = parsedDate.hour(hours).minute(minutes).second(0)
        }
      }

      if (timeZone) {
        parsedDate = parsedDate.tz(timeZone)
      }

      const result = parsedDate.format(getCorrectedFormat(outputFormat ?? ''))
      return { success: true, output: { result } }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return { success: false, output: { error: errorMessage }, error: errorMessage }
    }
  },

  outputs: {
    result: {
      type: 'string',
      description: 'The calculated date in the specified format',
    },
  },
}
