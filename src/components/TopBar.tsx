import { ConnectWallet } from './ConnectWallet';
import { WalletAddress } from './WalletAddress';

export function TopBar() {
  return (
    <header 
      className="px-6 py-4 border-b"
      style={{
        backgroundColor: 'var(--color-hl-surface)',
        borderColor: 'var(--color-hl-border)'
      }}
    >
      <div className="flex items-center justify-between">
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
        
        <div className="flex items-center gap-4">
          <WalletAddress />
          <ConnectWallet />
        </div>
      </div>
    </header>
  );
}
