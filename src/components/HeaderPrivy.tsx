'use client';
import { useEffect, useState } from 'react';
import { usePrivy, useLogin, useLogout } from '@privy-io/react-auth';
import { usePrivyAdapter } from '@/lib/wallet/usePrivyAdapter';

export default function HeaderPrivy() {
  const { authenticated } = usePrivy();
  const { adapter, ready } = usePrivyAdapter();
  const { login } = useLogin();
  const { logout } = useLogout();
  const [addr, setAddr] = useState<string>('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!authenticated || !ready || !adapter) { 
          setAddr(''); 
          return; 
        }
        const a = await adapter.getAddress();
        if (alive) setAddr(a);
      } catch (error) {
        console.error('Error getting address:', error);
        if (alive) setAddr('');
      }
    })();
    return () => { alive = false; };
  }, [authenticated, ready, adapter]);

  // Debug info
  console.log('HeaderPrivy render:', { authenticated, ready, hasAdapter: !!adapter, addr });

    return (
    <header className="card p-4 flex items-center justify-between">
      <div className="text-xl font-bold">cream.fun</div>

      <div className="flex items-center gap-3">
        <div className="text-xs text-hl-muted min-w-[180px] text-right">
          {authenticated && addr ? `Connected: ${addr.slice(0,6)}…${addr.slice(-4)}` : 'Wallet: not connected'}
        </div>
        {authenticated ? (
          <button
            onClick={() => logout()}
            className="btn bg-hl-surface border border-hl-border hover:bg-white/5"
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={() => login()}
            className="btn-success"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
}
