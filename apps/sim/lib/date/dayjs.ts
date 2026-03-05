import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import duration from 'dayjs/plugin/duration'
import dayOfYear from 'dayjs/plugin/dayOfYear'

/**
 * Configure dayjs with all necessary plugins
 */
function extendDayJs(): typeof dayjs {
  dayjs.extend(customParseFormat)
  dayjs.extend(advancedFormat)
  dayjs.extend(utc)
  dayjs.extend(timezone)
  dayjs.extend(duration)
  dayjs.extend(dayOfYear)
  return dayjs
}

export const djs = extendDayJs()
