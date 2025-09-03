'use client';

import React from 'react';
import { TopBar } from '@/components/TopBar';
import { KPIPanel } from '@/features/ui/KPI';
import { CreateStrategy } from '@/features/strategy/CreateStrategy';
import { ActivePositions } from '@/features/positions/ActivePositions';
import { OrderHistory } from '@/features/orders/OrderHistory';
import { useMarketData } from './MarketDataProvider';
import { HyperliquidAsset } from '@/lib/hyperliquid/types';
import DebugMarkets from './DebugMarkets';

// Mock KPI data for now
const mockKpiData = [
  { title: 'Balance', value: '$0.00', color: 'default' as const },
  { title: 'Long Volume', value: '$0.00', color: 'success' as const },
  { title: 'Short Volume', value: '$0.00', color: 'danger' as const },
  { title: 'Total PnL', value: '$0.00', color: 'default' as const },
  { title: 'Long PnL', value: '$0.00', color: 'success' as const },
  { title: 'Short PnL', value: '$0.00', color: 'danger' as const },
  { title: 'Total Markets', value: '0', color: 'default' as const },
  { title: 'Active Pairs', value: '0', color: 'default' as const },
];

export function PageClient() {
  const { markets, loading, error, source, upstreamStatus } = useMarketData();

  // Convert markets to pairs for backward compatibility
  const marketPairs = markets.map((market: HyperliquidAsset) => market.symbol);

  // Update KPI data with real market count
  const updatedKpiData = mockKpiData.map(item => {
    if (item.title === 'Total Markets') {
      return { ...item, value: markets.length.toString() };
    }
    if (item.title === 'Active Pairs') {
      return { ...item, value: marketPairs.length.toString() };
    }
    return item;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-hl-background">
        <TopBar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-hl-text">Loading markets...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-hl-background">
        <TopBar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-hl-text">
            <div className="text-hl-danger mb-2">Error loading markets</div>
            <div className="text-sm text-hl-muted">{error}</div>
            {source === 'upstream' && upstreamStatus && (
              <div className="text-xs text-hl-muted mt-2">
                Upstream: {upstreamStatus.url} [Status: {upstreamStatus.status}]
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hl-background">
      <TopBar />
      <div className="container mx-auto px-4 py-8">
        <KPIPanel data={updatedKpiData} />

        {/* Debug widget for monitoring upstream status */}
        <div className="mb-4">
          <DebugMarkets />
        </div>

        {/* Show upstream status info */}
        {source === 'upstream' && upstreamStatus && (
          <div className="mb-4 p-3 rounded-lg border border-green-500/20 bg-green-500/10">
            <div className="flex items-center gap-2 text-green-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">
                Connected to upstream: {upstreamStatus.url}
              </span>
            </div>
            <p className="text-xs text-green-600/80 mt-1 ml-6">
              Status: {upstreamStatus.status} · Markets: {markets.length}
            </p>
          </div>
        )}

        {/* Show error info if upstream failed */}
        {source === 'error' && (
          <div className="mb-4 p-3 rounded-lg border border-red-500/20 bg-red-500/10">
            <div className="flex items-center gap-2 text-red-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">
                Upstream connection failed
              </span>
            </div>
            <p className="text-xs text-red-600/80 mt-1 ml-6">
              {error || 'Unable to fetch market data from upstream'}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <CreateStrategy pairs={marketPairs} markets={markets} />
          <ActivePositions />
        </div>

        <OrderHistory />
      </div>
    </div>
  );
}
