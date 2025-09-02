export const runtime = 'nodejs';

type Perp = {
  symbol: string;
  maxLeverage?: number;
  szDecimals?: number;
  markPx?: number;
};

export async function GET() {
  try {
    // Если у тебя уже есть рабочий код запроса к Hyperliquid — оставь его.
    // Здесь — «обёртка» с безопасными логами и единым форматом ответа { perps, error? }.

    // Пример: берём кэш, если есть, но не дольше 30 сек
    const res = await fetch('https://api.hyperliquid.xyz/info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'meta',
      }),
      // ^^^ если у тебя есть отдельный источник — замени. ИНАЧЕ оставь ниже «заглушку»:
      // Этот fetch можно закомментировать и вернуть MOCK, чтобы UI не пустел
      // cache: 'no-store',
    });

    // Если выше не используешь внешний источник — верни MOCK (временно, чтобы UI ожил):
    // const perps: Perp[] = [
    //   { symbol: 'BTC', markPx: 62000, szDecimals: 3, maxLeverage: 50 },
    //   { symbol: 'ETH', markPx: 2800, szDecimals: 3, maxLeverage: 50 },
    //   { symbol: 'SOL', markPx: 160, szDecimals: 3, maxLeverage: 50 },
    // ];
    // return Response.json({ perps });

    if (!res.ok) {
      const text = await res.text();
      console.error('MARKETS_FETCH_NON_OK', res.status, text);
      return Response.json({ perps: [], error: `Upstream ${res.status}` }, { status: 200 });
    }
    const data = await res.json();
    // Ожидаем формат { perps: Perp[] } — если другой, нормализуем:
    const perps: Perp[] = data.meta?.universe?.map((asset: { name: string; maxLeverage?: number; szDecimals?: number; markPx?: number }) => ({
      symbol: asset.name,
      maxLeverage: asset.maxLeverage,
      szDecimals: asset.szDecimals,
      markPx: asset.markPx,
    })) || [];

    console.log('MARKETS_OK', { count: perps.length });
    return Response.json({ perps });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error('MARKETS_FETCH_ERROR', errorMessage);
    return Response.json({ perps: [], error: errorMessage }, { status: 200 });
  }
}
