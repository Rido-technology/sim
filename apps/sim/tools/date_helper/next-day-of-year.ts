import type { ToolConfig } from '@/tools/types'
import type { NextDayOfYearParams, NextDayOfYearResponse } from './types'
import { djs, getCorrectedFormat } from '@/lib/date'

export const nextDayOfYearTool: ToolConfig<NextDayOfYearParams, NextDayOfYearResponse> = {
  id: 'date_helper_next_day_of_year',
  name: 'Next Day of Year',
  description: 'Find the next occurrence of a specific date (month and day) from today',
  version: '1.0.0',

  params: {
    month: {
      type: 'number',
      required: true,
      description: 'The target month (1-12)',
    },
    day: {
      type: 'number',
      required: true,
      description: 'The target day of month (1-31)',
    },
    time: {
      type: 'string',
      required: false,
      description: 'Set a specific time on the result date (24-hour HH:mm)',
    },
    currentTime: {
      type: 'boolean',
      required: false,
      description: 'Preserve the current time of day',
    },
    outputFormat: {
      type: 'string',
      required: true,
      description: 'The desired output format',
    },
    timeZone: {
      type: 'string',
      required: true,
      description: 'Timezone for the result',
    },
  },

  request: {
    url: '/api/tools/date-helper/next-day-of-year',
    method: 'POST',
    headers: () => ({
      'Content-Type': 'application/json',
    }),
    body: (params: NextDayOfYearParams) => ({
      month: params.month,
      day: params.day,
      time: params.time,
      currentTime: params.currentTime,
      outputFormat: params.outputFormat,
      timeZone: params.timeZone,
    }),
  },

  directExecution: async (params) => {
    const { month, day, time, currentTime, outputFormat, timeZone } = params as any
    try {
      const now = djs().tz(timeZone ?? 'UTC')
      let target = now
        .month(Number(month) - 1)
        .date(Number(day))

      if (target.isBefore(now, 'day')) {
        target = target.add(1, 'year')
      }

      if (time && !currentTime) {
        const [h, m] = String(time).split(':').map(Number)
        if (!Number.isNaN(h) && !Number.isNaN(m)) {
          target = target.hour(h).minute(m).second(0).millisecond(0)
        }
      } else if (!currentTime) {
        target = target.startOf('day')
      }

      return { success: true, output: { result: target.format(getCorrectedFormat(outputFormat ?? '')) } }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return { success: false, output: { error: errorMessage }, error: errorMessage }
    }
  },

  outputs: {
    result: {
      type: 'string',
      description: 'The next occurrence of the target date',
    },
  },
}
