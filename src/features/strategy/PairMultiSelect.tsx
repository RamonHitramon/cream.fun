import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { PerpMarket } from '@/lib/hyperliquid/types';

interface PairMultiSelectProps {
  pairs: string[];
  selectedPairs: string[];
  onSelectionChange: (pairs: string[]) => void;
  searchPlaceholder?: string;
  markets?: PerpMarket[];
}

export function PairMultiSelect({ 
  pairs, 
  selectedPairs, 
  onSelectionChange, 
  searchPlaceholder = "Search tokens (e.g., BTC, ETH, SOL…)",
  markets = []
}: PairMultiSelectProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPairs = pairs.filter(pair =>
    pair.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePairToggle = (pair: string) => {
    if (selectedPairs.includes(pair)) {
      onSelectionChange(selectedPairs.filter(p => p !== pair));
    } else {
      onSelectionChange([...selectedPairs, pair]);
    }
  };

  const handleSelectAll = () => {
    // Выбираем все отфильтрованные пары
    const allFilteredPairs = [...new Set([...selectedPairs, ...filteredPairs])];
    onSelectionChange(allFilteredPairs);
  };

  const handleClear = () => {
    // Очищаем все выбранные пары
    onSelectionChange([]);
  };

  // Функция для получения максимального плеча по символу
  const getMaxLeverage = (symbol: string): number | undefined => {
    const market = markets.find(m => m.symbol === symbol || m.display === symbol);
    return market?.maxLeverage;
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg text-sm"
          style={{
            backgroundColor: 'var(--color-hl-surface)',
            color: 'var(--color-hl-text)',
            border: '1px solid var(--color-hl-border)'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--color-hl-primary)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--color-hl-border)'}
        />
        <Button variant="success" onClick={handleSelectAll}>All</Button>
        <Button variant="danger" onClick={handleClear}>Clear</Button>
      </div>

      <div className="max-h-48 overflow-y-auto pairs-scroll">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {filteredPairs.map((pair) => (
            <label
              key={pair}
              className="flex items-center p-2 rounded-lg cursor-pointer transition-colors hover:bg-white/5"
              style={{
                backgroundColor: selectedPairs.includes(pair) ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                border: selectedPairs.includes(pair) ? '1px solid var(--color-hl-primary)' : '1px solid transparent'
              }}
            >
              <input
                type="checkbox"
                className="tick"
                checked={selectedPairs.includes(pair)}
                onChange={() => handlePairToggle(pair)}
              />
              <div className="input-circle"></div>
              <span 
                className="text-sm truncate ml-2" 
                style={{ color: 'var(--color-hl-text)' }}
                title={pair}
              >
                {pair}
                {/* Максимальное плечо как текст через пробел */}
                {getMaxLeverage(pair) && (
                  <span 
                    className="ml-1"
                    style={{ color: 'var(--color-hl-success)' }}
                  >
                    {getMaxLeverage(pair)}x
                  </span>
                )}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
