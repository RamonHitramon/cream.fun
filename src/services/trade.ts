import { getCurrentConfig } from '@/config/hyperliquid';
import { ensureAgent as ensureAgentFromService, hasAgent, type AgentKey } from './agent';
import { getNonce, bumpNonce, resetNonce, getRemoteNonce } from './nonce';
import { signAction, type SignedAction } from '@/utils/hlSign';

export interface OrderRequest {
  a: string;        // asset (BTC, ETH, etc.)
  b: 'buy' | 'sell'; // side
  t: 'limit' | 'market'; // type
  s: string;        // size
  p?: string;       // price (required for limit orders)
  ro?: boolean;     // reduce only
  cloid?: string;   // client order ID for idempotency
}

export interface CancelRequest {
  oid: string;      // order ID
}

export interface TradeResponse {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
  orderId?: string;
}

export interface OpenOrder {
  oid: string;
  asset: string;
  side: 'buy' | 'sell';
  type: 'limit' | 'market';
  size: string;
  price?: string;
  reduceOnly: boolean;
  timestamp: number;
}

export interface Position {
  asset: string;
  size: string;
  side: 'long' | 'short';
  entryPrice: string;
  markPrice: string;
  pnl: string;
}

// Agent key cache
let cachedAgentKey: AgentKey | null = null;
let agentPin: string | null = null;

// Retry logic with exponential backoff
async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  maxRetries: number = 3
): Promise<Response> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // If successful or client error (4xx), don't retry
      if (response.ok || response.status < 500) {
        return response;
      }
      
      // Retry on server errors (5xx) and rate limits (429)
      if (response.status === 429 || response.status >= 500) {
        const delay = Math.pow(2, attempt) * 1000; // exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Network error');
      
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}

// Human-readable error mapping
function mapErrorToReadable(error: unknown): string {
  if (typeof error === 'string') return error;
  
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = (error as { message: string }).message.toLowerCase();
    
    if (msg.includes('insufficient margin')) return 'Insufficient margin for this order';
    if (msg.includes('min size')) return 'Order size below minimum requirement';
    if (msg.includes('precision')) return 'Invalid price precision';
    if (msg.includes('not found')) return 'Order not found';
    if (msg.includes('unauthorized')) return 'Authentication required';
    if (msg.includes('rate limit')) return 'Rate limit exceeded, please wait';
    
    return (error as { message: string }).message;
  }
  
  return 'Unknown error occurred';
}

// Post signed action to exchange with retry logic
async function postExchange(signed: SignedAction, userAddress?: string): Promise<Record<string, unknown>> {
  const config = getCurrentConfig();
  
  try {
    const response = await fetchWithRetry(config.exchangeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...signed.action,
        nonce: signed.nonce,
        signature: signed.signature,
        user: userAddress
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      return data;
    } else {
      throw new Error(`Exchange error: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('[HL] Exchange post failed:', error);
    throw error;
  }
}

// Retry logic for signing/nonce errors
async function retryWithNonceReset<T>(
  operation: () => Promise<T>,
  agentAddress: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    // Check if it's a signing/nonce related error
    const errorMsg = error instanceof Error ? error.message.toLowerCase() : '';
    if (errorMsg.includes('nonce') || errorMsg.includes('signature') || errorMsg.includes('invalid')) {
      console.log('[HL] Nonce/signing error detected, attempting retry...');
      
      // Reset nonce and retry once
      await resetNonce(agentAddress);
      
      // Get fresh nonce from remote
      await getRemoteNonce(agentAddress);
      
      // Retry operation
      return await operation();
    }
    
    // Re-throw if not a nonce/signing error
    throw error;
  }
}

// Ensure agent key is available (UI will call this)
async function ensureAgent(): Promise<{ priv: string; address: string }> {
  try {
    // Check if agent exists
    if (!(await hasAgent())) {
      // Show SetupAgent modal for key generation and PIN setup
      // This will be handled by the UI layer
      throw new Error('Agent setup required. Please use SetupAgent modal first.');
    }
    
    // Agent exists, but we need PIN to decrypt it
    // For now, throw error to prompt UI to show PIN input
    throw new Error('PIN required to decrypt agent key. Please enter your PIN.');
  } catch (error) {
    console.error('[HL] Agent setup error:', error);
    throw error;
  }
}

// Ensure agent key is available
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function ensureAgentKey(pin: string): Promise<AgentKey> {
  if (cachedAgentKey && agentPin === pin) {
    return cachedAgentKey;
  }

  try {
    const agentKey = await ensureAgentFromService(pin);
    cachedAgentKey = agentKey;
    agentPin = pin;
    console.log('[HL] Agent key ensured:', agentKey.pub.slice(0, 20) + '...');
    return agentKey;
  } catch (error) {
    console.error('[HL] Failed to ensure agent key:', error);
    throw new Error('Failed to setup agent key. Please check your PIN and try again.');
  }
}

// Place order with agent key and nonce
export async function placeOrder(
  order: OrderRequest, 
  pin: string, 
  userAddress: string
): Promise<TradeResponse> {
  try {
    console.log('[HL] Placing order:', order);
    
    // Ensure agent key is available
    const agent = await ensureAgent();
    
    // Use retry logic for signing and exchange operations
    const result = await retryWithNonceReset(async () => {
      const nonce = await getNonce(agent.address);
      const signed = await signAction(order, agent.priv, nonce);
      return await postExchange(signed, userAddress);
    }, agent.address);
    
    // Bump nonce after successful order
    await bumpNonce(agent.address);
    
    console.log('[HL] Order placed successfully:', result);
    return {
      success: true,
      data: result,
      orderId: (result.orderId as string) || (result.oid as string)
    };
  } catch (error) {
    const errorMsg = mapErrorToReadable(error);
    console.error('[HL] Order placement error:', error);
    return {
      success: false,
      error: errorMsg
    };
  }
}

// Cancel order with agent key and nonce
export async function cancelOrder(
  oid: string, 
  pin: string, 
  userAddress: string
): Promise<TradeResponse> {
  try {
    console.log('[HL] Cancelling order:', oid);
    
    // Ensure agent key is available
    const agent = await ensureAgent();
    
    // Use retry logic for signing and exchange operations
    const result = await retryWithNonceReset(async () => {
      const nonce = await getNonce(agent.address);
      const cancelAction = { type: 'cancel', oid };
      const signed = await signAction(cancelAction, agent.priv, nonce);
      return await postExchange(signed, userAddress);
    }, agent.address);
    
    // Bump nonce after successful cancellation
    await bumpNonce(agent.address);
    
    console.log('[HL] Order cancelled successfully:', result);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    const errorMsg = mapErrorToReadable(error);
    console.error('[HL] Order cancellation error:', error);
    return {
      success: false,
      error: errorMsg
    };
  }
}

// Close position with agent key and nonce
export async function closePosition(
  asset: string, 
  size: string, 
  pin: string, 
  userAddress: string
): Promise<TradeResponse> {
  try {
    console.log('[HL] Closing position:', { asset, size });
    
    // Ensure agent key is available
    const agent = await ensureAgent();
    
    // Use retry logic for signing and exchange operations
    const result = await retryWithNonceReset(async () => {
      const nonce = await getNonce(agent.address);
      const closeAction = {
        type: 'order',
        a: asset,
        b: 'sell', // Assuming long position
        t: 'market',
        s: size,
        ro: true // reduce only
      };
      const signed = await signAction(closeAction, agent.priv, nonce);
      return await postExchange(signed, userAddress);
    }, agent.address);
    
    // Bump nonce after successful position close
    await bumpNonce(agent.address);
    
    console.log('[HL] Position closed successfully:', result);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    const errorMsg = mapErrorToReadable(error);
    console.error('[HL] Position close error:', error);
    return {
      success: false,
      error: errorMsg
    };
  }
}

// Get open orders (placeholder - implement based on actual API)
export async function getOpenOrders(): Promise<OpenOrder[]> {
  try {
    const config = getCurrentConfig();
    
    const response = await fetchWithRetry(config.infoUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'openOrders' })
    });

    if (response.ok) {
      const data = await response.json();
      return data.orders || [];
    }
    
    return [];
  } catch (error) {
    console.error('[HL] Failed to fetch open orders:', error);
    return [];
  }
}

// Get positions (placeholder - implement based on actual API)
export async function getPositions(): Promise<Position[]> {
  try {
    const config = getCurrentConfig();
    
    const response = await fetchWithRetry(config.infoUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'positions' })
    });

    if (response.ok) {
      const data = await response.json();
      return data.positions || [];
    }
    
    return [];
  } catch (error) {
    console.error('[HL] Failed to fetch positions:', error);
    return [];
  }
}

// Utility functions
export function getCachedAgentKey(): AgentKey | null {
  return cachedAgentKey;
}

export function clearAgentKeyCache(): void {
  cachedAgentKey = null;
  agentPin = null;
  console.log('[HL] Agent key cache cleared');
}

export function isAgentKeyCached(): boolean {
  return cachedAgentKey !== null;
}
