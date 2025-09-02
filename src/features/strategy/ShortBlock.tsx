import React from 'react';
import { Card } from '../ui/Card';
import { PairMultiSelect } from './PairMultiSelect';
import { PerpMarket } from '@/lib/hyperliquid/types';

interface ShortBlockProps {
  pairs: string[];
  selectedPairs: string[];
  onPairsChange: (pairs: string[]) => void;
  notional: string;
  onNotionalChange: (value: string) => void;
  leverage: number;
  onLeverageChange: (leverage: number) => void;
  slippage: number;
  onSlippageChange: (slippage: number) => void;
  markets?: PerpMarket[];
}

export function ShortBlock({
  pairs,
  selectedPairs,
  onPairsChange,
  notional,
  onNotionalChange,
  leverage,
  onLeverageChange,
  slippage,
  onSlippageChange,
  markets = []
}: ShortBlockProps) {
  const leverageOptions = [1, 5, 10, 20];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: 'var(--color-hl-danger)' }}>
        <span className="mr-2">📉</span>
        Short Positions
      </h3>
      
      <div className="space-y-6">
        {/* Notional Input */}
        <div>
          <label className="block text-sm mb-2" style={{ color: 'var(--color-hl-muted)' }}>
            Short Notional (USDT)
          </label>
          <div className="relative">
            <input
              type="number"
              placeholder="1000"
              value={notional}
              onChange={(e) => onNotionalChange(e.target.value)}
              className="w-full rounded-lg px-3 py-2 pr-16 focus:outline-none"
              style={{ 
                backgroundColor: 'var(--color-hl-bg)', 
                border: '1px solid var(--color-hl-border)',
                color: 'var(--color-hl-text)'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-hl-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-hl-border)'}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm" style={{ color: 'var(--color-hl-muted)' }}>
              USDT
            </span>
          </div>
        </div>

        {/* Pair Selection */}
        <div>
          <label className="block text-sm mb-2" style={{ color: 'var(--color-hl-muted)' }}>
            Select Pairs
          </label>
          <PairMultiSelect
            pairs={pairs}
            selectedPairs={selectedPairs}
            onSelectionChange={onPairsChange}
            markets={markets}
          />
        </div>

        {/* Leverage Selection */}
        <div>
          <label className="block text-sm mb-2" style={{ color: 'var(--color-hl-muted)' }}>
            Leverage
          </label>
          <div className="flex gap-2">
            {leverageOptions.map((option) => (
              <button
                key={option}
                onClick={() => onLeverageChange(option)}
                className="chip hover:bg-white/5"
                style={{
                  backgroundColor: leverage === option ? 'var(--color-hl-primary)' : 'transparent',
                  color: leverage === option ? 'black' : 'var(--color-hl-text)'
                }}
              >
                {option}x
              </button>
            ))}
          </div>
        </div>

        {/* Slippage */}
        <div>
          <label className="block text-sm mb-2" style={{ color: 'var(--color-hl-muted)' }}>
            Max Slippage: {slippage}%
          </label>
          <input
            type="range"
            min="0.01"
            max="1"
            step="0.01"
            value={slippage}
            onChange={(e) => onSlippageChange(parseFloat(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{ 
              backgroundColor: 'var(--color-hl-success)',
              // Кастомные стили для slider - фон как у кнопки ALL, бегунок ярко-зеленый
              background: `linear-gradient(to right, var(--color-hl-success) 0%, var(--color-hl-success) ${(slippage - 0.01) / (1 - 0.01) * 100}%, var(--color-hl-success) ${(slippage - 0.01) / (1 - 0.01) * 100}%, var(--color-hl-success) 100%)`
            }}
          />
          <div className="text-xs mt-1" style={{ color: 'var(--color-hl-muted)' }}>Max: 0.10%</div>
        </div>
      </div>
    </Card>
  );
}
