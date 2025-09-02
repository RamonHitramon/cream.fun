import { useState, useEffect } from 'react';
import { PerpMarket, MarketsResponse } from '@/lib/hyperliquid/types';

interface UseMarketsReturn {
  markets: PerpMarket[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: number | null;
}

export function useMarkets(): UseMarketsReturn {
  const [markets, setMarkets] = useState<PerpMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const fetchMarkets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/markets');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: MarketsResponse = await response.json();
      setMarkets(data.perps);
      setLastUpdated(data.updatedAt);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch markets';
      setError(errorMessage);
      console.error('Error fetching markets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, []);

  return {
    markets,
    loading,
    error,
    refetch: fetchMarkets,
    lastUpdated
  };
}
