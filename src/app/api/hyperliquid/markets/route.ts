export const runtime = 'nodejs';

interface HyperliquidMetaRequest {
  type: 'meta';
}

interface HyperliquidAsset {
  name: string;
  szDecimals: number;
  maxLeverage: number;
}

interface HyperliquidMetaResponse {
  universe: HyperliquidAsset[];
}

export async function GET() {
  const upstream = process.env.HL_UPSTREAM;
  if (!upstream) {
    return Response.json({ 
      perps: [], 
      source: 'error', 
      error: 'HL_UPSTREAM env is not set' 
    }, { status: 200 });
  }

  try {
    const requestBody: HyperliquidMetaRequest = { type: 'meta' };
    
    const response = await fetch(upstream, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      cache: 'no-store',
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      console.error('HL_UPSTREAM_NON_OK', response.status, upstream);
      return Response.json({ 
        perps: [], 
        source: 'upstream', 
        upstreamStatus: { url: upstream, status: response.status }, 
        error: `HTTP ${response.status}: ${response.statusText}` 
      }, { status: 200 });
    }

    const responseText = await response.text();
    let jsonData: HyperliquidMetaResponse;
    
    try {
      jsonData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('HL_UPSTREAM_BAD_JSON', upstream, responseText.slice(0, 500));
      return Response.json({ 
        perps: [], 
        source: 'upstream', 
        upstreamStatus: { url: upstream, status: response.status }, 
        error: 'Invalid JSON response from upstream' 
      }, { status: 200 });
    }

    if (!jsonData.universe || !Array.isArray(jsonData.universe)) {
      console.error('HL_UPSTREAM_NO_DATA', upstream, 'Response structure:', Object.keys(jsonData));
      return Response.json({ 
        perps: [], 
        source: 'upstream', 
        upstreamStatus: { url: upstream, status: response.status }, 
        error: 'No universe array in response' 
      }, { status: 200 });
    }

    const perps = jsonData.universe.map((asset): { 
      symbol: string; 
      markPx?: number; 
      szDecimals?: number; 
      maxLeverage?: number; 
    } => ({
      symbol: asset.name.toUpperCase(),
      markPx: undefined, // Hyperliquid meta endpoint doesn't provide current prices
      szDecimals: asset.szDecimals,
      maxLeverage: asset.maxLeverage
    }));

    console.log('HL_UPSTREAM_OK', upstream, 'count=', perps.length);
    
    if (perps.length === 0) {
      return Response.json({ 
        perps: [], 
        source: 'upstream', 
        upstreamStatus: { url: upstream, status: response.status }, 
        error: 'Empty universe array from upstream' 
      }, { status: 200 });
    }

    return Response.json({ 
      perps, 
      source: 'upstream', 
      upstreamStatus: { url: upstream, status: response.status }, 
      error: null 
    });

  } catch (fetchError) {
    const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown fetch error';
    console.error('HL_UPSTREAM_ERR', upstream, errorMessage);
    return Response.json({ 
      perps: [], 
      source: 'error', 
      error: `Fetch error: ${errorMessage}` 
    }, { status: 200 });
  }
}
