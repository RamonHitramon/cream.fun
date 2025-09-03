import React from 'react';
import { Card } from '@/features/ui/Card';
import { PairMultiSelect } from './PairMultiSelect';
import { PerpMarket } from '@/lib/hyperliquid/types';
import { PerpMetaMap } from '@/features/trade/hl/types';

export interface LongBlockProps {
  pairs: string[];
  markets: PerpMarket[];
  metas: PerpMetaMap;
}

export function LongBlock({ pairs, markets, metas }: LongBlockProps) {
  return (
    <Card>
      <div className="p-3">
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-hl-success)' }}>
          Long Positions
        </h3>
        
        <div className="space-y-3">
          {/* Pair Selection */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-hl-text)' }}>
              Select Pairs
            </label>
            <PairMultiSelect pairs={pairs} markets={markets} metas={metas} />
          </div>
          
          {/* USD Amount */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-hl-text)' }}>
              USD Amount
            </label>
            <input
              type="number"
              placeholder="1000"
              className="w-full px-3 py-2 rounded-lg border"
              style={{
                backgroundColor: 'var(--color-hl-surface)',
                borderColor: 'var(--color-hl-border)',
                color: 'var(--color-hl-text)'
              }}
            />
          </div>
          
          {/* Leverage */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-hl-text)' }}>
              Leverage
            </label>
            <input
              type="number"
              placeholder="10"
              className="w-full px-3 py-2 rounded-lg border"
              style={{
                backgroundColor: 'var(--color-hl-surface)',
                borderColor: 'var(--color-hl-border)',
                color: 'var(--color-hl-text)'
              }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
