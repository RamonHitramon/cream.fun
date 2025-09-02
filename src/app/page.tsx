'use client';
import { useEffect, useState } from 'react';
import { usePrivyAdapter } from '@/lib/wallet/usePrivyAdapter';

export default function Page() {
  const { adapter, ready } = usePrivyAdapter();
  const [addr, setAddr] = useState<string>('');

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!ready || !adapter) { setAddr(''); return; }
      const a = await adapter.getAddress();
      if (alive) setAddr(a);
    })();
    return () => { alive = false; };
  }, [ready, adapter]);

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-4">
      <header className="card p-4 flex items-center justify-between">
        <div className="text-xl font-bold">cream.fun</div>
        <div className="text-xs text-hl-muted">
          {addr ? `Connected: ${addr}` : 'Wallet: not connected'}
        </div>
      </header>
    </main>
  );
}