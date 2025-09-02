export interface PerpMarket {
  id: string;         // 'BTC-PERP'
  symbol: string;     // 'BTC'
  display: string;    // 'BTC-PERP'
  base: string;       // 'BTC'
  quote: string;      // 'USDC'
  maxLeverage?: number;
  szDecimals?: number;
  markPx?: number;
  midPx?: number;
  funding?: number;
  openInterest?: number;
}

export interface MarketsResponse {
  updatedAt: number;
  perps: PerpMarket[];
}
