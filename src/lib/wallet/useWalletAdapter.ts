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
    // В production возвращаем null
    if (process.env.NODE_ENV === 'production') {
      return null;
    }

    if (!account.isConnected || !account.address) {
      return null;
    }

    return new WagmiWalletAdapter(account, signMessage, signTypedData, chainId);
  }, [account, signMessage, signTypedData, chainId]); // Используем полный объект account

  return adapter;
}

// Хук для получения информации о подключении
export function useWalletConnection() {
  const account = useAccount();
  const chainId = useChainId();

  // В production используем простую версию без хуков wagmi
  if (process.env.NODE_ENV === 'production') {
    return {
      address: undefined,
      chainId: undefined,
      isConnected: false,
      isConnecting: false,
      isDisconnected: true,
    };
  }

  return {
    address: account.address,
    chainId: chainId,
    isConnected: account.isConnected,
    isConnecting: account.isConnecting,
    isDisconnected: account.isDisconnected,
  };
}
