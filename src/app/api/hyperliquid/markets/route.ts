export const runtime = 'nodejs';

type Perp = {
  symbol: string;
  maxLeverage?: number;
  szDecimals?: number;
  markPx?: number;
};

async function fetchPerpsFromHL(): Promise<Perp[]> {
  const base = process.env.NEXT_PUBLIC_HL_BASE_URL || 'https://api.hyperliquid.xyz';
  
  // Пробуем несколько известных путей — у тебя может быть свой прокси/эндпоинт,
  // этот код аккуратно нормализует то, что вернётся:
  const candidates = [
    `${base}/info`,                  // вариант 1: сводка
    `${base}/perps`,                 // вариант 2: список перпов
    `${base}/markets/perps`,         // вариант 3: нейминг-маршрут
  ];

  for (const url of candidates) {
    try {
      console.log(`Trying HL endpoint: ${url}`);
      const r = await fetch(url, { 
        cache: 'no-store', 
        next: { revalidate: 0 },
        headers: {
          'User-Agent': 'cream.fun/1.0'
        }
      });
      
      if (!r.ok) {
        console.log(`HL endpoint ${url} returned status: ${r.status}`);
        continue;
      }
      
      const data = await r.json();
      console.log(`HL endpoint ${url} returned data:`, JSON.stringify(data).slice(0, 200) + '...');

      // Попытка нормализовать разные форматы ответа → к нашему Perp[]
      const arr: any[] =
        Array.isArray(data) ? data :
        Array.isArray(data?.perps) ? data.perps :
        Array.isArray(data?.markets) ? data.markets :
        [];

      const perps: Perp[] = arr
        .map((x: any) => {
          const symbol = x.symbol ?? x.coin ?? x.ticker ?? x.name;
          const px = x.markPx ?? x.markPrice ?? x.price ?? x.mid ?? x.last;
          const szDecimals = x.szDecimals ?? x.sizeDecimals ?? x.stepDecimals ?? 3;
          const maxLev = x.maxLeverage ?? x.maxLev ?? x.lev ?? undefined;
          
          if (!symbol || !px) return null;
          
          return { 
            symbol: String(symbol).toUpperCase(), 
            markPx: Number(px), 
            szDecimals: Number(szDecimals), 
            maxLeverage: maxLev ? Number(maxLev) : undefined 
          };
        })
        .filter(Boolean) as Perp[];

      if (perps.length > 0) {
        console.log(`Successfully fetched ${perps.length} perps from ${url}`);
        return perps;
      }
    } catch (error) {
      console.log(`Error fetching from ${url}:`, error);
      // попробуем следующий
    }
  }
  
  console.log('All HL endpoints failed, returning empty array');
  return [];
}

export async function GET() {
  try {
    console.log('=== HL Markets API called ===');
    console.log('HL Base URL:', process.env.NEXT_PUBLIC_HL_BASE_URL || 'default');
    
    const perps = await fetchPerpsFromHL();
    
    if (perps.length > 0) {
      console.log(`Returning ${perps.length} real perps`);
      return Response.json({ perps });
    }

    // мягкий фолбэк, чтобы UI не пустел
    console.log('Using fallback mock data');
    const mock: Perp[] = [
      { symbol: 'BTC', markPx: 62000, szDecimals: 3, maxLeverage: 50 },
      { symbol: 'ETH', markPx: 2800,  szDecimals: 3, maxLeverage: 50 },
      { symbol: 'SOL', markPx: 160,   szDecimals: 3, maxLeverage: 50 },
      { symbol: 'MATIC', markPx: 0.85, szDecimals: 3, maxLeverage: 50 },
      { symbol: 'LINK', markPx: 18.5, szDecimals: 3, maxLeverage: 50 },
    ];
    
    return Response.json({ 
      perps: mock, 
      error: 'fallback: empty upstream',
      fallback: true 
    });
    
  } catch (e: any) {
    console.error('HL Markets API error:', e);
    return Response.json({ 
      perps: [], 
      error: String(e?.message || e) 
    }, { status: 200 });
  }
}
