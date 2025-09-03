'use client';

import React from 'react';
import { KPIPanel } from '@/features/ui/KPI';
import { CreateStrategy } from '@/features/strategy/CreateStrategy';
import { ActivePositions } from '@/features/positions/ActivePositions';
import { ActionButtons } from '@/features/strategy/ActionButtons';
import { OrderHistory } from '@/features/orders/OrderHistory';
import { useMarketData } from '@/components/MarketDataProvider';
import { LoadingState } from '@/features/ui/LoadingState';
import { TopBar } from '@/components/TopBar';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { HyperliquidAsset } from '@/lib/hyperliquid/types';

const kpiData = [
  { title: 'Balance', value: '$0.00', color: 'default' as const },
  { title: 'Long Volume', value: '$0.00', color: 'success' as const },
  { title: 'Short Volume', value: '$0.00', color: 'danger' as const },
  { title: 'Total PnL', value: '$0.00', color: 'default' as const },
  { title: 'Long PnL', value: '$0.00', color: 'success' as const },
  { title: 'Short PnL', value: '$0.00', color: 'danger' as const },
  {
    title: 'Refresh',
    value: '🔄',
    color: 'default' as const,
    onClick: () => console.log('Refresh clicked')
  }
];

export function PageClient() {
  const { markets, loading, error, refetch, isFallback } = useMarketData();

  const marketPairs = markets.map(market => market.symbol);

  const updatedKpiData = [
    ...kpiData.slice(0, -1),
    {
      title: 'Markets',
      value: markets.length.toString(),
      color: 'default' as const
    },
    {
      title: 'Refresh',
      value: '🔄',
      color: 'default' as const,
      onClick: refetch
    }
  ];

  console.log('Markets:', markets);
  console.log('Market Pairs:', marketPairs);
  console.log('Using fallback data:', isFallback);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-hl-bg)' }}>
      <TopBar />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <KPIPanel data={updatedKpiData} />

        {/* Show fallback warning if using mock data */}
        {isFallback && (
          <div className="mb-4 p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/10">
            <div className="flex items-center gap-2 text-yellow-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">
                Using demo data - Hyperliquid API temporarily unavailable
              </span>
            </div>
            <p className="text-xs text-yellow-600/80 mt-1 ml-6">
              Real-time market data will appear here once the API connection is restored
            </p>
          </div>
        )}

        <LoadingState loading={loading} error={error} onRetry={refetch}>
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(680px,1fr)_minmax(460px,0.8fr)] gap-6">
            <div className="space-y-6">
              <CreateStrategy pairs={marketPairs} markets={markets} />
              <ActionButtons />
            </div>

            <div className="space-y-6">
              <ActivePositions />
              <OrderHistory />
            </div>
          </div>
        </LoadingState>
      </div>
    </div>
  );
}
