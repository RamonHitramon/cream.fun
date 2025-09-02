export type Side = 'BUY'|'SELL';
export type OrderType = 'market'|'limit';

export type BasketInput = {
  orderType: OrderType;
  side: Side;
  totalUsd: number;
  symbols: string[];
  limitPxBySymbol?: Record<string, number>;
};

export type PreparedOrder = {
  symbol: string;
  side: Side;
  sz: number;
  type: OrderType;
  px?: number;
};

export type BasketPreview = {
  prepared: PreparedOrder[];
  skipped: { symbol: string; reason: string }[];
  estUsedUsd: number;
};
