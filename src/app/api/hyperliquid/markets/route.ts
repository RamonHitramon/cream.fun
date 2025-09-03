/* eslint-disable @typescript-eslint/no-explicit-any */

export const runtime = 'nodejs';

type Perp = {
  symbol: string;
  maxLeverage?: number;
  szDecimals?: number;
  markPx?: number;
};

async function fetchPerpsFromHL(): Promise<Perp[]> {
  // Пробуем несколько базовых URL для Hyperliquid
  const baseUrls = [
    process.env.NEXT_PUBLIC_HL_BASE_URL || 'https://api.hyperliquid.xyz',
    'https://hyperliquid.xyz',
    'https://api.hyperliquid-testnet.xyz', // testnet если основной не работает
  ];
  
  // Пробуем несколько известных путей Hyperliquid API
  const endpoints = [
    '/info',                  // основной info endpoint
    '/perps',                 // perps endpoint
    '/markets/perps',         // markets perps endpoint
    '/meta',                  // meta endpoint
    '/meta/perps',            // meta perps endpoint
    '/v1/info',               // v1 info endpoint
    '/v1/meta',               // v1 meta endpoint
    '/v1/markets',            // v1 markets endpoint
    '/api/info',              // api info endpoint
    '/api/markets',           // api markets endpoint
  ];

  for (const baseUrl of baseUrls) {
    for (const endpoint of endpoints) {
      const url = baseUrl + endpoint;
      
      try {
        console.log(`Trying HL endpoint: ${url}`);
        const r = await fetch(url, { 
          cache: 'no-store', 
          next: { revalidate: 0 },
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'cream-fun-v1/1.0'
          }
        });
        
        console.log(`HL endpoint ${url} returned status: ${r.status}`);
        
        if (!r.ok) {
          console.log(`Skipping ${url} - status ${r.status}`);
          continue;
        }
        
        const data = await r.json();
        console.log(`HL endpoint ${url} returned data:`, JSON.stringify(data).slice(0, 200) + '...');

        // Попытка нормализовать разные форматы ответа → к нашему Perp[]
        const arr: any[] =
          Array.isArray(data) ? data :
          Array.isArray(data?.perps) ? data.perps :
          Array.isArray(data?.markets) ? data.markets :
          Array.isArray(data?.data) ? data.data :
          Array.isArray(data?.result) ? data.result :
          [];

        const perps: Perp[] = arr
          .map((x: any) => {
            const symbol = x.symbol ?? x.coin ?? x.ticker ?? x.name ?? x.asset;
            const px = x.markPx ?? x.markPrice ?? x.price ?? x.mid ?? x.last ?? x.markPrice;
            const szDecimals = x.szDecimals ?? x.sizeDecimals ?? x.stepDecimals ?? x.decimals ?? 3;
            const maxLev = x.maxLeverage ?? x.maxLev ?? x.lev ?? x.leverage ?? undefined;
            
            if (!symbol || !px) return null;
            
            return { 
              symbol: String(symbol).toUpperCase(), 
              markPx: Number(px), 
              szDecimals: Number(szDecimals), 
              maxLeverage: maxLev ? Number(maxLev) : undefined 
            };
          })
          .filter(Boolean) as Perp[];

        console.log(`HL endpoint ${url} normalized to ${perps.length} perps`);
        
        if (perps.length > 0) {
          console.log(`Successfully fetched ${perps.length} perps from ${url}`);
          return perps;
        }
      } catch (error) {
        console.log(`HL endpoint ${url} failed:`, error);
        continue;
      }
    }
  }
  
  console.log('All HL endpoints failed, returning empty array');
  return [];
}

export async function GET() {
  try {
    console.log('=== HL Markets API called ===');
    const perps = await fetchPerpsFromHL();
    
    if (perps.length > 0) {
      console.log(`Returning ${perps.length} real perps from Hyperliquid`);
      return Response.json({ perps });
    }

    // мягкий фолбэк, чтобы UI не пустел
    const mock: Perp[] = [
      { symbol: 'BTC', markPx: 62000, szDecimals: 3, maxLeverage: 50 },
      { symbol: 'ETH', markPx: 2800,  szDecimals: 3, maxLeverage: 50 },
      { symbol: 'SOL', markPx: 160,   szDecimals: 3, maxLeverage: 50 },
      { symbol: 'MATIC', markPx: 0.8, szDecimals: 3, maxLeverage: 40 },
      { symbol: 'LINK', markPx: 15,   szDecimals: 3, maxLeverage: 40 },
      { symbol: 'UNI', markPx: 7,     szDecimals: 3, maxLeverage: 40 },
      { symbol: 'AAVE', markPx: 85,   szDecimals: 3, maxLeverage: 40 },
      { symbol: 'CRV', markPx: 0.5,   szDecimals: 3, maxLeverage: 40 },
      { symbol: 'AVAX', markPx: 35,   szDecimals: 3, maxLeverage: 40 },
      { symbol: 'DOT', markPx: 6,     szDecimals: 3, maxLeverage: 40 },
      { symbol: 'ADA', markPx: 0.5,   szDecimals: 3, maxLeverage: 40 },
      { symbol: 'XRP', markPx: 0.6,   szDecimals: 3, maxLeverage: 40 },
      { symbol: 'DOGE', markPx: 0.08, szDecimals: 3, maxLeverage: 40 },
      { symbol: 'SHIB', markPx: 0.00002, szDecimals: 6, maxLeverage: 40 },
      { symbol: 'LTC', markPx: 75,    szDecimals: 3, maxLeverage: 40 },
      { symbol: 'BCH', markPx: 450,   szDecimals: 3, maxLeverage: 40 },
    ];
    
    console.log('Using fallback mock data');
    return Response.json({ 
      perps: mock, 
      error: 'fallback: Hyperliquid API endpoints not responding',
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
