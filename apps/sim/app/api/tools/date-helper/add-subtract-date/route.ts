import { createLogger } from '@sim/logger'
import { parseDate, getCorrectedFormat, djs } from '@/lib/date'
import { NextResponse } from 'next/server'

const logger = createLogger('date-helper:add-subtract-date')

export async function POST(request: Request) {
  let body: any
  try {
    body = await request.json()
    const { inputDate, inputFormat, expression, outputFormat, timeZone, setTime } = body
    
    let parsedDate = parseDate(inputDate, inputFormat)
    
    // Parse expression like "+2 hour -1 day"
    const tokens = expression.trim().split(/\s+/)
    for (let i = 0; i < tokens.length; i += 2) {
      const operator = tokens[i]
      const unit = tokens[i + 1]
      
      if (!operator || !unit) continue
      
      const value = Number.parseInt(operator, 10)
      if (Number.isNaN(value)) continue
      
      // Map unit to dayjs unit type
      const unitMap: Record<string, any> = {
        year: 'year', years: 'year',
        month: 'month', months: 'month',
        week: 'week', weeks: 'week',
        day: 'day', days: 'day',
        hour: 'hour', hours: 'hour',
        minute: 'minute', minutes: 'minute',
        second: 'second', seconds: 'second',
      }
      
      const dayjsUnit = unitMap[unit.toLowerCase()]
      if (dayjsUnit) {
        parsedDate = parsedDate.add(value, dayjsUnit)
      }
    }
    
    // Set specific time if provided
    if (setTime) {
      const [hours, minutes] = setTime.split(':').map(Number)
      if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
        parsedDate = parsedDate.hour(hours).minute(minutes).second(0)
      }
    }
    
    // Apply timezone if provided
    if (timeZone) {
      parsedDate = parsedDate.tz(timeZone)
    }
    
    const format = getCorrectedFormat(outputFormat)
    const result = parsedDate.format(format)
    
    logger.info('Added/subtracted date', { inputDate, expression, result })
    
    return NextResponse.json({ result })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to add/subtract date'
    logger.error('Failed to add/subtract date', { 
      error: errorMessage,
      inputDate: body?.inputDate,
      expression: body?.expression,
    })
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
