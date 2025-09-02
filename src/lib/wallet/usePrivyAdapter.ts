'use client';
import { useEffect, useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { makePrivyAdapter, type WalletAdapter } from './privyAdapter';

export function usePrivyAdapter() {
  const { wallets } = useWallets();
  const evm = wallets?.find((w) => Number(w.chainId) === 1 || Number(w.chainId) === 137 || Number(w.chainId) === 8453); // Ethereum, Polygon, Base
  const [adapter, setAdapter] = useState<WalletAdapter | null>(null);

  useEffect(() => {
    let alive = true;
    async function init() {
      if (!evm) { setAdapter(null); return; }
      const a = await makePrivyAdapter(() => evm.getEthereumProvider());
      if (alive) setAdapter(a);
    }
    init();
    return () => { alive = false; };
  }, [evm]);

  return { adapter, ready: !!adapter };
}
