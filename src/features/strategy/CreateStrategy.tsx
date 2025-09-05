'use client';

import React, { useState } from 'react';
import { Card } from '@/features/ui/Card';
import { LongBlock } from './LongBlock';
import { ShortBlock } from './ShortBlock';
import { HyperliquidAsset } from '@/lib/hyperliquid/types';
import { usePerpMetas } from '@/features/trade/hl/usePerpMetas';
import { useBasketPreview } from '@/features/trade/basket/useBasketPreview';
import { useWalletGuard } from '@/components/WalletGuard';
import { RealtimeMarketData } from '@/components/RealtimeMarketData';

export interface CreateStrategyProps {
  pairs: string[];
  markets: HyperliquidAsset[];
}

export function CreateStrategy({ pairs, markets }: CreateStrategyProps) {
  const { metas } = usePerpMetas();
  const { loading, preview, calculate } = useBasketPreview(metas);
  const { checkWallet, checkPreview } = useWalletGuard();
  
  // Long positions state
  const [longSelectedPairs, setLongSelectedPairs] = useState<string[]>([]);
  const [longUsdAmount, setLongUsdAmount] = useState('');
  
  // Short positions state
  const [shortSelectedPairs, setShortSelectedPairs] = useState<string[]>([]);
  const [shortUsdAmount, setShortUsdAmount] = useState('');

  const handleLongCalculate = async () => {
    if (!checkWallet('calculate strategy')) return;
    
    if (longSelectedPairs.length === 0 || !longUsdAmount) {
      return;
    }
    
    await calculate({
      orderType: 'market',
      side: 'BUY',
      totalUsd: Number(longUsdAmount),
      symbols: longSelectedPairs,
    });
  };

  const handleShortCalculate = async () => {
    if (!checkWallet('calculate strategy')) return;
    
    if (shortSelectedPairs.length === 0 || !shortUsdAmount) {
      return;
    }
    
    await calculate({
      orderType: 'market',
      side: 'SELL',
      totalUsd: Number(shortUsdAmount),
      symbols: shortSelectedPairs,
    });
  };

  const handleOpenPosition = async () => {
    if (!checkWallet('open position')) return;
    if (!checkPreview(!!preview, 'opening position')) return;
    
    // Здесь будет логика открытия позиции
    console.log('Opening position with preview:', preview);
  };

  // Get selected assets for realtime data
  const selectedAssets = [...longSelectedPairs, ...shortSelectedPairs];

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

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-hl-border">
            <button
              onClick={handleOpenPosition}
              disabled={!preview || loading}
              className="px-6 py-3 bg-hl-primary text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-hl-primary-dark transition-colors"
            >
              {loading ? 'Processing...' : 'Open Position'}
            </button>
          </div>
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
              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-red-800 text-xs">
                <div className="font-semibold mb-1">Errors:</div>
                {preview.errors.map((error, index) => (
                  <div key={index}>• {error}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Real-time Market Data */}
        {selectedAssets.length > 0 && (
          <div className="mt-6">
            <RealtimeMarketData assets={selectedAssets} />
          </div>
        )}
      </div>
    </Card>
  );
}
