export interface EIP712Domain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
}

export interface OrderData extends Record<string, unknown> {
  trader: string;
  side: 'BUY' | 'SELL';
  symbol: string;
  size: string;
  price: string;
  reduceOnly: boolean;
  nonce: number;
}

export interface SignatureData {
  signature: string;
  signer: string;
  timestamp: number;
}

export interface SignedOrder extends OrderData, SignatureData {}
