import { createLogger } from '@sim/logger'
import { parseDate } from '@/lib/date'
import { NextResponse } from 'next/server'

const logger = createLogger('date-helper:extract-date-parts')

export async function POST(request: Request) {
  try {
    const { inputDate, inputFormat, parts } = await request.json()
    
    const parsedDate = parseDate(inputDate, inputFormat)
    const result: Record<string, string | number> = {}
    
    for (const part of parts) {
      switch (part) {
        case 'year':
          result.year = parsedDate.year()
          break
        case 'month':
          result.month = parsedDate.month() + 1
          break
        case 'day':
          result.day = parsedDate.date()
          break
        case 'hour':
          result.hour = parsedDate.hour()
          break
        case 'minute':
          result.minute = parsedDate.minute()
          break
        case 'second':
          result.second = parsedDate.second()
          break
        case 'dayOfWeek':
          result.dayOfWeek = parsedDate.format('dddd')
          break
        case 'monthName':
          result.monthName = parsedDate.format('MMMM')
          break
      }
    }
    
    logger.info('Extracted date parts', { inputDate, parts: Object.keys(result) })
    
    return NextResponse.json(result)
  } catch (error) {
    logger.error('Failed to extract date parts', { error })
    return NextResponse.json(
      { error: 'Failed to extract date parts' },
      { status: 500 }
    )
  }
}
