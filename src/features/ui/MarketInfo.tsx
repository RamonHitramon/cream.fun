import React from 'react';
import { HyperliquidAsset } from '@/lib/hyperliquid/types';

interface MarketInfoProps {
  market: HyperliquidAsset;
}

export function MarketInfo({ market }: MarketInfoProps) {
  return (
    <div className="p-4 rounded-lg border" style={{
      backgroundColor: 'var(--color-hl-surface)',
      borderColor: 'var(--color-hl-border)'
    }}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--color-hl-text)' }}>
          {market.symbol}
        </h3>
        <span className="text-sm" style={{ color: 'var(--color-hl-muted)' }}>
          {market.maxLeverage ? `${market.maxLeverage}x` : 'N/A'}
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm" style={{ color: 'var(--color-hl-muted)' }}>
            Price:
          </span>
          <span className="font-medium" style={{ color: 'var(--color-hl-text)' }}>
            ${market.markPx?.toFixed(2) || 'N/A'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm" style={{ color: 'var(--color-hl-muted)' }}>
            Size Decimals:
          </span>
          <span className="font-medium" style={{ color: 'var(--color-hl-text)' }}>
            {market.szDecimals || 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
}

interface MarketListProps {
  markets: HyperliquidAsset[];
}

export function MarketList({ markets }: MarketListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {markets.map((market) => (
        <MarketInfo key={market.symbol} market={market} />
      ))}
    </div>
  );
}
