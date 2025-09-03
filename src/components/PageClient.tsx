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

        {isFallback && (
          <div className="mb-4 p-3 rounded-lg border" style={{
            backgroundColor: 'rgba(255, 111, 97, 0.1)',
            borderColor: 'var(--color-hl-danger)',
            color: 'var(--color-hl-danger)'
          }}>
            ⚠️ Using fallback data - Hyperliquid API temporarily unavailable
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
