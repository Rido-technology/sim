import type { ToolConfig } from '@/tools/types'
import type { LastDayOfPreviousMonthParams, LastDayOfPreviousMonthResponse } from './types'
import { djs, getCorrectedFormat } from '@/lib/date'

export const lastDayOfPreviousMonthTool: ToolConfig<
  LastDayOfPreviousMonthParams,
  LastDayOfPreviousMonthResponse
> = {
  id: 'date_helper_last_day_previous_month',
  name: 'Last Day of Previous Month',
  description: 'Get the last day of the previous calendar month',
  version: '1.0.0',

  params: {
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
    url: '/api/tools/date-helper/last-day-previous-month',
    method: 'POST',
    headers: () => ({
      'Content-Type': 'application/json',
    }),
    body: (params: LastDayOfPreviousMonthParams) => ({
      time: params.time,
      currentTime: params.currentTime,
      outputFormat: params.outputFormat,
      timeZone: params.timeZone,
    }),
  },

  directExecution: async (params) => {
    const { time, currentTime, outputFormat, timeZone } = params as any
    try {
      const now = djs().tz(timeZone ?? 'UTC')
      let target = now.subtract(1, 'month').endOf('month')

      if (time && !currentTime) {
        const [h, m] = String(time).split(':').map(Number)
        if (!Number.isNaN(h) && !Number.isNaN(m)) {
          target = target.hour(h).minute(m).second(0).millisecond(0)
        }
      } else if (currentTime) {
        target = target.hour(now.hour()).minute(now.minute()).second(now.second())
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
      description: 'The last day of the previous month',
    },
  },
}
