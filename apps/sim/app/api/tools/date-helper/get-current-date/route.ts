import { createLogger } from '@sim/logger'
import { djs, getCorrectedFormat } from '@/lib/date'
import { NextResponse } from 'next/server'

const logger = createLogger('date-helper:get-current-date')

export async function POST(request: Request) {
  try {
    const { outputFormat, timeZone } = await request.json()
    
    const format = getCorrectedFormat(outputFormat)
    const result = djs().tz(timeZone).format(format)
    
    logger.info('Generated current date', { outputFormat, timeZone, result })
    
    return NextResponse.json({ result })
  } catch (error) {
    logger.error('Failed to get current date', { error })
    return NextResponse.json(
      { error: 'Failed to get current date' },
      { status: 500 }
    )
  }
}
