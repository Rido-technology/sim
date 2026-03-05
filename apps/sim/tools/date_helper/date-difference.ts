import type { ToolConfig } from '@/tools/types'
import type { DateDifferenceParams, DateDifferenceResponse } from './types'
import { parseDate } from '@/lib/date'
import { createLogger } from '@sim/logger'

const logger = createLogger('date-difference-tool')

export const dateDifferenceTool: ToolConfig<DateDifferenceParams, DateDifferenceResponse> = {
  id: 'date_helper_date_difference',
  name: 'Date Difference',
  description: 'Calculate the difference between two dates in various units',
  version: '1.1.0',

  params: {
    startDate: {
      type: 'string',
      required: false,
      description: 'The starting date',
    },
    endDate: {
      type: 'string',
      required: false,
      description: 'The ending date',
    },
    startFormat: {
      type: 'string',
      required: false,
      description: 'The format of the start date',
    },
    endFormat: {
      type: 'string',
      required: false,
      description: 'The format of the end date',
    },
    units: {
      type: 'array',
      required: false,
      description: 'Units to return (e.g., ["days", "hours", "minutes"])',
      items: { type: 'string' },
    },
  },

  request: {
    url: '/api/tools/date-helper/date-difference',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params: DateDifferenceParams) => ({
      startDate: params.startDate,
      endDate: params.endDate,
      startFormat: params.startFormat,
      endFormat: params.endFormat,
      units: params.units,
    }),
  },

  directExecution: async (params) => {
    const rawParams = params as any

    // Accept multiple aliases
    const startDate = rawParams.startDate ?? rawParams.date1
    const endDate = rawParams.endDate ?? rawParams.date2
    const startFormat = rawParams.startFormat ?? rawParams.startDateFormat ?? 'YYYY-MM-DD'
    const endFormat = rawParams.endFormat ?? rawParams.endDateFormat ?? 'YYYY-MM-DD'
    const units = (rawParams.units ?? ['day']) as string[]

    try {
      logger.info('[DateDifferenceTool] rawParams', { rawParams })
      // Validate required dates
      if (!startDate) throw new Error('startDate is required')
      if (!endDate) throw new Error('endDate is required')

      const start = parseDate(startDate, startFormat)
      const end = parseDate(endDate, endFormat)

      logger.info('[DateDifferenceTool] parsed', { start: start.toISOString(), end: end.toISOString(), startFormat, endFormat })

      if (!start.isValid() || !end.isValid()) {
        throw new Error(`Invalid date parsing: startDate=${startDate}, endDate=${endDate}`)
      }

      // Normalize units: accept string (comma-separated) or array
      let unitList: string[] = []
      if (Array.isArray(units)) unitList = units.map(String)
      else if (typeof units === 'string') unitList = (units as string).split(',')
      else unitList = ['day']

      // If UI sent an empty string (""), treat as no-selection and fall back to default
      if (unitList.length === 0 || (unitList.length === 1 && String(unitList[0]).trim() === '')) {
        logger.info('[DateDifferenceTool] units empty, falling back to default ["day"]')
        unitList = ['day']
      }

      const result: Record<string, number> = {}

      for (let unit of unitList) {
        const normalized = String(unit ?? '')
          .toLowerCase()
          .trim()
          .replace(/s$/, '') // singular form

        // dayjs expects certain unit strings; guard against invalid ones
        const allowed = ['year', 'month', 'week', 'day', 'hour', 'minute', 'second']
        if (!allowed.includes(normalized)) continue

        const diff = end.diff(start, normalized as any)
        logger.info('[DateDifferenceTool] diff', { unit: normalized, diff })
        if (isNaN(diff)) {
          throw new Error(`Failed to compute difference for unit: ${unit}`)
        }

        switch (normalized) {
          case 'year': result.years = diff; break
          case 'month': result.months = diff; break
          case 'week': result.weeks = diff; break
          case 'day': result.days = diff; break
          case 'hour': result.hours = diff; break
          case 'minute': result.minutes = diff; break
          case 'second': result.seconds = diff; break
        }
      }

      return { success: true, output: result }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logger.error('[DateDifferenceTool] Error', { error: errorMessage })
      return { success: false, output: { error: errorMessage }, error: errorMessage }
    }
  },

  outputs: {
    days: { type: 'number', description: 'Difference in days', optional: true },
    hours: { type: 'number', description: 'Difference in hours', optional: true },
    minutes: { type: 'number', description: 'Difference in minutes', optional: true },
    seconds: { type: 'number', description: 'Difference in seconds', optional: true },
    weeks: { type: 'number', description: 'Difference in weeks', optional: true },
    months: { type: 'number', description: 'Difference in months', optional: true },
    years: { type: 'number', description: 'Difference in years', optional: true },
  },
}