import type { BasketInput, BasketPreview, PreparedOrder } from './types';
import type { PerpMetaMap } from '../hl/types';

const SAFE_MIN_USD = 5;
const pow10 = (n:number)=>Math.pow(10,n);

export function previewBasket(input: BasketInput, metas: PerpMetaMap): BasketPreview {
  const { totalUsd, symbols, side, orderType, limitPxBySymbol } = input;
  const perSymbolUsd = totalUsd / Math.max(symbols.length, 1);

  const prepared: PreparedOrder[] = [];
  const skipped: {symbol:string;reason:string}[] = [];

  for (const s of symbols) {
    const m = metas[s];
    const px = m?.markPx;
    if (!px || px <= 0) { skipped.push({symbol:s,reason:'no price'}); continue; }

    const minUsd = Math.max(m?.minOrderUsd ?? 0, SAFE_MIN_USD);
    if (perSymbolUsd < minUsd) { skipped.push({symbol:s,reason:`below min ${minUsd}`}); continue; }

    let sz = perSymbolUsd / px;
    const dec = Math.max(0, m?.szDecimals ?? 3);
    const mult = pow10(dec);
    sz = Math.floor(sz * mult) / mult;
    if (sz <= 0) { skipped.push({symbol:s,reason:'size=0'}); continue; }

    const o: PreparedOrder = { symbol:s, side, sz, type:orderType };
    if (orderType === 'limit') {
      const lpx = limitPxBySymbol?.[s];
      if (!lpx || lpx <= 0) { skipped.push({symbol:s,reason:'no limit px'}); continue; }
      o.px = lpx;
    }
    prepared.push(o);
  }

  const estUsedUsd = prepared.reduce((a,o)=>a+(metas[o.symbol]?.markPx ?? 0)*o.sz,0);
  return { prepared, skipped, estUsedUsd };
}
