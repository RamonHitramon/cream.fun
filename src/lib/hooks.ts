import { useState, useCallback } from 'react';
import { PerpMarket } from './hyperliquid/types';

// Hook for managing market selection
export function useMarketSelection() {
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);

  const toggleMarket = useCallback((marketId: string) => {
    setSelectedMarkets(prev => 
      prev.includes(marketId) 
        ? prev.filter(id => id !== marketId)
        : [...prev, marketId]
    );
  }, []);

  const selectAllMarkets = useCallback((markets: PerpMarket[]) => {
    setSelectedMarkets(markets.map(market => market.id));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedMarkets([]);
  }, []);

  const getSelectedMarkets = useCallback((markets: PerpMarket[]): PerpMarket[] => {
    return markets.filter(market => selectedMarkets.includes(market.id));
  }, [selectedMarkets]);

  return {
    selectedMarkets,
    toggleMarket,
    selectAllMarkets,
    clearSelection,
    getSelectedMarkets
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
