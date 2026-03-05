import { createLogger } from '@sim/logger'
import { getCorrectedFormat, parseDate, djs } from '@/lib/date'
import { NextResponse } from 'next/server'

const logger = createLogger('date-helper:format-date')

export async function POST(request: Request) {
  let body: any
  try {
    body = await request.json()
    const { inputDate, inputFormat, outputFormat, inputTimeZone, outputTimeZone } = body
    
    const parsedDate = parseDate(inputDate, inputFormat)
    
    let dateToFormat = parsedDate
    if (inputTimeZone) {
      dateToFormat = parsedDate.tz(inputTimeZone)
    }
    
    if (outputTimeZone) {
      dateToFormat = dateToFormat.tz(outputTimeZone)
    }
    
    const format = getCorrectedFormat(outputFormat)
    const result = dateToFormat.format(format)
    
    logger.info('Formatted date', { inputDate, inputFormat, outputFormat, result })
    
    return NextResponse.json({ result })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to format date'
    logger.error('Failed to format date', { 
      error: errorMessage,
      inputDate: body?.inputDate,
      inputFormat: body?.inputFormat,
    })
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
