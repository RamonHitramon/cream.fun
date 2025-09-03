'use client';

import React, { useState, useMemo } from 'react';
import { HyperliquidAsset } from '@/lib/hyperliquid/types';

export interface PairMultiSelectProps {
  pairs: string[];
  markets: HyperliquidAsset[];
}

export function PairMultiSelect({ pairs, markets }: PairMultiSelectProps) {
  const [selectedPairs, setSelectedPairs] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPairs = useMemo(() => {
    if (!searchTerm) return pairs;
    return pairs.filter(pair =>
      pair.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [pairs, searchTerm]);

  const handlePairToggle = (pair: string) => {
    setSelectedPairs(prev =>
      prev.includes(pair)
        ? prev.filter(p => p !== pair)
        : [...prev, pair]
    );
  };

  const handleSelectAll = () => {
    setSelectedPairs(prev => {
      const newSelected = [...prev];
      filteredPairs.forEach(pair => {
        if (!newSelected.includes(pair)) {
          newSelected.push(pair);
        }
      });
      return newSelected;
    });
  };

  const handleClear = () => {
    setSelectedPairs([]);
  };

  const getMaxLeverage = (pair: string): string => {
    const market = markets.find(m => m.symbol === pair);
    if (market?.maxLeverage) {
      return `${market.maxLeverage}x`;
    }
    return 'N/A';
  };

  const truncateTicker = (ticker: string): string => {
    if (ticker.length > 8) {
      return ticker.slice(0, 8) + '...';
    }
    return ticker;
  };

  return (
    <div className="space-y-2">
      <div>
        <input
          type="text"
          placeholder="Search pairs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border text-sm"
          style={{
            backgroundColor: 'var(--color-hl-surface)',
            borderColor: 'var(--color-hl-border)',
            color: 'var(--color-hl-text)'
          }}
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSelectAll}
          className="px-3 py-1 text-xs rounded-lg border hover:bg-white/5 transition"
          style={{
            borderColor: 'var(--color-hl-border)',
            color: 'var(--color-hl-text)'
          }}
        >
          All
        </button>
        <button
          onClick={handleClear}
          className="px-3 py-1 text-xs rounded-lg border hover:bg-white/5 transition"
          style={{
            borderColor: 'var(--color-hl-border)',
            color: 'var(--color-hl-text)'
          }}
        >
          Clear
        </button>
      </div>

      <div className="pairs-scroll max-h-48 overflow-y-auto">
        <div className="grid grid-cols-3 gap-2">
          {filteredPairs.map((pair) => {
            const isSelected = selectedPairs.includes(pair);
            const maxLeverage = getMaxLeverage(pair);
            const displayTicker = truncateTicker(pair);

            return (
              <div
                key={pair}
                onClick={() => handlePairToggle(pair)}
                className="flex items-center gap-2 p-2 rounded-lg border cursor-pointer hover:bg-white/5 transition"
                style={{
                  borderColor: isSelected ? 'var(--color-hl-primary)' : 'var(--color-hl-border)',
                  backgroundColor: isSelected ? 'rgba(111, 255, 176, 0.1)' : 'transparent'
                }}
                title={pair}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="tick sr-only"
                    checked={isSelected}
                    onChange={() => {}}
                  />
                  <div className="input-circle" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm" style={{ color: 'var(--color-hl-text)' }}>
                      {displayTicker}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--color-hl-muted)' }}>
                      {maxLeverage}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedPairs.length > 0 && (
        <div className="text-xs" style={{ color: 'var(--color-hl-muted)' }}>
          Selected: {selectedPairs.length} / {pairs.length} pairs
        </div>
      )}
    </div>
  );
}
