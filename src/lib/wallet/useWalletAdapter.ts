'use client';

import { useAccount, useSignMessage, useSignTypedData, useChainId } from 'wagmi';
import { useMemo } from 'react';
import { WagmiWalletAdapter } from './wagmiAdapter';
import type { WalletAdapter } from './adapter';

export function useWalletAdapter(): WalletAdapter | null {
  const account = useAccount();
  const signMessage = useSignMessage();
  const signTypedData = useSignTypedData();
  const chainId = useChainId();

  const adapter = useMemo(() => {
    if (!account.isConnected || !account.address) {
      return null;
    }

    return new WagmiWalletAdapter(account, signMessage, signTypedData, chainId);
  }, [account, signMessage, signTypedData, chainId]);

  return adapter;
}

// Хук для получения информации о подключении
export function useWalletConnection() {
  const account = useAccount();
  const chainId = useChainId();

  return {
    address: account.address,
    chainId: chainId,
    isConnected: account.isConnected,
    isConnecting: account.isConnecting,
    isDisconnected: account.isDisconnected,
  };
}
