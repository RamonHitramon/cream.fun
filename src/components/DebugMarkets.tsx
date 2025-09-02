'use client';
import { useEffect, useState } from 'react';

export default function DebugMarkets() {
  const [health, setHealth] = useState<string>('checking…');
  const [markets, setMarkets] = useState<string>('loading…');

  useEffect(() => {
    (async () => {
      try {
        const h = await fetch('/api/health', { cache: 'no-store' });
        const text = await h.text();
        setHealth(`${h.status} ${h.ok ? 'OK' : 'ERR'} · ${text}`);
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        setHealth('FETCH ERR: ' + errorMessage);
      }

      try {
        const r = await fetch('/api/hyperliquid/markets', { cache: 'no-store' });
        const j = await r.json().catch(async () => ({ raw: await r.text() }));
        const count = Array.isArray(j?.perps) ? j.perps.length : 0;
        const error = j?.error ?? 'none';
        setMarkets(`${r.status} ${r.ok ? 'OK' : 'ERR'} · perps=${count} · error=${error}`);
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        setMarkets('FETCH ERR: ' + errorMessage);
      }
    })();
  }, []);

  return (
    <div className="card p-3">
      <div className="text-xs text-hl-muted">
        <div className="font-semibold mb-1">Debug</div>
        <div>health: {health}</div>
        <div>markets: {markets}</div>
      </div>
    </div>
  );
}
