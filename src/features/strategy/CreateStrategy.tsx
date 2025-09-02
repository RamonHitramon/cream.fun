import React from 'react';
import { Card } from '@/features/ui/Card';
import { Button } from '@/features/ui/Button';
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
          
          {/* Slippage и кнопки стратегии */}
          <div className="pt-4" style={{ borderTop: '1px solid var(--color-hl-border)' }}>
            {/* Slippage */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-hl-text)' }}>
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
            
            {/* Кнопки стратегии */}
            <div className="flex gap-3">
              <Button variant="primary">
                Build Strategy Preview
              </Button>
              <Button variant="success">
                Place Basket Orders
              </Button>
            </div>
            
            <p className="text-sm mt-2" style={{ color: 'var(--color-hl-muted)' }}>
              Select at least one pair in Long or Short.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
