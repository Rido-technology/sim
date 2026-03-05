export interface GetCurrentDateParams {
  outputFormat: string
  timeZone: string
}

export interface GetCurrentDateResponse {
  result: string
}

export interface FormatDateParams {
  inputDate: string
  inputFormat: string
  outputFormat: string
  inputTimeZone?: string
  outputTimeZone?: string
}

export interface FormatDateResponse {
  result: string
}

export interface AddSubtractDateParams {
  inputDate: string
  inputFormat: string
  expression: string
  outputFormat: string
  timeZone?: string
  setTime?: string
}

export interface AddSubtractDateResponse {
  result: string
}

export interface DateDifferenceParams {
  startDate: string
  startDateFormat: string
  /** Alternate param name used by some callers */
  startFormat?: string
  endDate: string
  endDateFormat: string
  /** Alternate param name used by some callers */
  endFormat?: string
  units: string[]
}

export interface DateDifferenceResponse {
  years?: number
  months?: number
  weeks?: number
  days?: number
  hours?: number
  minutes?: number
  seconds?: number
}

export interface ExtractDatePartsParams {
  inputDate: string
  inputFormat: string
  parts: string[]
  timeZone?:String
}

export interface ExtractDatePartsResponse {
  year?: number
  month?: number
  day?: number
  hour?: number
  minute?: number
  second?: number
  dayOfWeek?: string
  monthName?: string
}

export interface NextDayOfWeekParams {
  weekday: number
  time?: string
  currentTime?: boolean
  outputFormat: string
  timeZone: string
}

export interface NextDayOfWeekResponse {
  result: string
}

export interface NextDayOfYearParams {
  month: number
  day: number
  time?: string
  currentTime?: boolean
  outputFormat: string
  timeZone: string
}

export interface NextDayOfYearResponse {
  result: string
}

export interface FirstDayOfPreviousMonthParams {
  time?: string
  currentTime?: boolean
  outputFormat: string
  timeZone: string
}

export interface FirstDayOfPreviousMonthResponse {
  result: string
}

export interface LastDayOfPreviousMonthParams {
  time?: string
  currentTime?: boolean
  outputFormat: string
  timeZone: string
}

/** @deprecated Route-only param name kept for API backward compatibility */
export interface DateDifferenceRouteParams {
  startDate: string
  endDate: string
  startFormat?: string
  startDateFormat?: string
  endFormat?: string
  endDateFormat?: string
  units: string[]
}

export interface LastDayOfPreviousMonthResponse {
  result: string
}

export const TIME_UNITS = ['year', 'month', 'day', 'hour', 'minute', 'second'] as const
export const DATE_PARTS = ['year', 'month', 'day', 'hour', 'minute', 'second', 'dayOfWeek', 'monthName'] as const
export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as const
