export const runtime = 'nodejs';

type Perp = {
  symbol: string;
  maxLeverage?: number;
  szDecimals?: number;
  markPx?: number;
};

export async function GET() {
  try {
    // TODO: заменить MOCK на реальный источник HL
    const perps: Perp[] = [
      { symbol: 'BTC', markPx: 62000, szDecimals: 3, maxLeverage: 50 },
      { symbol: 'ETH', markPx: 2800,  szDecimals: 3, maxLeverage: 50 },
      { symbol: 'SOL', markPx: 160,   szDecimals: 3, maxLeverage: 50 },
      { symbol: 'XRP', markPx: 0.55,  szDecimals: 0, maxLeverage: 20 },
      { symbol: 'BNB', markPx: 580,   szDecimals: 3, maxLeverage: 20 },
    ];
    return Response.json({ perps });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error('MARKETS_ERROR', errorMessage);
    return Response.json({ perps: [], error: errorMessage }, { status: 200 });
  }
}
