export type HyperliquidEnvironment = 'testnet' | 'mainnet';

export interface HyperliquidConfig {
  infoUrl: string;
  exchangeUrl: string;
  wsUrl: string;
  chainId: number;
}

const CONFIGS: Record<HyperliquidEnvironment, HyperliquidConfig> = {
  testnet: {
    infoUrl: 'https://api.hyperliquid-testnet.xyz/info',
    exchangeUrl: 'https://api.hyperliquid-testnet.xyz/exchange',
    wsUrl: 'wss://api.hyperliquid-testnet.xyz/ws',
    chainId: 421614, // Arbitrum Sepolia
  },
  mainnet: {
    infoUrl: 'https://api.hyperliquid.xyz/info',
    exchangeUrl: 'https://api.hyperliquid.xyz/exchange',
    wsUrl: 'wss://api.hyperliquid.xyz/ws',
    chainId: 42161, // Arbitrum One
  },
};

export function getHyperliquidConfig(env: HyperliquidEnvironment = 'testnet'): HyperliquidConfig {
  return CONFIGS[env];
}

export function getCurrentConfig(): HyperliquidConfig {
  const env = (process.env.HL_ENV as HyperliquidEnvironment) || 'testnet';
  return getHyperliquidConfig(env);
}
