'use client';
import dynamic from 'next/dynamic';
import HeaderPrivy from '@/components/HeaderPrivy';
import DebugMarkets from '@/components/DebugMarkets';

const CreateStrategyPreviewBlock = dynamic(
  () => import('@/features/trade/basket/CreateStrategyPreviewBlock'),
  { ssr: false }
);

export default function Page() {
  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      <HeaderPrivy />
      <DebugMarkets />
      <CreateStrategyPreviewBlock />
    </main>
  );
}