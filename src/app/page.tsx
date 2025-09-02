'use client';

import React from 'react';
import { Card } from '@/features/ui/Card';
import { Button } from '@/features/ui/Button';
import { KPIPanel } from '@/features/ui/KPI';
import { CreateStrategy } from '@/features/strategy/CreateStrategy';
import { ActivePositions } from '@/features/positions/ActivePositions';
import { MarketDataProvider, useMarketData } from '@/components/MarketDataProvider';
import { LoadingState } from '@/features/ui/LoadingState';

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

function HomePageContent() {
  const { markets, loading, error, refetch, lastUpdated } = useMarketData();
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-hl-bg)' }}>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* TopBar */}
        <Card className="mb-6">
          <div className="flex items-center justify-between px-4 py-4 h-14">
            <div className="text-xl font-bold" style={{ color: 'var(--color-hl-primary)' }}>
              cream.fun
            </div>
            <div className="flex items-center gap-4">
              {lastUpdated && (
                <div className="text-sm" style={{ color: 'var(--color-hl-muted)' }}>
                  Updated: {new Date(lastUpdated).toLocaleTimeString()}
                </div>
              )}
              <Button variant="primary">
                Connect
              </Button>
            </div>
          </div>
        </Card>

        {/* KPI Panel */}
        <KPIPanel data={updatedKpiData} />

        {/* Main Content Grid wrapped in LoadingState */}
        <LoadingState loading={loading} error={error} onRetry={refetch}>
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(680px,1fr)_minmax(460px,0.8fr)] gap-6">
            {/* Left Column - Create Strategy */}
            <div>
              <CreateStrategy pairs={marketPairs} markets={markets} />
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

export default function HomePage() {
  return (
    <MarketDataProvider>
      <HomePageContent />
    </MarketDataProvider>
  );
}