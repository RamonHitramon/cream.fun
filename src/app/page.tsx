'use client';
import HeaderPrivy from '@/components/HeaderPrivy';

export default function Page() {
  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      <HeaderPrivy />
      
      {/* Простой контент для тестирования */}
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">Welcome to cream.fun</h2>
        <p className="text-hl-muted">
          This is a test page to verify Privy wallet integration.
        </p>
      </div>
    </main>
  );
}