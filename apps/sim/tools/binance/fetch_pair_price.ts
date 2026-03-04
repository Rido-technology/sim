import type {
  BinanceFetchPairPriceParams,
  BinanceFetchPairPriceResponse,
} from '@/tools/binance/types'
import type { ToolConfig } from '@/tools/types'

export const binanceFetchPairPriceTool: ToolConfig<
  BinanceFetchPairPriceParams,
  BinanceFetchPairPriceResponse
> = {
  id: 'binance_fetch_pair_price',
  name: 'Binance Fetch Pair Price',
  description:
    'Fetch the latest spot price for a trading pair on Binance (e.g. BTC/USDT).',
  version: '1.0.0',

  params: {
    firstCoinSymbol: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: "The currency to fetch the price for (e.g. 'BTC' in 'BTC/USDT').",
    },
    secondCoinSymbol: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: "The currency to fetch the price in (e.g. 'USDT' in 'BTC/USDT').",
    },
  },

  request: {
    url: (params: BinanceFetchPairPriceParams) => {
      const base = params.firstCoinSymbol.trim().toUpperCase()
      const quote = params.secondCoinSymbol.trim().toUpperCase()
      const symbol = `${base}${quote}`

      return `https://api.binance.com/api/v3/ticker/price?symbol=${encodeURIComponent(symbol)}`
    },
    method: 'GET',
    headers: () => ({
      'Content-Type': 'application/json',
    }),
  },

  transformResponse: async (
    response: Response,
    params?: BinanceFetchPairPriceParams
  ): Promise<BinanceFetchPairPriceResponse> => {
    const data = await response.json().catch(() => null)

    const base = params?.firstCoinSymbol?.trim().toUpperCase() ?? ''
    const quote = params?.secondCoinSymbol?.trim().toUpperCase() ?? ''
    const requestedSymbol = base && quote ? `${base}${quote}` : data?.symbol ?? ''

    if (!response.ok || !data || typeof data.price !== 'string') {
      return {
        success: false,
        output: {
          symbol: (data && typeof data.symbol === 'string' && data.symbol) || requestedSymbol,
          price: (data && typeof data.price === 'string' && data.price) || '',
          priceNumber:
            data && typeof data.price === 'string' ? Number(data.price) : Number.NaN,
          raw: data ?? undefined,
        },
        error:
          (data && (data.msg as string | undefined)) ||
          `Binance API error: ${response.status} ${response.statusText}`,
      }
    }

    const priceNumber = Number(data.price)

    return {
      success: true,
      output: {
        symbol: typeof data.symbol === 'string' ? data.symbol : requestedSymbol,
        price: data.price,
        priceNumber,
        raw: data,
      },
    }
  },

  outputs: {
    symbol: {
      type: 'string',
      description: 'Trading pair symbol as returned by Binance (e.g. BTCUSDT).',
    },
    price: {
      type: 'string',
      description: 'Last traded price for the pair as a string.',
    },
    priceNumber: {
      type: 'number',
      description: 'Last traded price for the pair parsed as a number.',
    },
    raw: {
      type: 'json',
      description: 'Raw response from the Binance Symbol Price Ticker endpoint.',
      optional: true,
    },
  },
}

