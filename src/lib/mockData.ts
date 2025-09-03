import { HyperliquidAsset } from './hyperliquid/types';

// Mock данные для тестирования
export const mockMarkets: HyperliquidAsset[] = [
  {
    symbol: 'BTC',
    maxLeverage: 50,
    szDecimals: 3,
    markPx: 62000,
  },
  {
    symbol: 'ETH',
    maxLeverage: 50,
    szDecimals: 3,
    markPx: 2800,
  },
  {
    symbol: 'SOL',
    maxLeverage: 50,
    szDecimals: 3,
    markPx: 160,
  },
  {
    symbol: 'MATIC',
    maxLeverage: 50,
    szDecimals: 3,
    markPx: 0.85,
  },
  {
    symbol: 'LINK',
    maxLeverage: 50,
    szDecimals: 3,
    markPx: 18.5,
  },
];

export function getMarketBySymbol(symbol: string): HyperliquidAsset | undefined {
  return mockMarkets.find(market => market.symbol === symbol);
}
