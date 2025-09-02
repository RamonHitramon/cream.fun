import React from 'react';
import { MarketDataProvider } from '@/components/MarketDataProvider';
import { PageClient } from '@/components/PageClient';
import dynamic from 'next/dynamic';

const CreateStrategyPreviewBlock = dynamic(
  () => import('@/features/trade/basket/CreateStrategyPreviewBlock')
);

export default function HomePage() {
  return (
    <MarketDataProvider>
      <PageClient />
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <CreateStrategyPreviewBlock selectedSymbols={[]} />
      </div>
    </MarketDataProvider>
  );
}