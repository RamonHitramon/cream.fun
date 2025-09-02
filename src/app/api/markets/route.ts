import { NextResponse } from 'next/server';
import type { 
  PerpMarket, 
  MarketsResponse, 
  HyperliquidMetaResponse, 
  HyperliquidUniverse,
  HyperliquidAssetCtx
} from '@/lib/hyperliquid/types';

const HL_INFO = 'https://api.hyperliquid.xyz/info';
// На всякий случай фиксируем рантайм
export const runtime = 'nodejs';

async function postInfo<T>(body: unknown): Promise<T> {
  const r = await fetch(HL_INFO, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    // Кэш ответа на минуту
    next: { revalidate: 60 },
  });
  if (!r.ok) throw new Error(`HL info error ${r.status}`);
  return r.json() as Promise<T>;
}

function toNum(x?: string | number | null): number | undefined {
  if (x === null || x === undefined) return undefined;
  const n = typeof x === 'number' ? x : parseFloat(String(x));
  return Number.isFinite(n) ? n : undefined;
}

export async function GET() {
  try {
    // Берём «вселенную» перпов (meta) и контекст (цены, funding, OI)
    const [meta, metaAndCtx] = await Promise.all([
      postInfo<HyperliquidMetaResponse>({ type: 'meta' }),
      postInfo<[HyperliquidMetaResponse, HyperliquidAssetCtx[]]>({ type: 'metaAndAssetCtxs' }),
    ]);

    const universe: HyperliquidUniverse[] = meta?.universe ?? metaAndCtx?.[0]?.universe ?? [];
    const ctxs: HyperliquidAssetCtx[] = metaAndCtx?.[1] ?? [];

                   const perps: PerpMarket[] = universe.map((a, idx) => {
                 const ctx = ctxs[idx] ?? {};
                 const name: string = a?.name;
                 return {
                   id: `${name}-PERP`,
                   symbol: name,
                   display: name, // Убираем -PERP из отображения
                   base: name,
                   quote: 'USDC',
                   maxLeverage: toNum(a?.maxLeverage),
                   szDecimals: a?.szDecimals,
                   markPx: toNum(ctx?.markPx),
                   midPx: toNum(ctx?.midPx),
                   funding: toNum(ctx?.funding),
                   openInterest: toNum(ctx?.openInterest),
                 };
               });

    const res: MarketsResponse = { updatedAt: Date.now(), perps };
    return NextResponse.json(res, { status: 200 });
  } catch (error) {
    console.error('Error fetching markets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch markets data' },
      { status: 500 }
    );
  }
}
