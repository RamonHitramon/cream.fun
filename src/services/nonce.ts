import { getCurrentConfig } from '@/config/hyperliquid';

export interface NonceResponse {
  nonce: number;
  timestamp: number;
}

export interface NonceCache {
  [address: string]: {
    nonce: number;
    timestamp: number;
    lastBumped: number;
  };
}

// In-memory cache for nonces
const nonceCache: NonceCache = {};

// Cache TTL: 5 minutes
const CACHE_TTL = 5 * 60 * 1000;

// Nonce bump interval: 1 second (currently unused)
// const BUMP_INTERVAL = 1000;

/**
 * Get current nonce for an address from Hyperliquid API
 */
export async function getNonce(address: string): Promise<number> {
  try {
    const config = getCurrentConfig();
    
    // Check cache first
    const cached = nonceCache[address];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.nonce;
    }

    // Fetch from API
    const response = await fetch(config.infoUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'nonce',
        user: address
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch nonce: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const nonce = data.nonce || 0;

    // Update cache
    nonceCache[address] = {
      nonce,
      timestamp: Date.now(),
      lastBumped: Date.now()
    };

    console.log(`[HL] Fetched nonce for ${address}: ${nonce}`);
    return nonce;
  } catch (error) {
    console.error(`[HL] Error fetching nonce for ${address}:`, error);
    
    // Return cached nonce if available, otherwise 0
    const cached = nonceCache[address];
    if (cached) {
      console.log(`[HL] Using cached nonce for ${address}: ${cached.nonce}`);
      return cached.nonce;
    }
    
    return 0;
  }
}

/**
 * Bump nonce for an address (increment by 1)
 */
export async function bumpNonce(address: string): Promise<number> {
  const currentNonce = await getNonce(address);
  const newNonce = currentNonce + 1;

  // Update cache
  if (nonceCache[address]) {
    nonceCache[address].nonce = newNonce;
    nonceCache[address].lastBumped = Date.now();
  }

  console.log(`[HL] Bumped nonce for ${address}: ${currentNonce} → ${newNonce}`);
  return newNonce;
}

/**
 * Get next nonce for an address (current + 1, but don't bump yet)
 */
export async function getNextNonce(address: string): Promise<number> {
  const currentNonce = await getNonce(address);
  return currentNonce + 1;
}

/**
 * Reset nonce cache for an address (force refresh from API)
 */
export function resetNonceCache(address: string): void {
  delete nonceCache[address];
  console.log(`[HL] Reset nonce cache for ${address}`);
}

/**
 * Reset all nonce caches
 */
export function resetAllNonceCaches(): void {
  Object.keys(nonceCache).forEach(address => {
    delete nonceCache[address];
  });
  console.log('[HL] Reset all nonce caches');
}

/**
 * Get nonce cache status for debugging
 */
export function getNonceCacheStatus(): NonceCache {
  return { ...nonceCache };
}

/**
 * Validate nonce format
 */
export function validateNonce(nonce: number): boolean {
  return Number.isInteger(nonce) && nonce >= 0;
}

/**
 * Ensure nonce is fresh (not older than 5 minutes)
 */
export function isNonceFresh(address: string): boolean {
  const cached = nonceCache[address];
  if (!cached) return false;
  
  return Date.now() - cached.timestamp < CACHE_TTL;
}

/**
 * Get nonce with automatic refresh if stale
 */
export async function getFreshNonce(address: string): Promise<number> {
  if (!isNonceFresh(address)) {
    console.log(`[HL] Nonce for ${address} is stale, refreshing...`);
    resetNonceCache(address);
  }
  
  return await getNonce(address);
}
