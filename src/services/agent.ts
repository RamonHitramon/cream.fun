import { secp256k1 } from '@noble/curves/secp256k1';
import { randomBytes } from '@noble/hashes/utils';

export interface AgentKey {
  publicKey: string;
  privateKey: string;
  createdAt: number;
  name?: string;
}

export interface EncryptedAgentKey {
  encryptedData: string;
  iv: string;
  salt: string;
}

const DB_NAME = 'HyperliquidAgentDB';
const DB_VERSION = 1;
const STORE_NAME = 'agentKeys';

// IndexedDB operations
class AgentKeyDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  async saveAgentKey(id: string, encryptedKey: EncryptedAgentKey): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ id, ...encryptedKey });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async loadAgentKey(id: string): Promise<EncryptedAgentKey | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          resolve({
            encryptedData: result.encryptedData,
            iv: result.iv,
            salt: result.salt
          });
        } else {
          resolve(null);
        }
      };
    });
  }

  async listAgentKeys(): Promise<string[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAllKeys();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const keys = request.result as string[];
        resolve(keys);
      };
    });
  }

  async deleteAgentKey(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

const agentDB = new AgentKeyDB();

// Crypto utilities
async function deriveKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(pin),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptAgentKey(agentKey: AgentKey, pin: string): Promise<EncryptedAgentKey> {
  const salt = randomBytes(16);
  const key = await deriveKey(pin, salt);
  const iv = randomBytes(12);

  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(agentKey));

  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    data
  );

  return {
    encryptedData: btoa(String.fromCharCode(...new Uint8Array(encryptedData))),
    iv: btoa(String.fromCharCode(...iv)),
    salt: btoa(String.fromCharCode(...salt))
  };
}

async function decryptAgentKey(encryptedKey: EncryptedAgentKey, pin: string): Promise<AgentKey> {
  const salt = Uint8Array.from(atob(encryptedKey.salt), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(encryptedKey.iv), c => c.charCodeAt(0));
  const encryptedData = Uint8Array.from(atob(encryptedKey.encryptedData), c => c.charCodeAt(0));

  const key = await deriveKey(pin, salt);

  const decryptedData = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    encryptedData
  );

  const decoder = new TextDecoder();
  const jsonString = decoder.decode(decryptedData);
  return JSON.parse(jsonString) as AgentKey;
}

// Main functions
export async function generateAgent(name?: string): Promise<AgentKey> {
  const privateKey = secp256k1.utils.randomPrivateKey();
  const publicKey = secp256k1.getPublicKey(privateKey);

  const agentKey: AgentKey = {
    publicKey: Array.from(publicKey).map(b => b.toString(16).padStart(2, '0')).join(''),
    privateKey: Array.from(privateKey).map(b => b.toString(16).padStart(2, '0')).join(''),
    createdAt: Date.now(),
    name
  };

  return agentKey;
}

export async function saveAgentKey(agentKey: AgentKey, pin: string): Promise<string> {
  const encryptedKey = await encryptAgentKey(agentKey, pin);
  const id = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  await agentDB.saveAgentKey(id, encryptedKey);
  return id;
}

export async function loadAgentKey(id: string, pin: string): Promise<AgentKey> {
  const encryptedKey = await agentDB.loadAgentKey(id);
  if (!encryptedKey) {
    throw new Error('Agent key not found');
  }

  return await decryptAgentKey(encryptedKey, pin);
}

export async function listAgentKeys(): Promise<string[]> {
  return await agentDB.listAgentKeys();
}

export async function deleteAgentKey(id: string): Promise<void> {
  await agentDB.deleteAgentKey(id);
}

export async function ensureAgent(pin: string): Promise<AgentKey> {
  const keys = await listAgentKeys();
  
  if (keys.length === 0) {
    // Generate new agent key
    const agentKey = await generateAgent('Default Agent');
    await saveAgentKey(agentKey, pin);
    return agentKey;
  }

  // Use first available key
  return await loadAgentKey(keys[0], pin);
}

// Utility functions
export function getAgentPublicKey(agentKey: AgentKey): string {
  return agentKey.publicKey;
}

export function getAgentPrivateKey(agentKey: AgentKey): string {
  return agentKey.privateKey;
}

export function validatePin(pin: string): boolean {
  return pin.length >= 6 && /^[0-9]+$/.test(pin);
}
