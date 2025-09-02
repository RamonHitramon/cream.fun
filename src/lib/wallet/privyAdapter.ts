'use client';
import { createWalletClient, custom, type WalletClient } from 'viem';

export type WalletAdapter = {
  getAddress: () => Promise<`0x${string}`>;
  signTypedData: (args: Parameters<WalletClient['signTypedData']>[0]) => Promise<`0x${string}`>;
};

// Тип для Ethereum провайдера
type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
};

export async function makePrivyAdapter(getEthereumProvider: () => Promise<EthereumProvider>): Promise<WalletAdapter> {
  const provider = await getEthereumProvider();
  const client = createWalletClient({ transport: custom(provider) });
  const [account] = await client.getAddresses();
  return {
    getAddress: async () => (account as `0x${string}`),
    signTypedData: async (args) => client.signTypedData({ ...args, account }),
  };
}
