import { createLogger } from '@sim/logger'
import { parseDate } from '@/lib/date'
import { NextResponse } from 'next/server'

const logger = createLogger('date-helper:date-difference')

export async function POST(request: Request) {
  let body: any
  try {
    body = await request.json()
    const { startDate, endDate, startFormat, endFormat, units } = body
    
    const start = parseDate(startDate, startFormat)
    const end = parseDate(endDate, endFormat)
    
    const result: Record<string, number> = {}
    
    for (const unit of units) {
      const raw = String(unit ?? '')
      const normalized = raw.toLowerCase().trim().replace(/s$/,'')
      switch (normalized) {
        case 'year':
          result.years = end.diff(start, 'year')
          break
        case 'month':
          result.months = end.diff(start, 'month')
          break
        case 'week':
          result.weeks = end.diff(start, 'week')
          break
        case 'day':
          result.days = end.diff(start, 'day')
          break
        case 'hour':
          result.hours = end.diff(start, 'hour')
          break
        case 'minute':
          result.minutes = end.diff(start, 'minute')
          break
        case 'second':
          result.seconds = end.diff(start, 'second')
          break
      }
    }
    
    logger.info('Calculated date difference', { startDate, endDate, units, result })
    
    return NextResponse.json(result)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to calculate date difference'
    logger.error('Failed to calculate date difference', { 
      error: errorMessage,
      startDate: body?.startDate,
      endDate: body?.endDate,
    })
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
