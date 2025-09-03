'use client';

import React, { useState } from 'react';
import { Card } from '@/features/ui/Card';
import { PairMultiSelect } from './PairMultiSelect';
import { HyperliquidAsset } from '@/lib/hyperliquid/types';

export interface LongBlockProps {
  pairs: string[];
  markets: HyperliquidAsset[];
  selectedPairs: string[];
  onSelectionChange: (selected: string[]) => void;
  usdAmount: string;
  onUsdAmountChange: (amount: string) => void;
  onCalculate: () => void;
  loading?: boolean;
}

export function LongBlock({ 
  pairs, 
  markets, 
  selectedPairs, 
  onSelectionChange, 
  usdAmount, 
  onUsdAmountChange,
  onCalculate,
  loading = false
}: LongBlockProps) {
  return (
    <Card>
      <div className="p-3">
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-hl-success)' }}>
          Long Positions
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
              value={usdAmount}
              onChange={(e) => onUsdAmountChange(e.target.value)}
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
            <PairMultiSelect 
              pairs={pairs} 
              markets={markets} 
              selectedPairs={selectedPairs}
              onSelectionChange={onSelectionChange}
            />
          </div>

          {/* Calculate Button */}
          <button
            onClick={onCalculate}
            disabled={loading || selectedPairs.length === 0 || !usdAmount}
            className="w-full px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--color-hl-success)',
              color: 'white'
            }}
          >
            {loading ? 'Calculating...' : 'Calculate Strategy'}
          </button>
        </div>
      </div>
    </Card>
  );
}
