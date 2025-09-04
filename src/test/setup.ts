import { vi } from 'vitest';

// Mock crypto.subtle for tests
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      importKey: vi.fn(),
      deriveKey: vi.fn(),
      encrypt: vi.fn(),
      decrypt: vi.fn(),
      generateKey: vi.fn(),
      getRandomValues: vi.fn(),
    },
    getRandomValues: vi.fn(),
  },
  writable: true,
});

// Mock IndexedDB
const indexedDB = {
  open: vi.fn(),
};

Object.defineProperty(global, 'indexedDB', {
  value: indexedDB,
  writable: true,
});

// Mock localStorage
const localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(global, 'localStorage', {
  value: localStorage,
  writable: true,
});

// Mock console methods
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
};
