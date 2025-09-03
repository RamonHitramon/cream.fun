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
