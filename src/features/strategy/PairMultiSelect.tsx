import React, { useState, useMemo } from 'react';
import { PerpMarket } from '@/lib/hyperliquid/types';
import { PerpMetaMap } from '@/features/trade/hl/types';

export interface PairMultiSelectProps {
  pairs: string[];
  markets: PerpMarket[];
  metas: PerpMetaMap;
  selectedPairs: string[];
  onPairsChange: (pairs: string[]) => void;
}

export function PairMultiSelect({ pairs, metas, selectedPairs, onPairsChange }: PairMultiSelectProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Фильтруем пары по поиску
  const filteredPairs = useMemo(() => {
    if (!searchTerm) return pairs;
    return pairs.filter(pair => 
      pair.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [pairs, searchTerm]);

  // Обработчик выбора/отмены пары
  const handlePairToggle = (pair: string) => {
    const newSelected = selectedPairs.includes(pair) 
      ? selectedPairs.filter(p => p !== pair)
      : [...selectedPairs, pair];
    onPairsChange(newSelected);
  };

  // Выбрать все отфильтрованные пары
  const handleSelectAll = () => {
    const newSelected = [...selectedPairs];
    filteredPairs.forEach(pair => {
      if (!newSelected.includes(pair)) {
        newSelected.push(pair);
      }
    });
    onPairsChange(newSelected);
  };

  // Очистить все выбранные пары
  const handleClear = () => {
    onPairsChange([]);
  };

  // Получить maxLeverage для пары
  const getMaxLeverage = (pair: string): string => {
    const meta = metas[pair];
    if (meta?.maxLeverage) {
      return `${meta.maxLeverage}x`;
    }
    return 'N/A';
  };

  return (
    <div className="space-y-3">
      {/* Поиск */}
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

      {/* Кнопки управления */}
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

      {/* Список пар - увеличенное окно без горизонтальной прокрутки */}
      <div className="pairs-scroll max-h-64 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {filteredPairs.map((pair) => {
            const isSelected = selectedPairs.includes(pair);
            const maxLeverage = getMaxLeverage(pair);
            
            return (
              <div
                key={pair}
                onClick={() => handlePairToggle(pair)}
                className="flex items-center gap-2 p-2 rounded-lg border cursor-pointer hover:bg-white/5 transition"
                style={{
                  borderColor: isSelected ? 'var(--color-hl-primary)' : 'var(--color-hl-border)',
                  backgroundColor: isSelected ? 'rgba(111, 255, 176, 0.1)' : 'transparent'
                }}
              >
                {/* Чекбокс */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="tick sr-only"
                    checked={isSelected}
                    onChange={() => {}} // Обработчик уже в onClick родителя
                  />
                  <div className="input-circle" />
                </div>
                
                {/* Текст пары с maxLeverage в одной строке */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm flex items-center gap-1" style={{ color: 'var(--color-hl-text)' }}>
                    <span>{pair}</span>
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

      {/* Статистика выбора */}
      {selectedPairs.length > 0 && (
        <div className="text-xs" style={{ color: 'var(--color-hl-muted)' }}>
          Selected: {selectedPairs.length} / {pairs.length} pairs
        </div>
      )}
    </div>
  );
}
