'use client';
import { useState, useEffect } from 'react';
import { usePrivyAdapter } from '@/lib/wallet/usePrivyAdapter';

export function WalletAddress() {
  const { adapter, ready } = usePrivyAdapter();
  const [address, setAddress] = useState<string>('');

  useEffect(() => {
    if (adapter && ready) {
      adapter.getAddress().then(setAddress).catch(console.error);
    } else {
      setAddress('');
    }
  }, [adapter, ready]);

  if (!ready) {
    return (
      <div className="text-sm text-hl-muted">
        Wallet not connected
      </div>
    );
  }

  if (!address) {
    return (
      <div className="text-sm text-hl-muted">
        Loading address...
      </div>
    );
  }

  return (
    <div className="text-sm">
      <span className="text-hl-muted">Address: </span>
      <span className="font-mono text-hl-text">
        {address.slice(0, 6)}...{address.slice(-4)}
      </span>
    </div>
  );
}
