'use client';

import { useAccount, useSignMessage, useSignTypedData, useChainId } from 'wagmi';
import type { WalletAdapter } from './adapter';

export class WagmiWalletAdapter implements WalletAdapter {
  private account: ReturnType<typeof useAccount>;
  private signMessageHook: ReturnType<typeof useSignMessage>;
  private signTypedDataHook: ReturnType<typeof useSignTypedData>;
  private chainId: ReturnType<typeof useChainId>;

  constructor(
    account: ReturnType<typeof useAccount>,
    signMessageHook: ReturnType<typeof useSignMessage>,
    signTypedDataHook: ReturnType<typeof useSignTypedData>,
    chainId: ReturnType<typeof useChainId>
  ) {
    this.account = account;
    this.signMessageHook = signMessageHook;
    this.signTypedDataHook = signTypedDataHook;
    this.chainId = chainId;
  }

  async getAddress(): Promise<string | null> {
    return this.account.address || null;
  }

  async signTypedData(domain: Record<string, unknown>, types: Record<string, unknown>, value: Record<string, unknown>): Promise<string> {
    if (!this.account.address) {
      throw new Error('Wallet not connected');
    }

    const result = await this.signTypedDataHook.signTypedDataAsync({
      domain,
      types,
      primaryType: 'Order',
      message: value,
    });

    return result;
  }

  async signMessage(message: string): Promise<string> {
    if (!this.account.address) {
      throw new Error('Wallet not connected');
    }

    const result = await this.signMessageHook.signMessageAsync({ message });
    return result;
  }

  async getChainId(): Promise<number> {
    return this.chainId || 1;
  }

  isConnected(): boolean {
    return this.account.isConnected;
  }

  getConnectionInfo() {
    return {
      address: this.account.address || null,
      chainId: this.chainId || null,
      isConnected: this.account.isConnected,
    };
  }
}
