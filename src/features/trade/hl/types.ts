// Общая мета по перп-рынку, которую используем в UI/математике
export type PerpMeta = {
  /** Тикер: BTC, ETH, SOL ... */
  symbol: string;
  /** Текущая ориентировочная цена (mark) — если доступна */
  markPx?: number;
  /** Макс. плечо, если известно */
  maxLeverage?: number;
  /** Кол-во знаков после запятой для размера позиции */
  szDecimals?: number;
  /** Минимальный объём ордера в USD, если известно из апстрима */
  minOrderUsd?: number;
};

// Мапа: 'BTC' -> PerpMeta
export type PerpMetaMap = Record<string, PerpMeta>;
