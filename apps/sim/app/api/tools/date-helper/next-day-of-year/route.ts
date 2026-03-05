import { createLogger } from '@sim/logger'
import { parseDate, getCorrectedFormat } from '@/lib/date'
import { NextResponse } from 'next/server'

const logger = createLogger('date-helper:next-day-of-year')

export async function POST(request: Request) {
  let body: any
  try {
    body = await request.json()
    const { 
      startDate, 
      inputFormat, 
      targetDayOfYear, 
      outputFormat, 
      includeToday = false 
    } = body

    const parsedDate = parseDate(startDate, inputFormat)

    if (
      typeof targetDayOfYear !== 'number' ||
      targetDayOfYear < 1 ||
      targetDayOfYear > 366
    ) {
      throw new Error(`Invalid target day of year: ${targetDayOfYear}`)
    }

    const currentDayOfYear = parsedDate.dayOfYear()

    let resultDate = parsedDate.year(parsedDate.year()).dayOfYear(targetDayOfYear)

    if (
      targetDayOfYear < currentDayOfYear ||
      (targetDayOfYear === currentDayOfYear && !includeToday)
    ) {
      resultDate = parsedDate
        .add(1, 'year')
        .dayOfYear(targetDayOfYear)
    }

    const result = resultDate.format(
      getCorrectedFormat(outputFormat)
    )

    logger.info('Found next day of year', { 
      startDate, 
      targetDayOfYear, 
      result 
    })

    return NextResponse.json({ result })
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to find next day of year'

    logger.error('Failed to find next day of year', {
      error: errorMessage,
      startDate: body?.startDate,
      targetDayOfYear: body?.targetDayOfYear,
    })

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}