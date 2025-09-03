export interface HyperliquidAsset {
  symbol: string;
  maxLeverage?: number;
  szDecimals?: number;
  markPx?: number;
}

export interface HyperliquidResponse {
  perps: HyperliquidAsset[];
  source: 'upstream' | 'error';
  upstreamStatus?: {
    url: string;
    status: number;
  };
  error: string | null;
}
