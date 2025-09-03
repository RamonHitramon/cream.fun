import type { WalletAdapter } from './adapter';
import type { OrderData, SignedOrder } from './types';

export const ORDER_TYPES = {
  Order: [
    { name: 'trader', type: 'address' },
    { name: 'side', type: 'string' },
    { name: 'symbol', type: 'string' },
    { name: 'size', type: 'string' },
    { name: 'price', type: 'string' },
    { name: 'reduceOnly', type: 'bool' },
    { name: 'nonce', type: 'uint256' },
  ],
};

export function createOrderDomain(chainId: number, contractAddress: string): Record<string, unknown> {
  return {
    name: 'Hyperliquid',
    version: '1',
    chainId,
    verifyingContract: contractAddress,
  };
}

export async function signOrder(
  adapter: WalletAdapter,
  orderData: OrderData,
  contractAddress: string
): Promise<SignedOrder> {
  const address = await adapter.getAddress();
  if (!address) {
    throw new Error('Wallet not connected');
  }

  const chainId = await adapter.getChainId();
  const domain = createOrderDomain(chainId, contractAddress);

  const signature = await adapter.signTypedData(domain, ORDER_TYPES, orderData);

  return {
    ...orderData,
    signature,
    signer: address,
    timestamp: Date.now(),
  };
}

export async function signMessage(
  adapter: WalletAdapter,
  message: string
): Promise<string> {
  return adapter.signMessage(message);
}

