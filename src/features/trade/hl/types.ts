export type PerpMeta = {
  symbol: string;
  maxLeverage?: number;
  szDecimals?: number;
  markPx?: number;
  minOrderUsd?: number; // пока undefined, добавим позже
};

export type PerpMetaMap = Record<string, PerpMeta>;
