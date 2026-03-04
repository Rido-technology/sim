import { BinanceIcon } from '@/components/icons'
import type { BlockConfig } from '@/blocks/types'
import type { BinanceFetchPairPriceResponse } from '@/tools/binance/types'

export const BinanceBlock: BlockConfig<BinanceFetchPairPriceResponse> = {
  type: 'binance',
  name: 'Binance',
  description: 'Fetch the latest spot price for a trading pair on Binance.',
  longDescription:
    "Use Binance's public Symbol Price Ticker endpoint to retrieve the latest price for a spot trading pair such as BTC/USDT. No API key is required.",
  docsLink:
    'https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints#symbol-price-ticker',
  category: 'tools',
  bgColor: '#F3BA2F',
  icon: BinanceIcon,
  subBlocks: [
    {
      id: 'firstCoinSymbol',
      title: 'First Coin Symbol',
      type: 'short-input',
      placeholder: "Base currency symbol (e.g. 'BTC')",
      required: true,
      description: "The currency to fetch the price for (e.g. 'BTC' in 'BTC/USDT').",
    },
    {
      id: 'secondCoinSymbol',
      title: 'Second Coin Symbol',
      type: 'short-input',
      placeholder: "Quote currency symbol (e.g. 'USDT')",
      required: true,
      description: "The currency to fetch the price in (e.g. 'USDT' in 'BTC/USDT').",
    },
  ],
  tools: {
    access: ['binance_fetch_pair_price'],
    config: {
      tool: () => 'binance_fetch_pair_price',
      params: (params) => ({
        firstCoinSymbol: params.firstCoinSymbol,
        secondCoinSymbol: params.secondCoinSymbol,
      }),
    },
  },
  inputs: {
    firstCoinSymbol: {
      type: 'string',
      description: "The currency to fetch the price for (e.g. 'BTC' in 'BTC/USDT').",
    },
    secondCoinSymbol: {
      type: 'string',
      description: "The currency to fetch the price in (e.g. 'USDT' in 'BTC/USDT').",
    },
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

