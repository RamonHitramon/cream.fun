import { PerpMarket, MarketsResponse } from './types';

export const mockMarkets: MarketsResponse = {
  updatedAt: Date.now(),
  perps: [
    {
      id: 'BTC-PERP',
      symbol: 'BTC',
      display: 'BTC',
      base: 'BTC',
      quote: 'USDC',
      maxLeverage: 20,
      szDecimals: 3,
      markPx: 43250.5,
      midPx: 43251.0,
      funding: 0.0001,
      openInterest: 1250000000
    },
    {
      id: 'ETH-PERP',
      symbol: 'ETH',
      display: 'ETH',
      base: 'ETH',
      quote: 'USDC',
      maxLeverage: 20,
      szDecimals: 2,
      markPx: 2650.75,
      midPx: 2651.25,
      funding: 0.0002,
      openInterest: 850000000
    },
    {
      id: 'SOL-PERP',
      symbol: 'SOL',
      display: 'SOL',
      base: 'SOL',
      quote: 'USDC',
      maxLeverage: 20,
      szDecimals: 1,
      markPx: 98.45,
      midPx: 98.50,
      funding: 0.0003,
      openInterest: 320000000
    },
    {
      id: 'XRP-PERP',
      symbol: 'XRP',
      display: 'XRP',
      base: 'XRP',
      quote: 'USDC',
      maxLeverage: 20,
      szDecimals: 0,
      markPx: 0.625,
      midPx: 0.626,
      funding: 0.0001,
      openInterest: 180000000
    },
    {
      id: 'TON-PERP',
      symbol: 'TON',
      display: 'TON',
      base: 'TON',
      quote: 'USDC',
      maxLeverage: 20,
      szDecimals: 1,
      markPx: 2.85,
      midPx: 2.86,
      funding: 0.0002,
      openInterest: 95000000
    },
    {
      id: 'DOGE-PERP',
      symbol: 'DOGE',
      display: 'DOGE',
      base: 'DOGE',
      quote: 'USDC',
      maxLeverage: 20,
      szDecimals: 0,
      markPx: 0.085,
      midPx: 0.086,
      funding: 0.0001,
      openInterest: 75000000
    },
    {
      id: '1INCH-PERP',
      symbol: '1INCH',
      display: '1INCH',
      base: '1INCH',
      quote: 'USDC',
      maxLeverage: 20,
      szDecimals: 1,
      markPx: 0.425,
      midPx: 0.426,
      funding: 0.0002,
      openInterest: 25000000
    },
    {
      id: 'TRUMP-PERP',
      symbol: 'TRUMP',
      display: 'TRUMP',
      base: 'TRUMP',
      quote: 'USDC',
      maxLeverage: 20,
      szDecimals: 0,
      markPx: 12.5,
      midPx: 12.6,
      funding: 0.0003,
      openInterest: 45000000
    },
    {
      id: 'OP-PERP',
      symbol: 'OP',
      display: 'OP',
      base: 'OP',
      quote: 'USDC',
      maxLeverage: 20,
      szDecimals: 1,
      markPx: 3.25,
      midPx: 3.26,
      funding: 0.0002,
      openInterest: 65000000
    },
    {
      id: 'ARB-PERP',
      symbol: 'ARB',
      display: 'ARB',
      base: 'ARB',
      quote: 'USDC',
      maxLeverage: 20,
      szDecimals: 1,
      markPx: 1.85,
      midPx: 1.86,
      funding: 0.0001,
      openInterest: 55000000
    },
    {
      id: 'MATIC-PERP',
      symbol: 'MATIC',
      display: 'MATIC',
      base: 'MATIC',
      quote: 'USDC',
      maxLeverage: 20,
      szDecimals: 1,
      markPx: 0.95,
      midPx: 0.96,
      funding: 0.0002,
      openInterest: 42000000
    },
    {
      id: 'AVAX-PERP',
      symbol: 'AVAX',
      display: 'AVAX',
      base: 'AVAX',
      quote: 'USDC',
      maxLeverage: 20,
      szDecimals: 2,
      markPx: 28.5,
      midPx: 28.6,
      funding: 0.0003,
      openInterest: 38000000
    },
    {
      id: 'LINK-PERP',
      symbol: 'LINK',
      display: 'LINK',
      base: 'LINK',
      quote: 'USDC',
      maxLeverage: 20,
      szDecimals: 2,
      markPx: 14.25,
      midPx: 14.30,
      funding: 0.0001,
      openInterest: 32000000
    },
    {
      id: 'UNI-PERP',
      symbol: 'UNI',
      display: 'UNI',
      base: 'UNI',
      quote: 'USDC',
      maxLeverage: 20,
      szDecimals: 2,
      markPx: 6.85,
      midPx: 6.90,
      funding: 0.0002,
      openInterest: 28000000
    },
    {
      id: 'ATOM-PERP',
      symbol: 'ATOM',
      display: 'ATOM',
      base: 'ATOM',
      quote: 'USDC',
      maxLeverage: 20,
      szDecimals: 2,
      markPx: 8.45,
      midPx: 8.50,
      funding: 0.0001,
      openInterest: 22000000
    },
    {
      id: 'DOT-PERP',
      symbol: 'DOT',
      display: 'DOT',
      base: 'DOT',
      quote: 'USDC',
      maxLeverage: 20,
      szDecimals: 2,
      markPx: 6.25,
      midPx: 6.30,
      funding: 0.0002,
      openInterest: 18000000
    },
    {
      id: 'ADA-PERP',
      symbol: 'ADA',
      display: 'ADA',
      base: 'ADA',
      quote: 'USDC',
      maxLeverage: 20,
      szDecimals: 3,
      markPx: 0.485,
      midPx: 0.486,
      funding: 0.0001,
      openInterest: 15000000
    }
  ]
};

// Helper function to get market by symbol
export function getMarketBySymbol(symbol: string): PerpMarket | undefined {
  return mockMarkets.perps.find(market => market.symbol === symbol);
}

// Helper function to get all market symbols
export function getAllMarketSymbols(): string[] {
  return mockMarkets.perps.map(market => market.symbol);
}

// Helper function to get market display names
export function getMarketDisplayNames(): string[] {
  return mockMarkets.perps.map(market => market.display);
}
