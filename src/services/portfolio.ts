import { getCurrentConfig } from '@/config/hyperliquid';

export interface Position {
  asset: string;
  side: 'long' | 'short';
  size: string;
  entryPrice: string;
  markPrice: string;
  pnl: string;
  pnlPercent: string;
  leverage: string;
}

export interface Order {
  id: string;
  asset: string;
  side: 'buy' | 'sell';
  type: 'limit' | 'market';
  size: string;
  price?: string;
  status: 'open' | 'partial' | 'cancelled' | 'filled';
  timestamp: number;
  reduceOnly?: boolean;
}

export interface Portfolio {
  equity: string;
  marginUsed: string;
  marginAvailable: string;
  positions: Position[];
  totalPnl: string;
  totalPnlPercent: string;
}

export async function getPortfolio(userAddress: string): Promise<Portfolio> {
  const config = getCurrentConfig();
  
  try {
    const response = await fetch(config.infoUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'clearinghouseState',
        user: userAddress
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Parse the response and extract portfolio data
    const marginSummary = data.marginSummary;
    const assetPositions = data.assetPositions || [];
    
    const positions: Position[] = assetPositions
      .filter((pos: Record<string, unknown>) => parseFloat((pos.position as Record<string, unknown>).coin as string) !== 0)
      .map((pos: Record<string, unknown>) => ({
        asset: (pos.position as Record<string, unknown>).coin as string,
        side: parseFloat((pos.position as Record<string, unknown>).coin as string) > 0 ? 'long' : 'short',
        size: Math.abs(parseFloat((pos.position as Record<string, unknown>).coin as string)).toString(),
        entryPrice: ((pos.position as Record<string, unknown>).entryPx as string) || '0',
        markPrice: (pos.position as Record<string, unknown>).positionValue ? 
          (parseFloat((pos.position as Record<string, unknown>).positionValue as string) / Math.abs(parseFloat((pos.position as Record<string, unknown>).coin as string))).toString() : '0',
        pnl: ((pos.position as Record<string, unknown>).unrealizedPnl as string) || '0',
        pnlPercent: (pos.position as Record<string, unknown>).returnOnEquity ? 
          (parseFloat((pos.position as Record<string, unknown>).returnOnEquity as string) * 100).toFixed(2) : '0',
        leverage: ((pos.position as Record<string, unknown>).leverage as string) || '1'
      }));

    return {
      equity: marginSummary?.accountValue || '0',
      marginUsed: marginSummary?.totalMarginUsed || '0',
      marginAvailable: marginSummary?.totalNtlPos || '0',
      positions,
      totalPnl: marginSummary?.totalUnrealizedPnl || '0',
      totalPnlPercent: marginSummary?.totalReturnOnEquity ? 
        (parseFloat(marginSummary.totalReturnOnEquity) * 100).toFixed(2) : '0'
    };
  } catch (error) {
    console.error('Failed to fetch portfolio:', error);
    // Return mock data for development
    return {
      equity: '10000',
      marginUsed: '2000',
      marginAvailable: '8000',
      positions: [],
      totalPnl: '0',
      totalPnlPercent: '0'
    };
  }
}

export async function getOpenOrders(userAddress: string): Promise<Order[]> {
  const config = getCurrentConfig();
  
  try {
    const response = await fetch(config.infoUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'openOrders',
        user: userAddress
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Parse open orders
    const orders: Order[] = (data || []).map((order: Record<string, unknown>) => ({
      id: (order.oid as number)?.toString() || Math.random().toString(),
      asset: order.coin as string,
      side: order.side === 'B' ? 'buy' : 'sell',
      type: order.limitPx ? 'limit' : 'market',
      size: order.sz as string,
      price: order.limitPx as string,
      status: 'open',
      timestamp: (order.timestamp as number) || Date.now(),
      reduceOnly: (order.reduceOnly as boolean) || false
    }));

    return orders;
  } catch (error) {
    console.error('Failed to fetch open orders:', error);
    return [];
  }
}

export async function getFills(userAddress: string, limit: number = 100): Promise<Record<string, unknown>[]> {
  const config = getCurrentConfig();
  
  try {
    const response = await fetch(config.infoUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'userFills',
        user: userAddress
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return (data || []).slice(0, limit);
  } catch (error) {
    console.error('Failed to fetch fills:', error);
    return [];
  }
}
