import type { ToolResponse } from '@/tools/types'

export interface BinanceFetchPairPriceParams {
  firstCoinSymbol: string
  secondCoinSymbol: string
}

export interface BinanceFetchPairPriceResponse extends ToolResponse {
  output: {
    symbol: string
    price: string
    priceNumber: number
    raw?: unknown
  }
}

