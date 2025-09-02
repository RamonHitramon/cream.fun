import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, arbitrum, optimism, base, sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Cream.fun',
  projectId: 'cmf22g7yg00z3l40cra6d4fou', // Ваш API ID
  chains: [
    mainnet,
    polygon,
    arbitrum,
    optimism,
    base,
    sepolia, // для тестирования
  ],
  ssr: true,
});
