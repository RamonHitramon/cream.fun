import { secp256k1 } from '@noble/curves/secp256k1';
import { sha256 } from '@noble/hashes/sha256';

export interface SignedAction {
  action: Record<string, unknown>;
  nonce: number;
  signature: string;
}

// Nonce validation to prevent replay attacks
let lastUsedNonce: number | null = null;

export function validateNonce(n: number): boolean {
  if (lastUsedNonce === null) {
    lastUsedNonce = n;
    return true;
  }
  
  // Nonce must be greater than the last used nonce
  if (n <= lastUsedNonce) {
    return false;
  }
  
  lastUsedNonce = n;
  return true;
}

// Helper function to build EIP-712 typed data for debugging
export function buildTypedData(action: Record<string, unknown>, nonce: number) {
  // Hyperliquid EIP-712 domain
  const domain = {
    name: 'Hyperliquid',
    version: '1',
    chainId: 1, // Ethereum mainnet
  };

  // Action types - adjust based on Hyperliquid's specific requirements
  const types = {
    Order: [
      { name: 'action', type: 'string' },
      { name: 'nonce', type: 'uint256' },
      // Add other action-specific fields as needed
    ],
  };

  // Message data
  const message = {
    action: JSON.stringify(action),
    nonce: nonce.toString(),
  };

  return {
    domain,
    types,
    message,
  };
}

// Strict serialization of action fields (removes undefined values)
function serializeAction(action: Record<string, unknown>): Record<string, unknown> {
  if (action === null || action === undefined) {
    return action as Record<string, unknown>;
  }
  
  if (typeof action === 'object') {
    if (Array.isArray(action)) {
      // Handle arrays by mapping each element and returning as unknown
      return action.map(serializeAction) as unknown as Record<string, unknown>;
    }
    
    const serialized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(action)) {
      if (value !== undefined) {
        serialized[key] = serializeAction(value as Record<string, unknown>);
      }
    }
    return serialized;
  }
  
  return action as Record<string, unknown>;
}

// Main signing function - accepts any object type
export function signAction(action: object, privKeyHex: string, nonce: number): SignedAction {
  // Validate nonce first
  if (!validateNonce(nonce)) {
    throw new Error(`Invalid nonce: ${nonce}. Nonce must be greater than last used nonce.`);
  }

  // Strictly serialize action (remove undefined fields)
  const serializedAction = serializeAction(action as Record<string, unknown>);
  
  // Build typed data for signing
  const typedData = buildTypedData(serializedAction, nonce);
  
  // Convert private key from hex to bytes
  const privateKeyBytes = hexToBytes(privKeyHex);
  
  // Create message hash using EIP-712 structured data
  const messageHash = createEIP712Hash(typedData);
  
  // Sign the message hash
  const signature = secp256k1.sign(messageHash, privateKeyBytes);
  
  // Convert signature to hex
  const signatureHex = bytesToHex(signature.toCompactRawBytes());
  
  return {
    action: serializedAction,
    nonce,
    signature: signatureHex,
  };
}

// Create EIP-712 hash from typed data
function createEIP712Hash(typedData: {
  domain: Record<string, unknown>;
  types: Record<string, Array<{ name: string; type: string }>>;
  message: Record<string, unknown>;
}): Uint8Array {
  const { domain, types, message } = typedData;
  
  // EIP-712 encoding
  const domainSeparator = createDomainSeparator(domain);
  const messageHash = createMessageHash(message, types.Order);
  
  // Final hash: keccak256(0x1901 + domainSeparator + messageHash)
  const prefix = new Uint8Array([0x19, 0x01]);
  const combined = new Uint8Array(prefix.length + domainSeparator.length + messageHash.length);
  
  combined.set(prefix, 0);
  combined.set(domainSeparator, prefix.length);
  combined.set(messageHash, prefix.length + domainSeparator.length);
  
  return sha256(combined);
}

// Create domain separator hash
function createDomainSeparator(domain: Record<string, unknown>): Uint8Array {
  const domainType = {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
    ],
  };
  
  const domainData = {
    name: domain.name,
    version: domain.version,
    chainId: domain.chainId,
  };
  
  return createMessageHash(domainData, domainType.EIP712Domain);
}

// Create message hash from data and types
function createMessageHash(data: Record<string, unknown>, types: Array<{ name: string; type: string }>): Uint8Array {
  // Sort types by name for deterministic encoding
  const sortedTypes = types.sort((a, b) => a.name.localeCompare(b.name));
  
  // Encode each field according to its type
  const encodedFields: Uint8Array[] = [];
  
  for (const type of sortedTypes) {
    const value = data[type.name];
    const encoded = encodeValue(value, type.type);
    encodedFields.push(encoded);
  }
  
  // Concatenate all encoded fields
  const totalLength = encodedFields.reduce((sum, field) => sum + field.length, 0);
  const result = new Uint8Array(totalLength);
  
  let offset = 0;
  for (const field of encodedFields) {
    result.set(field, offset);
    offset += field.length;
  }
  
  return sha256(result);
}

// Encode value according to type
function encodeValue(value: unknown, type: string): Uint8Array {
  switch (type) {
    case 'string':
      return new TextEncoder().encode(value as string);
    
    case 'uint256':
      return encodeUint256(BigInt(value as number | string));
    
    case 'address':
      return hexToBytes((value as string).replace('0x', ''));
    
    default:
      throw new Error(`Unsupported type: ${type}`);
  }
}

// Encode uint256 to bytes
function encodeUint256(value: bigint): Uint8Array {
  const bytes = new Uint8Array(32);
  for (let i = 31; i >= 0; i--) {
    bytes[i] = Number(value & BigInt(0xFF));
    value >>= BigInt(8);
  }
  return bytes;
}

// Utility functions for hex conversion
function hexToBytes(hex: string): Uint8Array {
  if (hex.startsWith('0x')) {
    hex = hex.slice(2);
  }
  
  if (hex.length % 2 !== 0) {
    throw new Error('Hex string must have even length');
  }
  
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Reset nonce validation (useful for testing or resetting state)
export function resetNonceValidation(): void {
  lastUsedNonce = null;
}
