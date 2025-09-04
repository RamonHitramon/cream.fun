import { secp256k1 } from '@noble/curves/secp256k1';
import { sha256 } from '@noble/hashes/sha256';
import type { AgentKey } from '@/services/agent';

// Helper functions for hex conversion
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export interface HyperliquidAction {
  type: string;
  [key: string]: unknown;
}

export interface SignedAction {
  action: HyperliquidAction;
  nonce: number;
  signature: string;
  user: string;
}

export interface SigningContext {
  action: HyperliquidAction;
  nonce: number;
  user: string;
  timestamp?: number;
}

/**
 * Create message hash for Hyperliquid action signing
 */
function createMessageHash(context: SigningContext): Uint8Array {
  const { action, nonce, user, timestamp = Date.now() } = context;
  
  // Create deterministic message string
  const messageParts = [
    action.type,
    nonce.toString(),
    user.toLowerCase(),
    timestamp.toString()
  ];

  // Add action-specific fields in sorted order
  const actionFields = Object.keys(action)
    .filter(key => key !== 'type')
    .sort()
    .map(key => `${key}:${JSON.stringify(action[key])}`);

  messageParts.push(...actionFields);
  
  const message = messageParts.join('|');
  console.log(`[HL] Signing message: ${message}`);
  
  return sha256(message);
}

/**
 * Sign Hyperliquid action with agent private key
 */
export function signAction(
  action: HyperliquidAction,
  agentKey: AgentKey,
  nonce: number,
  user: string,
  timestamp?: number
): SignedAction {
  try {
    const context: SigningContext = {
      action,
      nonce,
      user,
      timestamp
    };

    const messageHash = createMessageHash(context);
    const privateKeyBytes = hexToBytes(agentKey.privateKey);
    
    // Sign the message hash
    const signature = secp256k1.sign(messageHash, privateKeyBytes);
    const signatureHex = bytesToHex(signature.toCompactRawBytes());

    console.log(`[HL] Action signed successfully:`, {
      type: action.type,
      nonce,
      user,
      signature: signatureHex.slice(0, 20) + '...'
    });

    return {
      action,
      nonce,
      signature: signatureHex,
      user
    };
  } catch (error) {
    console.error('[HL] Error signing action:', error);
    throw new Error(`Failed to sign action: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Verify signature of a signed action
 */
export function verifySignedAction(signedAction: SignedAction, publicKey: string): boolean {
  try {
    const { action, nonce, signature, user } = signedAction;
    const timestamp = Date.now(); // Use current timestamp for verification
    
    const context: SigningContext = {
      action,
      nonce,
      user,
      timestamp
    };

    const messageHash = createMessageHash(context);
    const signatureBytes = hexToBytes(signature);
    const publicKeyBytes = hexToBytes(publicKey);

    // Verify the signature
    const isValid = secp256k1.verify(signatureBytes, messageHash, publicKeyBytes);
    
    console.log(`[HL] Signature verification: ${isValid ? 'VALID' : 'INVALID'}`);
    return isValid;
  } catch (error) {
    console.error('[HL] Error verifying signature:', error);
    return false;
  }
}

/**
 * Create signed order for Hyperliquid
 */
export function createSignedOrder(
  order: {
    a: string;        // asset
    b: 'buy' | 'sell'; // side
    t: 'limit' | 'market'; // type
    s: string;        // size
    p?: string;       // price (for limit orders)
    ro?: boolean;     // reduce only
  },
  agentKey: AgentKey,
  nonce: number,
  user: string
): SignedAction {
  const action: HyperliquidAction = {
    type: 'order',
    ...order
  };

  return signAction(action, agentKey, nonce, user);
}

/**
 * Create signed cancel order for Hyperliquid
 */
export function createSignedCancelOrder(
  oid: string,
  agentKey: AgentKey,
  nonce: number,
  user: string
): SignedAction {
  const action: HyperliquidAction = {
    type: 'cancel',
    oid
  };

  return signAction(action, agentKey, nonce, user);
}

/**
 * Create signed close position for Hyperliquid
 */
export function createSignedClosePosition(
  asset: string,
  size: string,
  agentKey: AgentKey,
  nonce: number,
  user: string
): SignedAction {
  const action: HyperliquidAction = {
    type: 'order',
    a: asset,
    b: 'sell', // Assuming long position
    t: 'market',
    s: size,
    ro: true // reduce only
  };

  return signAction(action, agentKey, nonce, user);
}

/**
 * Validate signed action structure
 */
export function validateSignedAction(signedAction: SignedAction): boolean {
  try {
    const { action, nonce, signature, user } = signedAction;
    
    // Check required fields
    if (!action || !action.type || typeof nonce !== 'number' || !signature || !user) {
      return false;
    }

    // Validate nonce
    if (nonce < 0 || !Number.isInteger(nonce)) {
      return false;
    }

    // Validate signature format (hex string)
    if (typeof signature !== 'string' || !/^[0-9a-fA-F]+$/.test(signature)) {
      return false;
    }

    // Validate user address format
    if (typeof user !== 'string' || user.length < 20) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Get public key from agent key
 */
export function getPublicKeyFromAgent(agentKey: AgentKey): string {
  return agentKey.publicKey;
}

/**
 * Create action payload for API submission
 */
export function createActionPayload(signedAction: SignedAction): Record<string, unknown> {
  return {
    ...signedAction.action,
    nonce: signedAction.nonce,
    signature: signedAction.signature,
    user: signedAction.user
  };
}
