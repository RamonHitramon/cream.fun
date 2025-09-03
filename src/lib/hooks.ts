'use client';

import { useState, useCallback } from 'react';

/**
 * Хук для работы с выбранными рынками
 */
export function useMarketSelection() {
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);

  const getSelectedMarkets = useCallback(() => {
    return selectedMarkets;
  }, [selectedMarkets]);

  return {
    selectedMarkets,
    setSelectedMarkets,
    getSelectedMarkets,
  };
}

// Hook for managing strategy state
export function useStrategyState() {
  const [longNotional, setLongNotional] = useState('');
  const [shortNotional, setShortNotional] = useState('');
  const [longLeverage, setLongLeverage] = useState(1);
  const [shortLeverage, setShortLeverage] = useState(1);
  const [longSlippage, setLongSlippage] = useState(0.1);
  const [shortSlippage, setShortSlippage] = useState(0.1);

  const longMarketSelection = useMarketSelection();
  const shortMarketSelection = useMarketSelection();

  const hasSelectedPairs = longMarketSelection.selectedMarkets.length > 0 || 
                          shortMarketSelection.selectedMarkets.length > 0;

  return {
    longNotional,
    setLongNotional,
    shortNotional,
    setShortNotional,
    longLeverage,
    setLongLeverage,
    shortLeverage,
    setShortLeverage,
    longSlippage,
    setLongSlippage,
    shortSlippage,
    setShortSlippage,
    longMarketSelection,
    shortMarketSelection,
    hasSelectedPairs
  };
}
