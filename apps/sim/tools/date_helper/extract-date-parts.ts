import type { ToolConfig } from '@/tools/types'
import type { ExtractDatePartsParams, ExtractDatePartsResponse } from './types'
import { parseDate, djs } from '@/lib/date'
import { createLogger } from '@sim/logger'

const logger = createLogger('extract-date-parts-tool')

export const extractDatePartsTool: ToolConfig<ExtractDatePartsParams, ExtractDatePartsResponse> = {
  id: 'date_helper_extract_date_parts',
  name: 'Extract Date Parts',
  description: 'Extract individual components (year, month, day, etc.) from a date',
  version: '1.0.0',

  params: {
    inputDate: {
      type: 'string',
      required: true,
      description: 'The date to extract parts from',
    },
    inputFormat: {
      type: 'string',
      required: true,
      description: 'The format of the input date',
    },
    parts: {
      type: 'array',
      required: true,
      description: 'Parts to extract (e.g., ["year", "month", "day"])',
      items: {
        type: 'string',
      },
    },
    timeZone: {
      type: 'string',
      required: false,
      description: 'The timezone for the date',
    },
  },

  request: {
    url: '/api/tools/date-helper/extract-date-parts',
    method: 'POST',
    headers: () => ({
      'Content-Type': 'application/json',
    }),
    body: (params: ExtractDatePartsParams) => ({
      inputDate: params.inputDate,
      inputFormat: params.inputFormat,
      parts: params.parts,
      timeZone: params.timeZone,
    }),
  },

  directExecution: async (params) => {
    const { inputDate, inputFormat, parts, timeZone } = params as any
    try {
      logger.info('[ExtractDateParts] input', { inputDate, inputFormat, parts, timeZone })
      let parsedDate = parseDate(inputDate, inputFormat ?? '')
      if (timeZone) {
        parsedDate = parsedDate.tz(timeZone)
      }

      logger.info('[ExtractDateParts] parsed', { valid: parsedDate.isValid(), iso: parsedDate.toISOString?.() })

      const result: Record<string, string | number> = {}
      for (const part of (parts as string[] ?? [])) {
        switch (part) {
          case 'year': result.year = parsedDate.year(); break
          case 'month': result.month = parsedDate.month() + 1; break
          case 'day': result.day = parsedDate.date(); break
          case 'hour': result.hour = parsedDate.hour(); break
          case 'minute': result.minute = parsedDate.minute(); break
          case 'second': result.second = parsedDate.second(); break
          case 'dayOfWeek': // 0 = Sunday, 6 = Saturday
            result.dayOfWeek = parsedDate.day()
            break
          case 'monthName': // e.g. "September"
            result.monthName = parsedDate.format('MMMM')
            break
          case 'dayOfYear': // 1-366 (requires dayOfYear plugin)
            // dayOfYear() is available because dayjs plugin was enabled in lib/date/dayjs.ts
            // ts-expect-error - dayjs plugin method
            result.dayOfYear = parsedDate.dayOfYear()
            break
          case 'weekOfYear': // ISO week number (calculate manually)
            // ISO week: week starting Monday, week 1 contains Jan 4
            // Compute using UTC to avoid timezone drift
            const tmp = parsedDate.utc()
            const thursday = tmp.add(4 - ((tmp.day() || 7)), 'day')
            const yearStart = djs(thursday.year(), 'YYYY').utc()
            // ts-expect-error - dayjs diff typings
            result.weekOfYear = Math.floor(thursday.diff(yearStart, 'day') / 7) + 1
            break
          case 'quarter':
            result.quarter = Math.ceil((parsedDate.month() + 1) / 3)
            break
        }
      }
      logger.info('[ExtractDateParts] output', { result })
      return { success: true, output: result }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logger.error('[ExtractDateParts] Error', { error: errorMessage })
      return { success: false, output: { error: errorMessage }, error: errorMessage }
    }
  },

  outputs: {
    year: {
      type: 'number',
      description: 'The year',
      optional: true,
    },
    month: {
      type: 'number',
      description: 'The month (1-12)',
      optional: true,
    },
    day: {
      type: 'number',
      description: 'The day of month (1-31)',
      optional: true,
    },
    hour: {
      type: 'number',
      description: 'The hour (0-23)',
      optional: true,
    },
    minute: {
      type: 'number',
      description: 'The minute (0-59)',
      optional: true,
    },
    second: {
      type: 'number',
      description: 'The second (0-59)',
      optional: true,
    },
    dayOfWeek: {
      type: 'number',
      description: 'The day of week (0=Sunday, 6=Saturday)',
      optional: true,
    },
    dayOfYear: {
      type: 'number',
      description: 'The day of year (1-366)',
      optional: true,
    },
    weekOfYear: {
      type: 'number',
      description: 'The ISO week number',
      optional: true,
    },
    quarter: {
      type: 'number',
      description: 'The quarter (1-4)',
      optional: true,
    },
  },
}
