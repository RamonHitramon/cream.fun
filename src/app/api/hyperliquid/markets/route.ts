import { NextResponse } from 'next/server';

type HyperliquidAsset = {
  name: string;
  maxLeverage?: number;
  szDecimals?: number;
  markPx?: number;
};

type HyperliquidResponse = {
  meta?: {
    universe?: HyperliquidAsset[];
  };
};

export async function GET() {
  try {
    const response = await fetch('https://api.hyperliquid.xyz/info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'meta',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: HyperliquidResponse = await response.json();
    
    // Преобразуем данные в нужный формат
    const perps = data.meta?.universe?.map((asset: HyperliquidAsset) => ({
      symbol: asset.name,
      maxLeverage: asset.maxLeverage,
      szDecimals: asset.szDecimals,
      markPx: asset.markPx,
    })) || [];

    return NextResponse.json({ perps });
  } catch (error) {
    console.error('Error fetching Hyperliquid markets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch markets' },
      { status: 500 }
    );
  }
}
