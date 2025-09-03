export interface PerpMeta {
  symbol: string;
  markPrice?: number;
  szDecimals: number;
  maxLeverage: number;
}

export type PerpMetaMap = Record<string, PerpMeta>;
