/* eslint-disable @typescript-eslint/no-explicit-any */
export const runtime = 'nodejs';

type Perp = { symbol: string; markPx?: number; szDecimals?: number; maxLeverage?: number };

function normalizeToPerps(data: any): Perp[] {
  const arr: any[] =
    Array.isArray(data) ? data :
    Array.isArray(data?.perps) ? data.perps :
    Array.isArray(data?.markets) ? data.markets :
    Array.isArray(data?.universe) ? data.universe :
    [];
  return arr.map((x: any) => {
    const symbol = x.symbol ?? x.coin ?? x.ticker ?? x.name;
    const px = x.markPx ?? x.markPrice ?? x.price ?? x.mid ?? x.last;
    const sz = x.szDecimals ?? x.sizeDecimals ?? x.stepDecimals ?? 3;
    const lev = x.maxLeverage ?? x.maxLev ?? undefined;
    if (!symbol || px == null) return null;
    return { symbol: String(symbol).toUpperCase(), markPx: Number(px), szDecimals: Number(sz), maxLeverage: lev != null ? Number(lev) : undefined };
  }).filter(Boolean) as Perp[];
}

export async function GET() {
  const upstream = process.env.HL_UPSTREAM; // <- обязателен
  if (!upstream) {
    return Response.json({ perps: [], source: 'error', error: 'HL_UPSTREAM env is not set' }, { status: 200 });
  }

  try {
    const r = await fetch(upstream, { cache: 'no-store', next: { revalidate: 0 } });
    const text = await r.text(); // читаем как текст для дебага
    if (!r.ok) {
      console.error('HL_UPSTREAM_NON_OK', r.status, upstream, text.slice(0, 2000));
      return Response.json({ perps: [], source: 'upstream', upstreamStatus: { url: upstream, status: r.status }, error: `non-200 from upstream` }, { status: 200 });
    }
    // попробуем JSON
    let json: any;
    try { json = JSON.parse(text); } catch (e) {
      console.error('HL_UPSTREAM_BAD_JSON', upstream, text.slice(0, 2000));
      return Response.json({ perps: [], source: 'upstream', upstreamStatus: { url: upstream, status: r.status }, error: 'invalid JSON from upstream' }, { status: 200 });
    }

    const perps = normalizeToPerps(json);
    console.log('HL_UPSTREAM_OK', upstream, 'count=', perps.length);
    if (perps.length === 0) {
      return Response.json({ perps: [], source: 'upstream', upstreamStatus: { url: upstream, status: r.status }, error: 'empty perps from upstream' }, { status: 200 });
    }
    return Response.json({ perps, source: 'upstream', upstreamStatus: { url: upstream, status: r.status }, error: null });
      } catch (_: any) {
      console.error('HL_UPSTREAM_ERR', upstream, 'fetch error');
      return Response.json({ perps: [], source: 'error', error: 'fetch error' }, { status: 200 });
    }
}
