'use client';
import { useState } from 'react';
import type { BasketInput, BasketPreview } from './types';
import { previewBasket } from './math';
import type { PerpMetaMap } from '@/features/trade/hl/types';

export function useBasketPreview(metas: PerpMetaMap) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<BasketPreview | null>(null);

  async function calculate(input: BasketInput) {
    setLoading(true);
    try {
      const pv = previewBasket(input, metas);
      setPreview(pv);
    } finally {
      setLoading(false);
    }
  }

  return { loading, preview, calculate, reset: () => setPreview(null) };
}
