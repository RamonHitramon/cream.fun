'use client';
import { useEffect, useState } from 'react';

export default function DebugMarkets() {
  const [markets, setMarkets] = useState('…');

  useEffect(() => {
    (async () => {
      const r = await fetch('/api/hyperliquid/markets', { cache: 'no-store' });
      const j = await r.json().catch(async () => ({ raw: await r.text() }));
      const count = Array.isArray(j?.perps) ? j.perps.length : 0;
      const src = j?.source ?? 'n/a';
      const up = j?.upstreamStatus?.url ? `${j.upstreamStatus.url} [${j.upstreamStatus.status}]` : '–';
      const err = j?.error ?? 'none';
      setMarkets(`${r.status} ${r.ok ? 'OK' : 'ERR'} · perps=${count} · source=${src} · upstream=${up} · error=${err}`);
    })();
  }, []);

  return (
    <div className="text-xs text-hl-muted rounded-xl border border-hl-border bg-hl-surface p-3">
      <div className="font-semibold mb-1">Debug</div>
      <div>markets: {markets}</div>
    </div>
  );
}
