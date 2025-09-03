export interface PerpMeta {
  symbol: string;
  markPrice?: number;
  szDecimals: number;
  maxLeverage: number;
  /** Минимальный объём ордера в USD, если известен */
  minOrderUsd?: number;
}

export type PerpMetaMap = Record<string, PerpMeta>;
