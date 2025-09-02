'use client';
import { useEffect, useState } from 'react';

export default function DebugMarkets() {
  const [health, setHealth] = useState<string>('checking…');
  const [markets, setMarkets] = useState<string>('loading…');

  useEffect(() => {
    (async () => {
      try {
        const h = await fetch('/api/_health', { cache: 'no-store' });
        const hj = await h.json();
        setHealth(`ok=${hj.ok} ts=${hj.ts}`);
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        setHealth('ERROR: ' + errorMessage);
      }
      try {
        const r = await fetch('/api/hyperliquid/markets', { cache: 'no-store' });
        const j = await r.json();
        setMarkets(`perps=${Array.isArray(j?.perps) ? j.perps.length : 0} error=${j?.error ?? 'none'}`);
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        setMarkets('ERROR: ' + errorMessage);
      }
    })();
  }, []);

  return (
    <div className="text-xs text-hl-muted rounded-xl border border-hl-border bg-hl-surface p-3">
      <div className="font-semibold mb-1">Debug</div>
      <div>health: {health}</div>
      <div>markets: {markets}</div>
    </div>
  );
}
