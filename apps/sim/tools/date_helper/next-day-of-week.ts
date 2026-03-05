import type { ToolConfig } from '@/tools/types'
import type { NextDayOfWeekParams, NextDayOfWeekResponse } from './types'
import { djs, getCorrectedFormat } from '@/lib/date'

export const nextDayOfWeekTool: ToolConfig<NextDayOfWeekParams, NextDayOfWeekResponse> = {
  id: 'date_helper_next_day_of_week',
  name: 'Next Day of Week',
  description: 'Find the next occurrence of a specific day of the week from today',
  version: '1.0.0',

  params: {
    weekday: {
      type: 'number',
      required: true,
      description: 'Target weekday (0=Sunday, 1=Monday, …, 6=Saturday)',
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
    url: '/api/tools/date-helper/next-day-of-week',
    method: 'POST',
    headers: () => ({
      'Content-Type': 'application/json',
    }),
    body: (params: NextDayOfWeekParams) => ({
      weekday: params.weekday,
      time: params.time,
      currentTime: params.currentTime,
      outputFormat: params.outputFormat,
      timeZone: params.timeZone,
    }),
  },

  directExecution: async (params) => {
    const { weekday, time, currentTime, outputFormat, timeZone } = params as any
    try {
      const targetDay = Number(weekday)
      const now = djs().tz(timeZone ?? 'UTC')
      const currentDay = now.day()

      let daysToAdd = targetDay - currentDay
      if (daysToAdd <= 0) daysToAdd += 7

      let result = now.add(daysToAdd, 'day')

      if (time && !currentTime) {
        const [h, m] = String(time).split(':').map(Number)
        if (!Number.isNaN(h) && !Number.isNaN(m)) {
          result = result.hour(h).minute(m).second(0).millisecond(0)
        }
      } else if (!currentTime) {
        result = result.startOf('day')
      }

      return { success: true, output: { result: result.format(getCorrectedFormat(outputFormat ?? '')) } }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return { success: false, output: { error: errorMessage }, error: errorMessage }
    }
  },

  outputs: {
    result: {
      type: 'string',
      description: 'The next occurrence of the target day',
    },
  },
}
