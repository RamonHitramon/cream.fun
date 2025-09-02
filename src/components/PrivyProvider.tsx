'use client';
import { PrivyProvider as PrivyProviderBase } from '@privy-io/react-auth';

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProviderBase
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'cmf22g7yg00z3l40cra6d4fou'}
      config={{
        loginMethods: ['email', 'wallet'],
        appearance: {
          theme: 'dark',
          accentColor: '#22c55e',
        },
      }}
    >
      {children}
    </PrivyProviderBase>
  );
}
