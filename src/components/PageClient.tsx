'use client';

import React, { useState, useMemo } from 'react';
import { TopBar } from '@/components/TopBar';
import { KPIPanel } from '@/features/ui/KPI';
import { CreateStrategy } from '@/features/strategy/CreateStrategy';
import { ActivePositions } from '@/features/positions/ActivePositions';
import { OpenOrders } from '@/features/orders/OpenOrders';
import { FillsTable } from '@/components/FillsTable';
import { BalancePanel } from '@/components/BalancePanel';
import { useMarketData } from './MarketDataProvider';
import { HyperliquidAsset } from '@/lib/hyperliquid/types';
import { useWalletConnection } from '@/lib/wallet/useWalletAdapter';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
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
  const { address: userAddress, isConnected } = useWalletConnection();
  const [pin, setPin] = useState<string>('');

  // Auto-refresh data every 15 seconds (only in development)
  useAutoRefresh({ 
    userAddress: userAddress || '', 
    enabled: isConnected && !!userAddress && process.env.NODE_ENV === 'development'
  });

  // Convert markets to pairs for backward compatibility
  const marketPairs = useMemo(() => 
    markets.map((market: HyperliquidAsset) => market.symbol), 
    [markets]
  );

  // Update KPI data with real market count
  const updatedKpiData = useMemo(() => 
    mockKpiData.map(item => {
      if (item.title === 'Total Markets') {
        return { ...item, value: markets.length.toString() };
      }
      if (item.title === 'Active Pairs') {
        return { ...item, value: markets.length.toString() }; // Используем markets.length вместо marketPairs.length
      }
      return item;
    }),
    [markets] // Убираем marketPairs из зависимостей
  );

  // В production используем простую версию
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="min-h-screen bg-hl-background">
        <TopBar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-hl-text">
            <h1 className="text-2xl font-bold mb-4">Cream.fun Trading Platform</h1>
            <p className="text-hl-muted">Advanced trading platform for Hyperliquid</p>
          </div>
        </div>
      </div>
    );
  }

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

        {/* PIN Input for authenticated users */}
        {isConnected && userAddress && (
          <div className="mb-6 p-4 bg-hl-surface/50 border border-hl-border rounded-lg">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium" style={{ color: 'var(--color-hl-text)' }}>
                PIN for trading:
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter your PIN"
                className="px-3 py-2 rounded border text-sm"
                style={{
                  backgroundColor: 'var(--color-hl-surface)',
                  borderColor: 'var(--color-hl-border)',
                  color: 'var(--color-hl-text)'
                }}
              />
              <span className="text-xs text-hl-muted">
                Required for placing orders and closing positions
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <CreateStrategy pairs={marketPairs} markets={markets} />
            {isConnected && userAddress && pin ? (
              <ActivePositions userAddress={userAddress} pin={pin} />
            ) : (
              <div className="p-6 border-2 border-dashed border-hl-border rounded-lg">
                <div className="text-center text-hl-muted">
                  <div className="text-lg font-medium mb-2">Connect Wallet & Enter PIN</div>
                  <div className="text-sm">To view your positions and place orders</div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - 1 column */}
          <div className="space-y-6">
            <BalancePanel />
          </div>
        </div>

        {/* Open Orders and Trade History */}
        {isConnected && userAddress && pin && (
          <>
            <div className="mb-6">
              <OpenOrders userAddress={userAddress} pin={pin} />
            </div>
            <FillsTable userAddress={userAddress} pin={pin} />
          </>
        )}

        {/* Show message for non-connected users */}
        {!isConnected && (
          <div className="text-center py-12 text-hl-muted">
            <div className="text-lg font-medium mb-2">Connect Your Wallet</div>
            <div className="text-sm">Connect your wallet to start trading and view your portfolio</div>
          </div>
        )}
      </div>
    </div>
  );
}
