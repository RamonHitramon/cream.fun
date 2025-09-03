'use client';

import React from 'react';
import { useWalletConnection } from '@/lib/wallet/useWalletAdapter';
import { useNotifications } from './Notification';

export interface WalletGuardProps {
  children: React.ReactNode;
  requiredChainId?: number;
  showNotification?: boolean;
  fallback?: React.ReactNode;
}

export function WalletGuard({ 
  children, 
  requiredChainId, 
  showNotification = true,
  fallback 
}: WalletGuardProps) {
  const { isConnected, chainId } = useWalletConnection();
  const { addNotification } = useNotifications();

  React.useEffect(() => {
    if (!showNotification) return;

    if (!isConnected) {
      addNotification({
        type: 'warning',
        message: 'Please connect your wallet to continue',
        duration: 3000,
      });
      return;
    }

    if (requiredChainId && chainId !== requiredChainId) {
      addNotification({
        type: 'error',
        message: `Wrong network. Please switch to ${getNetworkName(requiredChainId)}`,
        duration: 5000,
      });
      return;
    }
  }, [isConnected, chainId, requiredChainId, showNotification, addNotification]);

  // Если кошелёк не подключен
  if (!isConnected) {
    return fallback || (
      <div className="p-6 text-center border rounded-lg bg-yellow-50 border-yellow-200">
        <p className="text-yellow-800 font-medium">Connect wallet to continue</p>
      </div>
    );
  }

  // Если неправильная сеть
  if (requiredChainId && chainId !== requiredChainId) {
    return fallback || (
      <div className="p-6 text-center border rounded-lg bg-red-50 border-red-200">
        <p className="text-red-800 font-medium">
          Wrong network. Please switch to {getNetworkName(requiredChainId)}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

// Хук для проверки состояния кошелька
export function useWalletGuard(requiredChainId?: number) {
  const { isConnected, chainId } = useWalletConnection();
  const { addNotification } = useNotifications();

  const checkWallet = (action: string): boolean => {
    if (!isConnected) {
      addNotification({
        type: 'warning',
        message: `Please connect your wallet to ${action}`,
        duration: 3000,
      });
      return false;
    }

    if (requiredChainId && chainId !== requiredChainId) {
      addNotification({
        type: 'error',
        message: `Wrong network for ${action}. Please switch to ${getNetworkName(requiredChainId)}`,
        duration: 5000,
      });
      return false;
    }

    return true;
  };

  const checkPreview = (hasPreview: boolean, action: string): boolean => {
    if (!hasPreview) {
      addNotification({
        type: 'warning',
        message: `Please calculate strategy first before ${action}`,
        duration: 3000,
      });
      return false;
    }

    return true;
  };

  return {
    isConnected,
    chainId,
    checkWallet,
    checkPreview,
    isValidNetwork: !requiredChainId || chainId === requiredChainId,
  };
}

function getNetworkName(chainId: number): string {
  switch (chainId) {
    case 1: return 'Ethereum';
    case 137: return 'Polygon';
    case 42161: return 'Arbitrum';
    case 10: return 'Optimism';
    case 8453: return 'Base';
    case 11155111: return 'Sepolia';
    default: return `Chain ${chainId}`;
  }
}
