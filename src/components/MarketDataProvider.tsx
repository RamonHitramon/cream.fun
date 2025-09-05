'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
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

  const fetchMarkets = async () => {
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
  };

  useEffect(() => {
    fetchMarkets();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMarkets, 30000);
    
    return () => clearInterval(interval);
  }, []);

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
