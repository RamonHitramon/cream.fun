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

          {/* Pair Selection */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-hl-text)' }}>
              Select Pairs
            </label>
            <PairMultiSelect pairs={pairs} markets={markets} metas={metas} />
          </div>
          
          {/* Max Slippage */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-hl-text)' }}>
              Max Slippage (%)
            </label>
            <input
              type="number"
              placeholder="1.0"
              step="0.1"
              min="0"
              max="10"
              className="w-full px-3 py-2 rounded-lg border"
              style={{
                backgroundColor: 'var(--color-hl-surface)',
                borderColor: 'var(--color-hl-border)',
                color: 'var(--color-hl-text)'
              }}
            />
          </div>

          {/* Кнопки действий */}
          <div className="flex gap-2 pt-2">
            <button
              className="flex-1 px-4 py-2 rounded-lg font-medium transition"
              style={{
                backgroundColor: 'var(--color-hl-primary)',
                color: 'var(--color-hl-bg)'
              }}
            >
              Calculate Strategy
            </button>
            <button
              className="flex-1 px-4 py-2 rounded-lg font-medium transition"
              style={{
                backgroundColor: 'var(--color-hl-success)',
                color: 'var(--color-hl-bg)'
              }}
            >
              Open Position
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
