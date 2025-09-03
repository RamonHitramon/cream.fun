'use client';

import React from 'react';
import { useWalletConnection } from '@/lib/wallet/useWalletAdapter';

export function WalletBalance() {
  const { address, isConnected } = useWalletConnection();
  const [balance, setBalance] = React.useState<string>('0.00');

  // Mock balance - в реальном приложении здесь будет fetch баланса
  React.useEffect(() => {
    if (isConnected && address) {
      // Имитируем загрузку баланса
      const mockBalance = (Math.random() * 10000).toFixed(2);
      setBalance(mockBalance);
    }
  }, [isConnected, address]);

  if (!isConnected || !address) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border"
      style={{
        backgroundColor: 'var(--color-hl-surface)',
        borderColor: 'var(--color-hl-border)',
        color: 'var(--color-hl-text)'
      }}
    >
      <div className="text-sm">
        <div className="font-medium">${balance}</div>
        <div className="text-xs opacity-70">Balance</div>
      </div>
    </div>
  );
}
