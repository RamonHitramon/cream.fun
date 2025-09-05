'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/features/ui/Card';
import { useLastTrades, useOrderBook, useMarketDataStore } from '@/stores/marketData';
// import { TradeData, OrderBookLevel } from '@/services/wsClient';

interface RealtimeMarketDataProps {
  assets: string[];
  maxTrades?: number;
  maxOrderBookLevels?: number;
}

export function RealtimeMarketData({ 
  assets, 
  maxTrades = 3, 
  maxOrderBookLevels = 10 
}: RealtimeMarketDataProps) {
  const [selectedAsset, setSelectedAsset] = useState<string>(assets[0] || '');
  const { subscribeAsset, unsubscribeAsset } = useMarketDataStore();

  // Subscribe to assets when they change
  useEffect(() => {
    assets.forEach(asset => {
      subscribeAsset(asset);
    });

    return () => {
      assets.forEach(asset => {
        unsubscribeAsset(asset);
      });
    };
  }, [assets, subscribeAsset, unsubscribeAsset]);

  // Set first asset as selected if none selected
  useEffect(() => {
    if (!selectedAsset && assets.length > 0) {
      setSelectedAsset(assets[0]);
    }
  }, [selectedAsset, assets]);

  const formatCurrency = (value: string) => {
    const num = Number(value);
    if (isNaN(num)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(num);
  };

  const formatNumber = (value: string, decimals: number = 6) => {
    const num = Number(value);
    if (isNaN(num)) return '0';
    return num.toFixed(decimals);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getSideColor = (side: 'buy' | 'sell') => {
    return side === 'buy' ? 'text-green-600' : 'text-red-600';
  };

  const getSideBgColor = (side: 'buy' | 'sell') => {
    return side === 'buy' ? 'bg-green-50' : 'bg-red-50';
  };

  if (assets.length === 0) {
    return (
      <Card>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-hl-text)' }}>
            Real-time Market Data
          </h2>
          <div className="text-center py-8 text-hl-muted">
            No assets selected for real-time data
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-hl-text)' }}>
          Real-time Market Data
        </h2>

        {/* Asset Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-hl-text)' }}>
            Select Asset:
          </label>
          <select
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value)}
            className="px-3 py-2 rounded border text-sm"
            style={{
              backgroundColor: 'var(--color-hl-surface)',
              borderColor: 'var(--color-hl-border)',
              color: 'var(--color-hl-text)'
            }}
          >
            {assets.map(asset => (
              <option key={asset} value={asset}>{asset}</option>
            ))}
          </select>
        </div>

        {selectedAsset && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Trades */}
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-hl-text)' }}>
                Recent Trades ({selectedAsset})
              </h3>
              <RecentTrades 
                asset={selectedAsset} 
                maxTrades={maxTrades}
                formatCurrency={formatCurrency}
                formatNumber={formatNumber}
                formatTime={formatTime}
                getSideColor={getSideColor}
                getSideBgColor={getSideBgColor}
              />
            </div>

            {/* Order Book */}
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-hl-text)' }}>
                Order Book ({selectedAsset})
              </h3>
              <OrderBook 
                asset={selectedAsset} 
                maxLevels={maxOrderBookLevels}
                formatCurrency={formatCurrency}
                formatNumber={formatNumber}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

interface RecentTradesProps {
  asset: string;
  maxTrades: number;
  formatCurrency: (value: string) => string;
  formatNumber: (value: string, decimals?: number) => string;
  formatTime: (timestamp: number) => string;
  getSideColor: (side: 'buy' | 'sell') => string;
  getSideBgColor: (side: 'buy' | 'sell') => string;
}

function RecentTrades({ 
  asset, 
  maxTrades, 
  formatCurrency, 
  formatNumber, 
  formatTime, 
  getSideColor, 
  getSideBgColor 
}: RecentTradesProps) {
  const trades = useLastTrades(asset);
  const recentTrades = trades.slice(0, maxTrades);

  if (recentTrades.length === 0) {
    return (
      <div className="text-center py-4 text-hl-muted">
        No recent trades
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {recentTrades.map((trade, index) => (
        <div 
          key={`${trade.time}-${index}`}
          className={`p-3 rounded-lg border ${getSideBgColor(trade.side)}`}
          style={{ borderColor: 'var(--color-hl-border)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                trade.side === 'buy' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {trade.side.toUpperCase()}
              </span>
              <span className="font-mono text-sm" style={{ color: 'var(--color-hl-text)' }}>
                {formatNumber(trade.sz)}
              </span>
            </div>
            <div className="text-right">
              <div className={`font-mono font-semibold ${getSideColor(trade.side)}`}>
                {formatCurrency(trade.px)}
              </div>
              <div className="text-xs text-hl-muted">
                {formatTime(trade.time)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface OrderBookProps {
  asset: string;
  maxLevels: number;
  formatCurrency: (value: string) => string;
  formatNumber: (value: string, decimals?: number) => string;
}

function OrderBook({ asset, maxLevels, formatCurrency, formatNumber }: OrderBookProps) {
  const orderBook = useOrderBook(asset);

  if (!orderBook || (!orderBook.levels.bids && !orderBook.levels.asks)) {
    return (
      <div className="text-center py-4 text-hl-muted">
        No order book data
      </div>
    );
  }

  const bids = orderBook.levels.bids?.slice(0, maxLevels) || [];
  const asks = orderBook.levels.asks?.slice(0, maxLevels) || [];

  return (
    <div className="space-y-4">
      {/* Asks (Sell Orders) */}
      <div>
        <div className="text-sm font-medium text-red-600 mb-2">Asks (Sell)</div>
        <div className="space-y-1">
          {asks.map((ask, index) => (
            <div key={`ask-${index}`} className="flex justify-between items-center py-1">
              <span className="font-mono text-sm text-red-600">
                {formatCurrency(ask.px)}
              </span>
              <span className="font-mono text-sm" style={{ color: 'var(--color-hl-text)' }}>
                {formatNumber(ask.sz)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Spread */}
      {bids.length > 0 && asks.length > 0 && (
        <div className="text-center py-2 border-t border-b" style={{ borderColor: 'var(--color-hl-border)' }}>
          <div className="text-sm text-hl-muted">
            Spread: {formatCurrency((Number(asks[0].px) - Number(bids[0].px)).toString())}
          </div>
        </div>
      )}

      {/* Bids (Buy Orders) */}
      <div>
        <div className="text-sm font-medium text-green-600 mb-2">Bids (Buy)</div>
        <div className="space-y-1">
          {bids.map((bid, index) => (
            <div key={`bid-${index}`} className="flex justify-between items-center py-1">
              <span className="font-mono text-sm text-green-600">
                {formatCurrency(bid.px)}
              </span>
              <span className="font-mono text-sm" style={{ color: 'var(--color-hl-text)' }}>
                {formatNumber(bid.sz)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
