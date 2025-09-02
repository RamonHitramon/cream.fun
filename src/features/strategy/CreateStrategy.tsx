import React from 'react';
import { Card } from '@/features/ui/Card';
import { LongBlock } from './LongBlock';
import { ShortBlock } from './ShortBlock';
import { PerpMarket } from '@/lib/hyperliquid/types';
import { PerpMetaMap } from '@/features/trade/hl/types';

export interface CreateStrategyProps {
  pairs: string[];
  markets: PerpMarket[];
  metas: PerpMetaMap;
}

export function CreateStrategy({ pairs, markets, metas }: CreateStrategyProps) {
  return (
    <Card>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-hl-text)' }}>
          Create Strategy
        </h2>
        
        <div className="space-y-6">
          <LongBlock pairs={pairs} markets={markets} metas={metas} />
          <ShortBlock pairs={pairs} markets={markets} metas={metas} />
        </div>
      </div>
    </Card>
  );
}
