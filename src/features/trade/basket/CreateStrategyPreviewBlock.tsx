'use client';
import { useState } from 'react';
import { previewBasket } from '@/features/trade/basket/preview';
import type { BasketInput, BasketPreview } from '@/features/trade/basket/types';
import { usePerpMetas } from '@/features/trade/hooks/usePerpMetas';

export default function CreateStrategyPreviewBlock() {
  const metas = usePerpMetas();
  const [amount, setAmount] = useState<number>(1000);
  const [selected, setSelected] = useState<string[]>(['BTC','ETH']);
  const [side, setSide] = useState<'BUY'|'SELL'>('BUY');
  const [preview, setPreview] = useState<BasketPreview | null>(null);

  if (!metas || Object.keys(metas).length === 0) return <div className="text-hl-muted p-2">Loading markets...</div>;

  const build = () => {
    const input: BasketInput = {
      orderType: 'market',
      side,
      totalUsd: amount,
      symbols: selected,
    };
    const pv = previewBasket(input, metas);
    setPreview(pv);
  };

  return (
    <section className="card p-4 space-y-4">
      <h2 className="text-hl-success font-bold">Create Strategy — Preview</h2>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-sm text-hl-muted">Amount (USD)</label>
          <input
            type="number"
            value={amount}
            onChange={(e)=>setAmount(Number(e.target.value || 0))}
            className="w-full rounded-xl bg-hl-surface border border-hl-border p-2"
            min={0}
          />
        </div>
        <div>
          <label className="text-sm text-hl-muted">Side</label>
          <div className="flex gap-2 mt-1">
            <button
              className={`px-3 py-1 rounded-xl ${side==='BUY'?'bg-hl-success text-black':'bg-hl-surface border border-hl-border'}`}
              onClick={()=>setSide('BUY')}
            >
              Long (BUY)
            </button>
            <button
              className={`px-3 py-1 rounded-xl ${side==='SELL'?'bg-hl-danger text-white':'bg-hl-surface border border-hl-border'}`}
              onClick={()=>setSide('SELL')}
            >
              Short (SELL)
            </button>
          </div>
        </div>
        <div className="self-end">
          <button className="btn-primary" onClick={build}>Build Strategy Preview</button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-hl-muted">Selected pairs:</div>
        <div className="flex flex-wrap gap-2">
          {Object.keys(metas).slice(0, 10).map(symbol => (
            <button
              key={symbol}
              onClick={() => {
                if (selected.includes(symbol)) {
                  setSelected(selected.filter(s => s !== symbol));
                } else {
                  setSelected([...selected, symbol]);
                }
              }}
              className={`px-3 py-1 rounded-xl text-sm ${
                selected.includes(symbol)
                  ? 'bg-hl-success text-black'
                  : 'bg-hl-surface border border-hl-border'
              }`}
            >
              {symbol}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSelected(Object.keys(metas).slice(0, 10))}
            className="px-3 py-1 rounded-xl bg-hl-surface border border-hl-border text-sm"
          >
            Select All
          </button>
          <button
            onClick={() => setSelected([])}
            className="px-3 py-1 rounded-xl bg-hl-surface border border-hl-border text-sm"
          >
            Clear
          </button>
        </div>
      </div>

      {preview && (
        <div className="space-y-3">
          <div className="text-sm text-hl-muted">Estimated used USD: {preview.estUsedUsd.toFixed(2)}</div>

          <div className="card p-3">
            <div className="text-sm font-semibold mb-2">Prepared orders</div>
            <table className="w-full text-sm">
              <thead className="text-hl-muted">
                <tr>
                  <th className="text-left py-1">Symbol</th>
                  <th className="text-left py-1">Side</th>
                  <th className="text-left py-1">Size (sz)</th>
                  <th className="text-left py-1">Est. USD</th>
                </tr>
              </thead>
              <tbody>
                {preview.prepared.map((o)=>(
                  <tr key={o.symbol} className="border-t border-hl-border">
                    <td className="py-1">{o.symbol}</td>
                    <td className="py-1">{o.side}</td>
                    <td className="py-1">{o.sz}</td>
                    <td className="py-1">{((metas[o.symbol]?.markPx ?? 0)*o.sz).toFixed(2)}</td>
                  </tr>
                ))}
                {preview.prepared.length===0 && (
                  <tr><td colSpan={4} className="py-2 text-hl-muted">No valid orders</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {preview.skipped.length>0 && (
            <div className="card p-3">
              <div className="text-sm font-semibold mb-2">Skipped</div>
              <ul className="list-disc pl-5 text-sm">
                {preview.skipped.map(s => (
                  <li key={s.symbol}><span className="text-hl-muted">{s.symbol}:</span> {s.reason}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
