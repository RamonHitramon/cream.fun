'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { PerpMarket } from '@/lib/hyperliquid/types';

interface MarketDataContextType {
  markets: PerpMarket[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  lastUpdated: number | null;
}

const MarketDataContext = createContext<MarketDataContextType | undefined>(undefined);

export function useMarketData() {
  const context = useContext(MarketDataContext);
  if (context === undefined) {
    throw new Error('useMarketData must be used within a MarketDataProvider');
  }
  return context;
}

interface MarketDataProviderProps {
  children: React.ReactNode;
}

export function MarketDataProvider({ children }: MarketDataProviderProps) {
  const [markets, setMarkets] = useState<PerpMarket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const fetchMarkets = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching markets from /api/markets...');
      const response = await fetch('/api/markets');
      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Received data:', data.perps.length, 'markets');
      setMarkets(data.perps);
      setLastUpdated(data.updatedAt);
    } catch (err) {
      setError('Failed to load market data. Please try again.');
      console.error('Error fetching markets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, []);

  const value: MarketDataContextType = {
    markets,
    loading,
    error,
    refetch: fetchMarkets,
    lastUpdated,
  };

  return (
    <MarketDataContext.Provider value={value}>
      {children}
    </MarketDataContext.Provider>
  );
}
