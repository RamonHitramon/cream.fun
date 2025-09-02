'use client';

import React from 'react';
import { KPIPanel } from '@/features/ui/KPI';
import { CreateStrategy } from '@/features/strategy/CreateStrategy';
import { ActivePositions } from '@/features/positions/ActivePositions';
import { useMarketData } from '@/components/MarketDataProvider';
import { usePerpMetas } from '@/features/trade/hl/usePerpMetas';
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
  const { metas } = usePerpMetas(); // Получаем метаданные перпов
  
  const marketPairs = markets.map(market => market.display);

  // Update KPI data with real market count and refresh button
  const updatedKpiData = [
    ...kpiData.slice(0, -1), // Remove original refresh button
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

  // Логируем метаданные для отладки
  console.log('Markets:', markets);
  console.log('Perp Metas:', metas);
  console.log('Market Pairs:', marketPairs);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-hl-bg)' }}>
      {/* TopBar */}
      <TopBar />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* KPI Panel */}
        <KPIPanel data={updatedKpiData} />

        {/* Main Content Grid wrapped in LoadingState */}
        <LoadingState loading={loading} error={error} onRetry={refetch}>
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(680px,1fr)_minmax(460px,0.8fr)] gap-6">
            {/* Left Column - Create Strategy */}
            <div>
              <CreateStrategy pairs={marketPairs} markets={markets} metas={metas} />
            </div>

            {/* Right Column - Active Positions */}
            <div>
              <ActivePositions />
            </div>
          </div>
        </LoadingState>
      </div>
    </div>
  );
}
