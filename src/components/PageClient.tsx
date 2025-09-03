'use client';

import React from 'react';
import { KPIPanel } from '@/features/ui/KPI';
import { CreateStrategy } from '@/features/strategy/CreateStrategy';
import { ActivePositions } from '@/features/positions/ActivePositions';
import { ActionButtons } from '@/features/strategy/ActionButtons';
import { OrderHistory } from '@/features/orders/OrderHistory';
import { useMarketData } from '@/components/MarketDataProvider';
import { usePerpMetas } from '@/features/trade/hooks/usePerpMetas';
import { LoadingState } from '@/features/ui/LoadingState';
import { TopBar } from '@/components/TopBar';

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
  const { markets, loading, error, refetch } = useMarketData();
  const metas = usePerpMetas();

  const marketPairs = markets.map(market => market.display);

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
  console.log('Perp Metas:', metas);
  console.log('Market Pairs:', marketPairs);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-hl-bg)' }}>
      <TopBar />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <KPIPanel data={updatedKpiData} />

        <LoadingState loading={loading} error={error} onRetry={refetch}>
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(680px,1fr)_minmax(460px,0.8fr)] gap-6">
            <div className="space-y-6">
              <CreateStrategy pairs={marketPairs} markets={markets} metas={metas} />
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
