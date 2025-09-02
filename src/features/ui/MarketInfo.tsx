import React from 'react';
import { PerpMarket } from '@/lib/hyperliquid/types';
import { formatCurrency, formatPercentage } from '@/lib/format';

interface MarketInfoProps {
  market: PerpMarket;
  showDetails?: boolean;
}

export function MarketInfo({ market, showDetails = false }: MarketInfoProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium" style={{ color: 'var(--color-hl-text)' }}>
            {market.display}
          </div>
          <div className="text-sm" style={{ color: 'var(--color-hl-muted)' }}>
            {market.symbol}
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold" style={{ color: 'var(--color-hl-text)' }}>
            {market.markPx ? formatCurrency(market.markPx) : 'N/A'}
          </div>
          {market.funding !== undefined && (
            <div className="text-sm" style={{ 
              color: market.funding >= 0 ? 'var(--color-hl-success)' : 'var(--color-hl-danger)' 
            }}>
              {formatPercentage(market.funding * 100)}
            </div>
          )}
        </div>
      </div>
      
      {showDetails && (
        <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: 'var(--color-hl-muted)' }}>
          <div>Max Leverage: {market.maxLeverage}x</div>
          <div>OI: {market.openInterest ? formatCurrency(market.openInterest) : 'N/A'}</div>
        </div>
      )}
    </div>
  );
}

interface MarketListProps {
  markets: PerpMarket[];
  selectedMarkets: string[];
  onMarketToggle: (marketId: string) => void;
  showDetails?: boolean;
}

export function MarketList({ markets, selectedMarkets, onMarketToggle, showDetails = false }: MarketListProps) {
  return (
    <div className="space-y-2">
      {markets.map((market) => (
        <label
          key={market.id}
          className="flex items-center p-3 rounded-lg cursor-pointer transition-colors hover:bg-white/5"
          style={{
            backgroundColor: selectedMarkets.includes(market.id) ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
            border: selectedMarkets.includes(market.id) ? '1px solid var(--color-hl-primary)' : '1px solid transparent'
          }}
        >
          <input
            type="checkbox"
            checked={selectedMarkets.includes(market.id)}
            onChange={() => onMarketToggle(market.id)}
            className="mr-3 w-4 h-4 rounded"
            style={{
              accentColor: 'var(--color-hl-primary)',
              backgroundColor: 'var(--color-hl-bg)',
              borderColor: 'var(--color-hl-border)'
            }}
          />
          <div className="flex-1">
            <MarketInfo market={market} showDetails={showDetails} />
          </div>
        </label>
      ))}
    </div>
  );
}
