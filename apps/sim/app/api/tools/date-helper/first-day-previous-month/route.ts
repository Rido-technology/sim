import { createLogger } from '@sim/logger'
import { parseDate, getCorrectedFormat } from '@/lib/date'
import { NextResponse } from 'next/server'

const logger = createLogger('date-helper:first-day-previous-month')

export async function POST(request: Request) {
  let body: any
  try {
    body = await request.json()
    const { startDate, inputFormat, outputFormat } = body

    const parsedDate = parseDate(startDate, inputFormat)

    const resultDate = parsedDate
      .subtract(1, 'month')
      .startOf('month')

    const result = resultDate.format(
      getCorrectedFormat(outputFormat)
    )

    logger.info('Found first day of previous month', {
      startDate,
      result,
    })

    return NextResponse.json({ result })
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to find first day of previous month'

    logger.error('Failed to find first day of previous month', {
      error: errorMessage,
      startDate: body?.startDate,
    })

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}