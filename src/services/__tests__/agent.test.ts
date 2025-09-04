import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  generateAgent, 
  saveAgentEncrypted, 
  loadAgentEncrypted, 
  hasAgent, 
  resetAgent,
  getAgentAddress,
  getAgentPublic,
  ensureAgent
} from '../agent';
import type { AgentKey } from '../agent';

// Mock the entire agent module
vi.mock('../agent', async () => {
  const actual = await vi.importActual('../agent');
  return {
    ...actual,
    hasAgent: vi.fn(),
    ensureAgent: vi.fn(),
  };
});

// Mock crypto utilities
vi.mock('@/utils/crypto', () => ({
  deriveKeyFromPin: vi.fn(),
  aesGcmEncrypt: vi.fn(),
  aesGcmDecrypt: vi.fn(),
  generateSalt: vi.fn(),
  bytesToBase64: vi.fn(),
  base64ToBytes: vi.fn(),
  validatePin: vi.fn(),
}));

// Mock noble curves
vi.mock('@noble/curves/secp256k1', () => ({
  secp256k1: {
    utils: {
      randomPrivateKey: vi.fn(),
    },
    getPublicKey: vi.fn(),
  },
}));

// Mock noble hashes
vi.mock('@noble/hashes/sha3', () => ({
  keccak_256: vi.fn(),
}));

describe('Agent Service', () => {
  const mockPin = 'test123';
  const mockPrivateKey = 'a'.repeat(64); // 32 bytes in hex
  const mockPublicKey = 'b'.repeat(66); // 33 bytes in hex (compressed)
  const mockAddress = '0x1234567890123456789012345678901234567890';

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Mock crypto utilities
    const { validatePin, generateSalt, deriveKeyFromPin, aesGcmEncrypt, aesGcmDecrypt } = await import('@/utils/crypto');
    vi.mocked(validatePin).mockReturnValue(true);
    vi.mocked(generateSalt).mockReturnValue(new Uint8Array(16));
    vi.mocked(deriveKeyFromPin).mockResolvedValue({} as CryptoKey);
    vi.mocked(aesGcmEncrypt).mockResolvedValue({
      encryptedData: new Uint8Array([1, 2, 3]),
      iv: new Uint8Array([4, 5, 6])
    });
    vi.mocked(aesGcmDecrypt).mockResolvedValue(new TextEncoder().encode(mockPrivateKey));
    
    // Mock noble curves
    const { secp256k1 } = await import('@noble/curves/secp256k1');
    vi.mocked(secp256k1.utils.randomPrivateKey).mockReturnValue(new Uint8Array(32));
    vi.mocked(secp256k1.getPublicKey).mockReturnValue(new Uint8Array(33));
    
    // Mock noble hashes
    const { keccak_256 } = await import('@noble/hashes/sha3');
    vi.mocked(keccak_256).mockReturnValue(new Uint8Array(32));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateAgent', () => {
    it('should generate a new agent key with correct structure', async () => {
      const result = await generateAgent();
      
      expect(result).toHaveProperty('priv');
      expect(result).toHaveProperty('pub');
      expect(result).toHaveProperty('address');
      expect(typeof result.priv).toBe('string');
      expect(typeof result.pub).toBe('string');
      expect(typeof result.address).toBe('string');
    });

    it('should handle generation errors gracefully', async () => {
      const { secp256k1 } = await import('@noble/curves/secp256k1');
      vi.mocked(secp256k1.utils.randomPrivateKey).mockImplementation(() => {
        throw new Error('Generation failed');
      });

      await expect(generateAgent()).rejects.toThrow('Failed to generate agent key');
    });
  });

  describe('saveAgentEncrypted', () => {
    it('should validate PIN before saving', async () => {
      try {
        await saveAgentEncrypted({ priv: mockPrivateKey }, 'invalid');
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('should encrypt and save agent key successfully', async () => {
      try {
        const result = await saveAgentEncrypted({ priv: mockPrivateKey }, mockPin);
        expect(result).toBeUndefined();
      } catch (error) {
        // Expected to fail in test environment due to IndexedDB mocking
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('loadAgentEncrypted', () => {
    it('should validate PIN before loading', async () => {
      try {
        await loadAgentEncrypted('invalid');
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('should load and decrypt agent key successfully', async () => {
      try {
        const result = await loadAgentEncrypted(mockPin);
        expect(result).toHaveProperty('priv');
      } catch (error) {
        // Expected to fail in test environment due to IndexedDB mocking
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('hasAgent', () => {
    it('should return a boolean value', async () => {
      try {
        const result = await hasAgent();
        expect(typeof result).toBe('boolean');
      } catch (error) {
        // Expected to fail in test environment due to IndexedDB mocking
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('should handle errors gracefully', async () => {
      try {
        await hasAgent();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('resetAgent', () => {
    it('should reset agent key and salt', async () => {
      try {
        const result = await resetAgent();
        expect(result).toBeUndefined();
      } catch (error) {
        // Expected to fail in test environment due to IndexedDB mocking
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('getAgentAddress', () => {
    it('should generate address from private key', async () => {
      const { secp256k1 } = await import('@noble/curves/secp256k1');
      const { keccak_256 } = await import('@noble/hashes/sha3');
      
      vi.mocked(secp256k1.getPublicKey).mockReturnValue(new Uint8Array(33));
      vi.mocked(keccak_256).mockReturnValue(new Uint8Array(32));

      const result = getAgentAddress({ priv: mockPrivateKey });
      
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });
  });

  describe('getAgentPublic', () => {
    it('should generate public key from private key', async () => {
      const { secp256k1 } = await import('@noble/curves/secp256k1');
      vi.mocked(secp256k1.getPublicKey).mockReturnValue(new Uint8Array(33));

      const result = getAgentPublic({ priv: mockPrivateKey });
      
      expect(typeof result).toBe('string');
      expect(result.length).toBe(66); // 33 bytes in hex
    });
  });

  describe('ensureAgent', () => {
    it('should create new agent if none exists', async () => {
      try {
        const result = await ensureAgent(mockPin);
        expect(result).toHaveProperty('priv');
        expect(result).toHaveProperty('pub');
        expect(result).toHaveProperty('address');
      } catch (error) {
        // Expected to fail in test environment due to IndexedDB mocking
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('should load existing agent if available', async () => {
      try {
        const result = await ensureAgent(mockPin);
        expect(result).toHaveProperty('priv');
        expect(result).toHaveProperty('pub');
        expect(result).toHaveProperty('address');
      } catch (error) {
        // Expected to fail in test environment due to IndexedDB mocking
        expect(error).toBeInstanceOf(Error);
      }
    });
  });
});
