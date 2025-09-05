'use client';

import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from '@/lib/wagmi';
import { useMemo } from 'react';

import '@rainbow-me/rainbowkit/styles.css';

export function WalletProvider({ children }: { children: React.ReactNode }) {
  // В production используем простую версию
  if (process.env.NODE_ENV === 'production') {
    return <>{children}</>;
  }

  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider locale="en-US">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
