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

// Hyperliquid API types
export interface HyperliquidUniverse {
  name: string;
  maxLeverage?: number;
  szDecimals?: number;
}

export interface HyperliquidAssetCtx {
  markPx?: string | number;
  midPx?: string | number;
  funding?: string | number;
  openInterest?: string | number;
}

export interface HyperliquidMetaResponse {
  universe: HyperliquidUniverse[];
}

export interface HyperliquidMetaAndCtxResponse {
  universe: HyperliquidUniverse[];
  assetCtxs: HyperliquidAssetCtx[];
}
