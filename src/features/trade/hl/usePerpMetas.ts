'use client';

import { useMemo } from 'react';
import { useMarketData } from '@/components/MarketDataProvider';
import type { PerpMetaMap, PerpMeta } from './types';

export function usePerpMetas(): { metas: PerpMetaMap } {
  const { markets } = useMarketData();

  const metas: PerpMetaMap = useMemo(() => {
    const result: PerpMetaMap = {};
    
    for (const market of markets) {
      result[market.symbol] = {
        symbol: market.symbol,
        markPrice: market.markPx,
        szDecimals: market.szDecimals || 3,
        maxLeverage: market.maxLeverage || 1,
        minOrderUsd: market.minOrderUsd
      };
    }
    
    return result;
  }, [markets]);

  return { metas };
}
