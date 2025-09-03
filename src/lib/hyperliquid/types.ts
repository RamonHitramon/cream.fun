export interface HyperliquidAsset {
  symbol: string;
  maxLeverage?: number;
  szDecimals?: number;
  markPx?: number;
}

export interface HyperliquidResponse {
  perps: HyperliquidAsset[];
  error?: string;
  fallback?: boolean;
}

// Legacy interface for backward compatibility
export interface PerpMarket {
  display: string;
  symbol: string;
  price?: number;
  maxLeverage?: number;
}
