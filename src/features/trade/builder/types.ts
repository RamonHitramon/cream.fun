export type Side = 'BUY' | 'SELL'; // BUY=Long, SELL=Short
export type OrderType = 'market' | 'limit';

export type BasketInput = {
  orderType: OrderType;
  side: Side;                    // для one-sided. Для раздельного лонг/шорт будет 2 вызова
  totalUsd: number;              // общая сумма в USD
  symbols: string[];             // ['BTC','ETH',...]
  leverage?: number;             // единое плечо (валидируем по каждой паре)
  slippageBps?: number;          // override
  limitPxBySymbol?: Record<string, number>; // для limit
};

export type PreparedOrder = {
  symbol: string;
  side: Side;
  sz: number;            // размер в базовой валюте (округлённый по szDecimals)
  type: OrderType;
  px?: number;           // для limit
};

export type BasketPreview = {
  prepared: PreparedOrder[];
  skipped: { symbol: string; reason: string }[];
  estUsedUsd: number;
};

export type BasketTradeResult = {
  success: boolean;
  orders: PreparedOrder[];
  totalUsd: number;
  estimatedFees: number;
  error?: string;
};

export type BuilderOrder = {
  symbol: string;
  side: Side;
  sz: string;            // размер как строка
  type: OrderType;
  px?: string;           // цена как строка для limit
  reduceOnly?: boolean;
  cloid?: string;        // client order id
};
