import React from 'react';
import { Card } from '@/features/ui/Card';
import { LongBlock } from './LongBlock';
import { ShortBlock } from './ShortBlock';
import { HyperliquidAsset } from '@/lib/hyperliquid/types';

export interface CreateStrategyProps {
  pairs: string[];
  markets: HyperliquidAsset[];
  metas: Record<string, any>; // Keep for backward compatibility
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
