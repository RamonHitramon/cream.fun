'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { HyperliquidAsset, HyperliquidResponse } from '@/lib/hyperliquid/types';

interface MarketDataContextType {
  markets: HyperliquidAsset[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  source: 'upstream' | 'error' | null;
  upstreamStatus?: {
    url: string;
    status: number;
  };
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
  const [source, setSource] = useState<'upstream' | 'error' | null>(null);
  const [upstreamStatus, setUpstreamStatus] = useState<{ url: string; status: number } | undefined>();

  // В production используем простую версию
  if (process.env.NODE_ENV === 'production') {
    const value: MarketDataContextType = {
      markets: [],
      loading: false,
      error: null,
      lastUpdated: new Date(),
      source: 'upstream',
      upstreamStatus: { url: 'https://api.hyperliquid.xyz/info', status: 200 },
    };

    return (
      <MarketDataContext.Provider value={value}>
        {children}
      </MarketDataContext.Provider>
    );
  }

  const fetchMarkets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/hyperliquid/markets', { cache: 'no-store' });
      const data: HyperliquidResponse = await response.json();
      
      setMarkets(data.perps);
      setSource(data.source);
      setUpstreamStatus(data.upstreamStatus);
      setLastUpdated(new Date());
      
      if (data.error) {
        setError(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch markets');
      setSource('error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarkets();
    
    // Auto-refresh every 30 seconds (only in development)
    let interval: NodeJS.Timeout | null = null;
    if (process.env.NODE_ENV === 'development') {
      interval = setInterval(fetchMarkets, 30000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [fetchMarkets]); // Добавляем fetchMarkets в зависимости

  const value: MarketDataContextType = useMemo(() => ({
    markets,
    loading,
    error,
    lastUpdated,
    source,
    upstreamStatus,
  }), [markets, loading, error, lastUpdated, source, upstreamStatus]);

  return (
    <MarketDataContext.Provider value={value}>
      {children}
    </MarketDataContext.Provider>
  );
}
