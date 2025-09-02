'use client';
import dynamic from 'next/dynamic';
import HeaderPrivy from '@/components/HeaderPrivy';

// Подтягиваем превью корзины (мы делали его ранее)
const CreateStrategyPreviewBlock = dynamic(
  () => import('@/features/trade/basket/CreateStrategyPreviewBlock'),
  { ssr: false }
);

// Если есть другие блоки (KPI/панели) — добавляй импорт сюда аналогично.

export default function Page() {
  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      <HeaderPrivy />

      {/* Основной контент страницы. Здесь можно вернуть твою Create Strategy секцию, KPI и т.д. */}
      <CreateStrategyPreviewBlock />
    </main>
  );
}