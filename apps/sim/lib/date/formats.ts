import type { Dayjs } from 'dayjs'
import { djs } from './dayjs'

export const TIME_FORMATS = {
  format00: 'DDD MMM DD YYYY HH:mm:ss',
  format01: 'DDD MMM DD HH:mm:ss YYYY',
  format02: 'MMMM DD YYYY HH:mm:ss',
  format03: 'MMMM DD YYYY',
  format04: 'MMM DD YYYY',
  format05: 'YYYY-MM-DDTHH:mm:ss',
  format06: 'YYYY-MM-DD HH:mm:ss',
  format07: 'YYYY-MM-DD',
  format08: 'MM-DD-YYYY',
  format09: 'MM/DD/YYYY',
  format10: 'MM/DD/YY',
  format11: 'DD-MM-YYYY',
  format12: 'DD/MM/YYYY',
  format13: 'DD/MM/YY',
  format14: 'X',
} as const

export const TIME_FORMAT_OPTIONS = [
  { label: 'DDD MMM DD YYYY HH:mm:ss (Sun Sep 17 2023 11:23:58)', value: TIME_FORMATS.format00 },
  { label: 'DDD MMM DD HH:mm:ss YYYY (Sun Sep 17 11:23:58 2023)', value: TIME_FORMATS.format01 },
  { label: 'MMMM DD YYYY HH:mm:ss (September 17 2023 11:23:58)', value: TIME_FORMATS.format02 },
  { label: 'MMMM DD YYYY (September 17 2023)', value: TIME_FORMATS.format03 },
  { label: 'MMM DD YYYY (Sep 17 2023)', value: TIME_FORMATS.format04 },
  { label: 'YYYY-MM-DDTHH:mm:ss (2023-09-17T11:23:58)', value: TIME_FORMATS.format05 },
  { label: 'YYYY-MM-DD HH:mm:ss (2023-09-17 11:23:58)', value: TIME_FORMATS.format06 },
  { label: 'YYYY-MM-DD (2023-09-17)', value: TIME_FORMATS.format07 },
  { label: 'MM-DD-YYYY (09-17-2023)', value: TIME_FORMATS.format08 },
  { label: 'MM/DD/YYYY (09/17/2023)', value: TIME_FORMATS.format09 },
  { label: 'MM/DD/YY (09/17/23)', value: TIME_FORMATS.format10 },
  { label: 'DD-MM-YYYY (17-09-2023)', value: TIME_FORMATS.format11 },
  { label: 'DD/MM/YYYY (17/09/2023)', value: TIME_FORMATS.format12 },
  { label: 'DD/MM/YY (17/09/23)', value: TIME_FORMATS.format13 },
  { label: 'X (1694949838) - Unix Timestamp', value: TIME_FORMATS.format14 },
]

/**
 * Correct DDDD/DDD to dddd/ddd for dayjs compatibility
 */
export function getCorrectedFormat(format: string): string {
  return format.replaceAll('DDDD', 'dddd').replaceAll('DDD', 'ddd')
}

/**
 * Parse date with fallback strategies.
 * Order: strict format → native (ISO/standard) → non-strict format.
 * Native parsing is preferred over non-strict to avoid returning a
 * technically-"valid" dayjs object with garbage values when the user
 * supplies a format token that doesn't match the actual date string.
 */
export function parseDate(date: string, format: string): Dayjs {
  const correctedFormat = getCorrectedFormat(format)

  // 1. Strict format parsing
  let parsed = djs(date, correctedFormat, true)

  // 2. Native format-free parsing (handles ISO 8601, timestamps, etc.)
  if (!parsed.isValid()) {
    parsed = djs(date)
  }

  // 3. Non-strict format parsing as last resort
  if (!parsed.isValid()) {
    parsed = djs(date, correctedFormat, false)
  }

  if (!parsed.isValid()) {
    throw new Error(`Failed to parse date: ${date} with format: ${correctedFormat}`)
  }

  return parsed
}
