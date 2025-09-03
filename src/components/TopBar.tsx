'use client';

import { ConnectWallet } from './ConnectWallet';
import { useWalletConnection } from '@/lib/wallet/useWalletAdapter';
import { useDisconnect } from 'wagmi';
import { Navigation } from './Navigation';
import { WalletBalance } from './WalletBalance';

export function TopBar() {
  const { address, isConnected, chainId } = useWalletConnection();
  const { disconnect } = useDisconnect();

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}…${address.slice(-4)}`;
  };

  const getNetworkName = (chainId: number | undefined) => {
    switch (chainId) {
      case 1: return 'Ethereum';
      case 137: return 'Polygon';
      case 42161: return 'Arbitrum';
      case 10: return 'Optimism';
      case 8453: return 'Base';
      case 11155111: return 'Sepolia';
      default: return `Chain ${chainId}`;
    }
  };

  return (
    <header 
      className="px-6 py-4 border-b"
      style={{
        backgroundColor: 'var(--color-hl-surface)',
        borderColor: 'var(--color-hl-border)'
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold"
              style={{
                backgroundColor: 'var(--color-hl-primary)',
                color: 'var(--color-hl-bg)'
              }}
            >
              C
            </div>
            <h1 
              className="text-xl font-bold"
              style={{ color: 'var(--color-hl-text)' }}
            >
              cream.fun
            </h1>
          </div>

          {/* Navigation */}
          <Navigation />
        </div>
        
        <div className="flex items-center gap-3">
          {/* Network Indicator */}
          {chainId && (
            <div className="px-3 py-2 rounded-lg border text-sm"
              style={{
                backgroundColor: 'var(--color-hl-surface)',
                borderColor: 'var(--color-hl-border)',
                color: 'var(--color-hl-muted)'
              }}
            >
              {getNetworkName(chainId)}
            </div>
          )}

          {/* Wallet Balance */}
          <WalletBalance />

          {/* Wallet Connection */}
          {isConnected && address ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border"
              style={{
                backgroundColor: 'var(--color-hl-surface)',
                borderColor: 'var(--color-hl-border)',
                color: 'var(--color-hl-text)'
              }}
            >
              <div className="text-sm">
                <div className="font-medium">{shortenAddress(address)}</div>
              </div>
              <button
                onClick={() => disconnect()}
                className="px-2 py-1 text-xs rounded border transition-colors hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                style={{
                  borderColor: 'var(--color-hl-border)',
                  color: 'var(--color-hl-muted)'
                }}
              >
                Disconnect
              </button>
            </div>
          ) : (
            <ConnectWallet />
          )}
        </div>
      </div>
    </header>
  );
}
