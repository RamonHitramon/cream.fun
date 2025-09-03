'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { HyperliquidAsset, HyperliquidResponse } from '@/lib/hyperliquid/types';

interface MarketDataContextType {
  markets: HyperliquidAsset[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  lastUpdated: Date | null;
  isFallback: boolean;
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
  children: ReactNode;
}

export function MarketDataProvider({ children }: MarketDataProviderProps) {
  const [markets, setMarkets] = useState<HyperliquidAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  const fetchMarkets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching markets from API...');
      const response = await fetch('/api/hyperliquid/markets');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: HyperliquidResponse = await response.json();
      console.log('Markets API response:', data);
      
      if (data.perps && data.perps.length > 0) {
        setMarkets(data.perps);
        setIsFallback(data.fallback || false);
        setLastUpdated(new Date());
        
        if (data.fallback) {
          console.log('Using fallback data, upstream unavailable');
        } else {
          console.log(`Successfully loaded ${data.perps.length} real markets`);
        }
      } else {
        throw new Error('No markets data received');
      }
      
    } catch (err) {
      console.error('Error fetching markets:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch markets');
      
      // Fallback to empty array to prevent UI crash
      setMarkets([]);
      setIsFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMarkets, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const refetch = () => {
    fetchMarkets();
  };

  const value: MarketDataContextType = {
    markets,
    loading,
    error,
    refetch,
    lastUpdated,
    isFallback
  };

  return (
    <MarketDataContext.Provider value={value}>
      {children}
    </MarketDataContext.Provider>
  );
}
