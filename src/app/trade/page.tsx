import React from 'react';
import { MarketDataProvider } from '@/components/MarketDataProvider';
import { PageClient } from '@/components/PageClient';

export default function TradePage() {
  return (
    <MarketDataProvider>
      <PageClient />
    </MarketDataProvider>
  );
}
