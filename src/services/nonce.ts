import { getCurrentConfig } from '@/config/hyperliquid';

export interface NonceResponse {
  nonce: number;
  timestamp: number;
}

export interface NonceCache {
  [agentAddress: string]: NonceResponse;
}

// In-memory cache for nonces
let nonceCache: NonceCache = {};

// IndexedDB wrapper for persistent storage
class NonceDB {
  private dbName = 'hl_nonce_db';
  private version = 1;
  private storeName = 'nonces';

  async init(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'address' });
        }
      };
    });
  }

  async getNonce(address: string): Promise<NonceResponse | null> {
    try {
      const db = await this.init();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(address);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result || null);
      });
    } catch (error) {
      console.error('[HL NONCE] Failed to get nonce from IndexedDB:', error);
      return null;
    }
  }

  async setNonce(address: string, nonce: NonceResponse): Promise<void> {
    try {
      const db = await this.init();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.put({ address, ...nonce });
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error('[HL NONCE] Failed to set nonce in IndexedDB:', error);
    }
  }

  async deleteNonce(address: string): Promise<void> {
    try {
      const db = await this.init();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(address);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error('[HL NONCE] Failed to delete nonce from IndexedDB:', error);
    }
  }

  async clearAll(): Promise<void> {
    try {
      const db = await this.init();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.clear();
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error('[HL NONCE] Failed to clear IndexedDB:', error);
    }
  }
}

const nonceDB = new NonceDB();

/**
 * Get current nonce from Hyperliquid info endpoint
 */
export async function getRemoteNonce(agentAddress: string): Promise<number> {
  try {
    const config = getCurrentConfig();
    console.log('[HL NONCE] Fetching remote nonce for address:', agentAddress.slice(0, 20) + '...');
    
    const response = await fetch(config.infoUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'userState',
        user: agentAddress,
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data || typeof data.nonce !== 'number') {
      throw new Error('Invalid response format: missing nonce');
    }

    console.log('[HL NONCE] Remote nonce fetched:', data.nonce);
    return data.nonce;
  } catch (error) {
    console.error('[HL NONCE] Failed to fetch remote nonce:', error);
    throw new Error(`Failed to fetch remote nonce: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get nonce with lazy loading strategy
 */
export async function getNonce(agentAddress: string): Promise<number> {
  try {
    // Check in-memory cache first
    if (nonceCache[agentAddress]) {
      console.log('[HL NONCE] Using cached nonce for address:', agentAddress.slice(0, 20) + '...');
      return nonceCache[agentAddress].nonce;
    }

    // Check persistent storage
    const storedNonce = await nonceDB.getNonce(agentAddress);
    if (storedNonce) {
      // Update in-memory cache
      nonceCache[agentAddress] = storedNonce;
      console.log('[HL NONCE] Using stored nonce for address:', agentAddress.slice(0, 20) + '...');
      return storedNonce.nonce;
    }

    // Fetch from remote and store locally
    console.log('[HL NONCE] No local nonce found, fetching from remote...');
    const remoteNonce = await getRemoteNonce(agentAddress);
    
    const nonceData: NonceResponse = {
      nonce: remoteNonce,
      timestamp: Date.now(),
    };

    // Store in both memory and persistent storage
    nonceCache[agentAddress] = nonceData;
    await nonceDB.setNonce(agentAddress, nonceData);
    
    console.log('[HL NONCE] Nonce fetched and stored:', remoteNonce);
    return remoteNonce;
  } catch (error) {
    console.error('[HL NONCE] Failed to get nonce:', error);
    throw error;
  }
}

/**
 * Increment nonce after successful exchange operation
 */
export async function bumpNonce(agentAddress: string): Promise<number> {
  try {
    let currentNonce: number;
    
    // Get current nonce (from cache or remote)
    if (nonceCache[agentAddress]) {
      currentNonce = nonceCache[agentAddress].nonce;
    } else {
      currentNonce = await getNonce(agentAddress);
    }

    const newNonce = currentNonce + 1;
    const nonceData: NonceResponse = {
      nonce: newNonce,
      timestamp: Date.now(),
    };

    // Update both memory and persistent storage
    nonceCache[agentAddress] = nonceData;
    await nonceDB.setNonce(agentAddress, nonceData);
    
    console.log('[HL NONCE] Nonce bumped for address:', agentAddress.slice(0, 20) + '...', `${currentNonce} → ${newNonce}`);
    return newNonce;
  } catch (error) {
    console.error('[HL NONCE] Failed to bump nonce:', error);
    throw error;
  }
}

/**
 * Reset nonce state for an agent address
 */
export async function resetNonce(agentAddress: string): Promise<void> {
  try {
    // Clear from memory cache
    delete nonceCache[agentAddress];
    
    // Clear from persistent storage
    await nonceDB.deleteNonce(agentAddress);
    
    console.log('[HL NONCE] Nonce reset for address:', agentAddress.slice(0, 20) + '...');
  } catch (error) {
    console.error('[HL NONCE] Failed to reset nonce:', error);
    throw error;
  }
}

/**
 * Reset all nonce states
 */
export async function resetAllNonces(): Promise<void> {
  try {
    // Clear memory cache
    nonceCache = {};
    
    // Clear persistent storage
    await nonceDB.clearAll();
    
    console.log('[HL NONCE] All nonces reset');
  } catch (error) {
    console.error('[HL NONCE] Failed to reset all nonces:', error);
    throw error;
  }
}

/**
 * Get cached nonce without fetching from remote
 */
export function getCachedNonce(agentAddress: string): number | null {
  return nonceCache[agentAddress]?.nonce || null;
}

/**
 * Check if nonce is cached for an address
 */
export function hasCachedNonce(agentAddress: string): boolean {
  return agentAddress in nonceCache;
}

/**
 * Get nonce info for debugging
 */
export function getNonceInfo(agentAddress: string): NonceResponse | null {
  return nonceCache[agentAddress] || null;
}
