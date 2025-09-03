'use client';

import React, { useState } from 'react';
import { Card } from '@/features/ui/Card';
import { LongBlock } from './LongBlock';
import { ShortBlock } from './ShortBlock';
import { HyperliquidAsset } from '@/lib/hyperliquid/types';
import { usePerpMetas } from '@/features/trade/hl/usePerpMetas';
import { useBasketPreview } from '@/features/trade/basket/useBasketPreview';
import type { BasketPreview } from '@/features/trade/basket/types';

export interface CreateStrategyProps {
  pairs: string[];
  markets: HyperliquidAsset[];
}

export function CreateStrategy({ pairs, markets }: CreateStrategyProps) {
  const { metas } = usePerpMetas();
  const { loading, preview, calculate, reset } = useBasketPreview(metas);
  
  // Long positions state
  const [longSelectedPairs, setLongSelectedPairs] = useState<string[]>([]);
  const [longUsdAmount, setLongUsdAmount] = useState('');
  
  // Short positions state
  const [shortSelectedPairs, setShortSelectedPairs] = useState<string[]>([]);
  const [shortUsdAmount, setShortUsdAmount] = useState('');

  const handleLongCalculate = async () => {
    if (longSelectedPairs.length === 0 || !longUsdAmount) return;
    
    await calculate({
      orderType: 'market',
      side: 'BUY',
      totalUsd: Number(longUsdAmount),
      symbols: longSelectedPairs,
    });
  };

  const handleShortCalculate = async () => {
    if (shortSelectedPairs.length === 0 || !shortUsdAmount) return;
    
    await calculate({
      orderType: 'market',
      side: 'SELL',
      totalUsd: Number(shortUsdAmount),
      symbols: shortSelectedPairs,
    });
  };

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-hl-text)' }}>
          Create Strategy
        </h2>

        <div className="space-y-6">
          <LongBlock 
            pairs={pairs} 
            markets={markets}
            selectedPairs={longSelectedPairs}
            onSelectionChange={setLongSelectedPairs}
            usdAmount={longUsdAmount}
            onUsdAmountChange={setLongUsdAmount}
            onCalculate={handleLongCalculate}
            loading={loading}
          />
          
          <ShortBlock 
            pairs={pairs} 
            markets={markets}
            selectedPairs={shortSelectedPairs}
            onSelectionChange={setShortSelectedPairs}
            usdAmount={shortUsdAmount}
            onUsdAmountChange={setShortUsdAmount}
            onCalculate={handleShortCalculate}
            loading={loading}
          />
        </div>

        {/* Preview Table */}
        {preview && (
          <div className="card p-3 mt-6 text-sm">
            <div className="font-semibold mb-2">Prepared orders</div>
            <table className="w-full">
              <thead className="text-hl-muted">
                <tr>
                  <th className="text-left">Symbol</th>
                  <th>Side</th>
                  <th>Size (sz)</th>
                </tr>
              </thead>
              <tbody>
                {preview.prepared.map(o => (
                  <tr key={o.symbol} className="border-t border-hl-border">
                    <td className="py-1">{o.symbol}</td>
                    <td className="py-1">{o.side}</td>
                    <td className="py-1">{o.sz}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {preview.errors && preview.errors.length > 0 && (
              <div className="mt-3 p-2 rounded border border-red-500/20 bg-red-500/10">
                <div className="text-red-600 text-xs font-medium">Errors:</div>
                {preview.errors.map((error, index) => (
                  <div key={index} className="text-red-500/80 text-xs">• {error}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
