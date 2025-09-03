'use client';

import React, { useState } from 'react';
import { useWalletAdapter, useWalletConnection } from '@/lib/wallet/useWalletAdapter';
import { signMessage, signOrder } from '@/lib/wallet/signing';
import type { OrderData } from '@/lib/wallet/types';

export function WalletTest() {
  const walletAdapter = useWalletAdapter();
  const connection = useWalletConnection();
  const [message, setMessage] = useState('Hello, Hyperliquid!');
  const [signedMessage, setSignedMessage] = useState('');
  const [signedOrder, setSignedOrder] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignMessage = async () => {
    if (!walletAdapter) return;
    
    setIsLoading(true);
    try {
      const signature = await signMessage(walletAdapter, message);
      setSignedMessage(signature);
    } catch (error) {
      console.error('Failed to sign message:', error);
      setSignedMessage('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOrder = async () => {
    if (!walletAdapter) return;
    
    setIsLoading(true);
    try {
      const mockOrderData: OrderData = {
        trader: await walletAdapter.getAddress() || '',
        side: 'BUY',
        symbol: 'BTC',
        size: '1000000', // 1 BTC in satoshis
        price: '50000000000', // $50,000 in satoshis
        reduceOnly: false,
        nonce: Date.now(),
      };

      const signedOrder = await signOrder(
        walletAdapter,
        mockOrderData,
        '0x1234567890123456789012345678901234567890' // Mock contract
      );
      
      setSignedOrder(JSON.stringify(signedOrder, null, 2));
    } catch (error) {
      console.error('Failed to sign order:', error);
      setSignedOrder('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!connection.isConnected) {
    return (
      <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
        <p className="text-yellow-800">Please connect your wallet to test signing</p>
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-4">Wallet Adapter Test</h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Connected Address:</p>
          <p className="font-mono text-sm">{connection.address}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-600">Chain ID:</p>
          <p className="font-mono text-sm">{connection.chainId}</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Message to Sign:</label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Enter message to sign"
          />
          <button
            onClick={handleSignMessage}
            disabled={isLoading}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
          >
            {isLoading ? 'Signing...' : 'Sign Message'}
          </button>
          {signedMessage && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">Signature:</p>
              <p className="font-mono text-xs break-all bg-gray-100 p-2 rounded">
                {signedMessage}
              </p>
            </div>
          )}
        </div>

        <div>
          <button
            onClick={handleSignOrder}
            disabled={isLoading}
            className="px-4 py-2 bg-green-500 text-white rounded-lg disabled:opacity-50"
          >
            {isLoading ? 'Signing...' : 'Sign Mock Order'}
          </button>
          {signedOrder && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">Signed Order:</p>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                {signedOrder}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
