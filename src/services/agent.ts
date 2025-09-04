'use client';

import { secp256k1 } from '@noble/curves/secp256k1';
import { keccak_256 } from '@noble/hashes/sha3';
import { 
  deriveKeyFromPin, 
  aesGcmEncrypt, 
  aesGcmDecrypt, 
  generateSalt,
  bytesToBase64,
  base64ToBytes,
  validatePin
} from '@/utils/crypto';

/**
 * Agent key structure
 */
export interface AgentKey {
  priv: string;    // Private key (32 bytes, hex)
  pub: string;     // Compressed public key (hex)
  address: string; // EVM address (checksum)
}

/**
 * Encrypted agent key structure
 */
interface EncryptedAgentKey {
  encryptedData: string; // Base64 encoded encrypted private key
  iv: string;            // Base64 encoded IV
  salt: string;          // Base64 encoded salt
}

/**
 * IndexedDB wrapper for agent key storage
 */
class AgentKeyDB {
  private dbName = 'HyperliquidAgentDB';
  private dbVersion = 1;
  private storeName = 'agentKeys';
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  }

  async saveAgentKey(id: string, encryptedKey: EncryptedAgentKey): Promise<void> {
    await this.init();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put({ id, ...encryptedKey });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async loadAgentKey(id: string): Promise<EncryptedAgentKey | null> {
    await this.init();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          const { encryptedData, iv, salt } = result;
          resolve({ encryptedData, iv, salt });
        } else {
          resolve(null);
        }
      };
    });
  }

  async deleteAgentKey(id: string): Promise<void> {
    await this.init();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

// Global DB instance
const agentDB = new AgentKeyDB();

// Storage keys
const AGENT_KEY_ID = 'hl_agent_key_v1';
const SALT_KEY = 'hl_agent_salt_v1';

/**
 * Generate new secp256k1 agent key
 */
export async function generateAgent(): Promise<AgentKey> {
  try {
    // Generate private key (32 bytes)
    const privateKeyBytes = secp256k1.utils.randomPrivateKey();
    const privateKeyHex = Array.from(privateKeyBytes).map(b => b.toString(16).padStart(2, '0')).join('');

    // Generate compressed public key
    const publicKey = secp256k1.getPublicKey(privateKeyBytes);
    const publicKeyHex = Array.from(publicKey).map(b => b.toString(16).padStart(2, '0')).join('');

    // Generate EVM address from public key
    const address = generateEVMAddress(publicKey);

    const agentKey: AgentKey = {
      priv: privateKeyHex,
      pub: publicKeyHex,
      address
    };

    console.log('[HL] Agent key generated successfully');
    return agentKey;
  } catch (error) {
    console.error('[HL] Error generating agent key:', error);
    throw new Error('Failed to generate agent key');
  }
}

/**
 * Generate EVM address from public key
 */
function generateEVMAddress(publicKey: Uint8Array): string {
  // Remove prefix byte (0x04 for uncompressed, 0x02/0x03 for compressed)
  const keyBytes = publicKey.slice(1);
  
  // Hash with Keccak-256
  const hash = keccak_256(keyBytes);
  
  // Take last 20 bytes
  const addressBytes = hash.slice(-20);
  
  // Convert to hex and add checksum
  const addressHex = Array.from(addressBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  
  return addChecksum(addressHex);
}

/**
 * Add checksum to address (EIP-55)
 */
function addChecksum(address: string): string {
  const hash = keccak_256(address.toLowerCase());
  
  let checksumAddress = '0x';
  for (let i = 0; i < address.length; i++) {
    const char = address[i];
    const hashByte = hash[Math.floor(i / 2)];
    const nibble = i % 2 === 0 ? hashByte >> 4 : hashByte & 0x0f;
    
    checksumAddress += nibble >= 8 ? char.toUpperCase() : char.toLowerCase();
  }
  
  return checksumAddress;
}

/**
 * Save encrypted agent key to IndexedDB
 */
export async function saveAgentEncrypted(agentKey: Pick<AgentKey, 'priv'>, pin: string): Promise<void> {
  try {
    if (!validatePin(pin)) {
      throw new Error('Invalid PIN format. Must be at least 6 alphanumeric characters.');
    }

    // Generate salt and derive encryption key
    const salt = generateSalt();
    const encryptionKey = await deriveKeyFromPin(pin, salt);

    // Encrypt private key
    const privateKeyBytes = new TextEncoder().encode(agentKey.priv);
    const { encryptedData, iv } = await aesGcmEncrypt(privateKeyBytes, encryptionKey);

    // Store encrypted data
    const encryptedKey: EncryptedAgentKey = {
      encryptedData: bytesToBase64(encryptedData),
      iv: bytesToBase64(iv),
      salt: bytesToBase64(salt)
    };

    await agentDB.saveAgentKey(AGENT_KEY_ID, encryptedKey);
    
    // Store salt in localStorage for validation
    localStorage.setItem(SALT_KEY, bytesToBase64(salt));

    console.log('[HL] Agent key encrypted and saved successfully');
  } catch (error) {
    console.error('[HL] Error saving encrypted agent key:', error);
    throw new Error('Failed to save encrypted agent key');
  }
}

/**
 * Load and decrypt agent key from IndexedDB
 */
export async function loadAgentEncrypted(pin: string): Promise<Pick<AgentKey, 'priv'>> {
  try {
    if (!validatePin(pin)) {
      throw new Error('Invalid PIN format');
    }

    // Load encrypted key
    const encryptedKey = await agentDB.loadAgentKey(AGENT_KEY_ID);
    if (!encryptedKey) {
      throw new Error('No agent key found');
    }

    // Decode from base64
    const salt = base64ToBytes(encryptedKey.salt);
    const iv = base64ToBytes(encryptedKey.iv);
    const encryptedData = base64ToBytes(encryptedKey.encryptedData);

    // Derive decryption key
    const decryptionKey = await deriveKeyFromPin(pin, salt);

    // Decrypt private key
    const decryptedBytes = await aesGcmDecrypt(encryptedData, decryptionKey, iv);
    const privateKey = new TextDecoder().decode(decryptedBytes);

    console.log('[HL] Agent key loaded and decrypted successfully');
    return { priv: privateKey };
  } catch (error) {
    console.error('[HL] Error loading encrypted agent key:', error);
    throw new Error('Failed to load agent key. Check your PIN.');
  }
}

/**
 * Check if agent key exists
 */
export async function hasAgent(): Promise<boolean> {
  try {
    const encryptedKey = await agentDB.loadAgentKey(AGENT_KEY_ID);
    return encryptedKey !== null;
  } catch (error) {
    console.error('[HL] Error checking agent key existence:', error);
    return false;
  }
}

/**
 * Reset agent key and salt
 */
export async function resetAgent(): Promise<void> {
  try {
    // Delete from IndexedDB
    await agentDB.deleteAgentKey(AGENT_KEY_ID);
    
    // Remove salt from localStorage
    localStorage.removeItem(SALT_KEY);
    
    console.log('[HL] Agent key and salt reset successfully');
  } catch (error) {
    console.error('[HL] Error resetting agent key:', error);
    throw new Error('Failed to reset agent key');
  }
}

/**
 * Get agent address from decrypted private key
 */
export function getAgentAddress(agentKey: Pick<AgentKey, 'priv'>): string {
  try {
    const privateKeyBytes = new Uint8Array(
      agentKey.priv.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
    );
    
    const publicKey = secp256k1.getPublicKey(privateKeyBytes);
    return generateEVMAddress(publicKey);
  } catch (error) {
    console.error('[HL] Error getting agent address:', error);
    throw new Error('Failed to get agent address');
  }
}

/**
 * Get agent public key from decrypted private key
 */
export function getAgentPublic(agentKey: Pick<AgentKey, 'priv'>): string {
  try {
    const privateKeyBytes = new Uint8Array(
      agentKey.priv.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
    );
    
    const publicKey = secp256k1.getPublicKey(privateKeyBytes);
    return Array.from(publicKey).map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.error('[HL] Error getting agent public key:', error);
    throw new Error('Failed to get agent public key');
  }
}

/**
 * Ensure agent key exists, create if not
 */
export async function ensureAgent(pin: string): Promise<AgentKey> {
  try {
    if (await hasAgent()) {
      // Load existing key
      const { priv } = await loadAgentEncrypted(pin);
      const pub = getAgentPublic({ priv });
      const address = getAgentAddress({ priv });
      
      return { priv, pub, address };
    } else {
      // Generate new key
      const agentKey = await generateAgent();
      await saveAgentEncrypted({ priv: agentKey.priv }, pin);
      return agentKey;
    }
  } catch (error) {
    console.error('[HL] Error ensuring agent key:', error);
    throw new Error('Failed to ensure agent key');
  }
}
