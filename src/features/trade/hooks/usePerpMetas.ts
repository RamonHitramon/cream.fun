'use client';

import { useMemo } from 'react';
import { useMarketData } from '@/components/MarketDataProvider';
import { convertToPerpMeta } from '../builder/placeBasket';
import { PerpMetaMap } from '../hl/types';

/**
 * Хук для получения метаданных перпов в удобном формате
 * Возвращает Record<string, PerpMeta> где ключ = 'BTC', 'ETH', ...
 */
export function usePerpMetas(): PerpMetaMap {
  const { markets } = useMarketData();
  
  const metas = useMemo(() => {
    if (!markets || markets.length === 0) {
      return {};
    }
    
    return convertToPerpMeta(markets);
  }, [markets]);
  
  return metas;
}
