import React from 'react';
import { Card } from '@/features/ui/Card';
import { PairMultiSelect } from './PairMultiSelect';
import { PerpMarket } from '@/lib/hyperliquid/types';
import { PerpMetaMap } from '@/features/trade/hl/types';

export interface ShortBlockProps {
  pairs: string[];
  markets: PerpMarket[];
  metas: PerpMetaMap;
}

export function ShortBlock({ pairs, markets, metas }: ShortBlockProps) {
  return (
    <Card>
      <div className="p-3">
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-hl-danger)' }}>
          Short Positions
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
          
          {/* Slippage */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-hl-text)' }}>
              Slippage (%)
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              defaultValue="1"
              className="hl-range w-full"
            />
            <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--color-hl-muted)' }}>
              <span>0%</span>
              <span>1%</span>
              <span>10%</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
