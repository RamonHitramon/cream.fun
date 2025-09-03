import { useCallback, useState } from 'react';
import { HyperliquidAsset } from './hyperliquid/types';

/**
 * Хук для работы с выбранными рынками
 */
export function useMarketSelection() {
  const [selectedMarkets, setSelectedMarkets] = useState<HyperliquidAsset[]>([]);

  const selectAllMarkets = useCallback((markets: HyperliquidAsset[]) => {
    setSelectedMarkets(markets);
  }, []);

  const getSelectedMarkets = useCallback((markets: HyperliquidAsset[]): HyperliquidAsset[] => {
    return selectedMarkets;
  }, [selectedMarkets]);

  const toggleMarket = useCallback((market: HyperliquidAsset) => {
    setSelectedMarkets(prev => 
      prev.find(m => m.symbol === market.symbol)
        ? prev.filter(m => m.symbol !== market.symbol)
        : [...prev, market]
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedMarkets([]);
  }, []);

  return {
    selectedMarkets,
    selectAllMarkets,
    getSelectedMarkets,
    toggleMarket,
    clearSelection,
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
