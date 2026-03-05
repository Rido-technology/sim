import { createLogger } from '@sim/logger'
import { parseDate, getCorrectedFormat } from '@/lib/date'
import { NextResponse } from 'next/server'

const logger = createLogger('date-helper:next-day-of-week')

export async function POST(request: Request) {
  let body: any
  try {
    body = await request.json()
    const { startDate, inputFormat, targetDay, outputFormat, includeToday = false } = body
    
    const parsedDate = parseDate(startDate, inputFormat)
    
    // Map day names to dayjs day numbers (0 = Sunday, 6 = Saturday)
    const dayMap: Record<string, number> = {
      sunday: 0, sun: 0,
      monday: 1, mon: 1,
      tuesday: 2, tue: 2,
      wednesday: 3, wed: 3,
      thursday: 4, thu: 4,
      friday: 5, fri: 5,
      saturday: 6, sat: 6,
    }
    
    const targetDayNumber = dayMap[targetDay.toLowerCase()]
    if (targetDayNumber === undefined) {
      throw new Error(`Invalid target day: ${targetDay}`)
    }
    
    const currentDay = parsedDate.day()
    let daysToAdd = targetDayNumber - currentDay
    
    if (daysToAdd < 0) {
      daysToAdd += 7
    }
    
    if (daysToAdd === 0 && !includeToday) {
      daysToAdd = 7
    }
    
    const result = parsedDate.add(daysToAdd, 'day').format(getCorrectedFormat(outputFormat))
    
    logger.info('Found next day of week', { startDate, targetDay, result })
    
    return NextResponse.json({ result })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to find next day of week'
    logger.error('Failed to find next day of week', { 
      error: errorMessage,
      startDate: body?.startDate,
      targetDay: body?.targetDay,
    })
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
