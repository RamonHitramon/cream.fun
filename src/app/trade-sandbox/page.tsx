'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/features/ui/Card';
import { useWalletConnection } from '@/lib/wallet/useWalletAdapter';
import {
  placeOrder,
  cancelOrder,
  closePosition,
  getOpenOrders,
  getPositions,
  getCachedAgentKey,
  type OrderRequest,
  type OpenOrder,
  type Position
} from '@/services/trade';
import { getCurrentConfig } from '@/config/hyperliquid';
import { SetupAgent } from '@/components/SetupAgent';
import type { AgentKey } from '@/services/agent';

// Компонент для production режима (без хуков)
function ProductionTradeSandbox() {
  const config = getCurrentConfig();
  
  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-hl-text)' }}>
        Trading Sandbox
      </h1>

      <div className="mb-6">
        <Card>
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-hl-text)' }}>
              Current Configuration
            </h2>
            <div className="space-y-2 text-sm">
              <div><strong>Environment:</strong> {config.infoUrl.includes('testnet') ? 'Testnet' : 'Mainnet'}</div>
              <div><strong>Info URL:</strong> {config.infoUrl}</div>
              <div><strong>Exchange URL:</strong> {config.exchangeUrl}</div>
              <div><strong>Chain ID:</strong> {config.chainId}</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="mb-6">
        <Card>
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-hl-text)' }}>
              Production Mode
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-hl-muted)' }}>
              Trading sandbox is only available in development mode. 
              Please run the application locally to access full trading capabilities.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Компонент для development режима (с хуками)
function DevelopmentTradeSandbox() {
  const { isConnected, address } = useWalletConnection();
  const [orders, setOrders] = useState<OpenOrder[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showSetupAgent, setShowSetupAgent] = useState(false);
  const [pin, setPin] = useState('');
  const [agentKey, setAgentKey] = useState<AgentKey | null>(null);

  // Order form state
  const [orderForm, setOrderForm] = useState<OrderRequest>({
    a: 'BTC',
    b: 'buy',
    t: 'limit',
    s: '0.01',
    p: '63000',
    ro: false
  });

  const config = getCurrentConfig();

  // Check for cached agent key on mount
  useEffect(() => {
    if (isConnected && address) {
      const cached = getCachedAgentKey();
      if (cached) {
        setAgentKey(cached);
      }
    }
  }, [isConnected, address]);

  // Load orders and positions
  const loadData = useCallback(async () => {
    if (!isConnected) return;
    
    setLoading(true);
    try {
      const [ordersData, positionsData] = await Promise.all([
        getOpenOrders(),
        getPositions()
      ]);
      
      setOrders(ordersData);
      setPositions(positionsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      setMessage('Failed to load orders and positions');
    } finally {
      setLoading(false);
    }
  }, [isConnected]);

  useEffect(() => {
    if (isConnected) {
      loadData();
    }
  }, [isConnected, loadData]);

  // Handle agent setup success
  const handleAgentSetupSuccess = (newAgentKey: AgentKey) => {
    setAgentKey(newAgentKey);
    setMessage('Agent key setup successful! You can now place orders.');
  };

  // Place order
  const handlePlaceOrder = async () => {
    if (!isConnected) {
      setMessage('Please connect your wallet first');
      return;
    }

    if (!agentKey) {
      setMessage('Please setup agent key first');
      setShowSetupAgent(true);
      return;
    }

    if (!pin) {
      setMessage('Please enter your PIN to place orders');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const result = await placeOrder(orderForm, pin, address!);
      
      if (result.success) {
        setMessage(`Order placed successfully! Order ID: ${result.orderId}`);
        setOrderForm({
          a: 'BTC',
          b: 'buy',
          t: 'limit',
          s: '0.01',
          p: '63000',
          ro: false
        });
        await loadData(); // Refresh data
      } else {
        setMessage(`Order failed: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Cancel order
  const handleCancelOrder = async (oid: string) => {
    if (!agentKey || !pin) {
      setMessage('Please setup agent key and enter PIN first');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const result = await cancelOrder(oid, pin, address!);
      
      if (result.success) {
        setMessage('Order cancelled successfully');
        await loadData(); // Refresh data
      } else {
        setMessage(`Cancellation failed: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Close position
  const handleClosePosition = async (asset: string, size: string) => {
    if (!agentKey || !pin) {
      setMessage('Please setup agent key and enter PIN first');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const result = await closePosition(asset, size, pin, address!);
      
      if (result.success) {
        setMessage('Position closed successfully');
        await loadData(); // Refresh data
      } else {
        setMessage(`Position close failed: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card>
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-hl-text)' }}>
              Connect Wallet Required
            </h2>
            <p style={{ color: 'var(--color-hl-muted)' }}>
              Please connect your wallet to access the trading sandbox.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-hl-text)' }}>
        Trading Sandbox
      </h1>

      <div className="mb-6">
        <Card>
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-hl-text)' }}>
              Current Configuration
            </h2>
            <div className="space-y-2 text-sm">
              <div><strong>Environment:</strong> {config.infoUrl.includes('testnet') ? 'Testnet' : 'Mainnet'}</div>
              <div><strong>Wallet:</strong> {address?.slice(0, 6)}...{address?.slice(-4)}</div>
              <div><strong>Agent Key:</strong> {agentKey ? '✅ Configured' : '❌ Not Setup'}</div>
              {agentKey && (
                                 <div><strong>Public Key:</strong> {agentKey.pub.slice(0, 20)}...</div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Agent Setup Section */}
      {!agentKey && (
        <Card className="mb-6">
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-hl-text)' }}>
              Setup Required
            </h2>
            <p className="mb-4" style={{ color: 'var(--color-hl-muted)' }}>
              You need to setup an agent key to trade on Hyperliquid.
            </p>
            <button
              onClick={() => setShowSetupAgent(true)}
              className="px-6 py-3 bg-hl-primary text-white rounded-lg font-medium"
            >
              Setup Agent Key
            </button>
          </div>
        </Card>
      )}

      {/* PIN Input Section */}
      {agentKey && (
        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-hl-text)' }}>
              Enter PIN
            </h2>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-hl-text)' }}>
                  PIN
                </label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter your 6+ digit PIN"
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--color-hl-surface)',
                    borderColor: 'var(--color-hl-border)',
                    color: 'var(--color-hl-text)'
                  }}
                  maxLength={20}
                />
              </div>
              <button
                onClick={() => setShowSetupAgent(true)}
                className="px-4 py-2 bg-hl-surface border border-hl-border rounded-lg text-sm"
                style={{ color: 'var(--color-hl-text)' }}
              >
                Change Key
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Order Form */}
      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-hl-text)' }}>
            Place Order
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-hl-text)' }}>
                Asset
              </label>
              <select
                value={orderForm.a}
                onChange={(e) => setOrderForm({ ...orderForm, a: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-hl-surface)',
                  borderColor: 'var(--color-hl-border)',
                  color: 'var(--color-hl-text)'
                }}
              >
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
                <option value="SOL">SOL</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-hl-text)' }}>
                Side
              </label>
              <select
                value={orderForm.b}
                onChange={(e) => setOrderForm({ ...orderForm, b: e.target.value as 'buy' | 'sell' })}
                className="w-full px-3 py-2 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-hl-surface)',
                  borderColor: 'var(--color-hl-border)',
                  color: 'var(--color-hl-text)'
                }}
              >
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-hl-text)' }}>
                Type
              </label>
              <select
                value={orderForm.t}
                onChange={(e) => setOrderForm({ ...orderForm, t: e.target.value as 'limit' | 'market' })}
                className="w-full px-3 py-2 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-hl-surface)',
                  borderColor: 'var(--color-hl-border)',
                  color: 'var(--color-hl-text)'
                }}
              >
                <option value="limit">Limit</option>
                <option value="market">Market</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-hl-text)' }}>
                Size
              </label>
              <input
                type="text"
                value={orderForm.s}
                onChange={(e) => setOrderForm({ ...orderForm, s: e.target.value })}
                placeholder="0.01"
                className="w-full px-3 py-2 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-hl-surface)',
                  borderColor: 'var(--color-hl-border)',
                  color: 'var(--color-hl-text)'
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-hl-text)' }}>
                Price
              </label>
              <input
                type="text"
                value={orderForm.p || ''}
                onChange={(e) => setOrderForm({ ...orderForm, p: e.target.value })}
                placeholder="63000"
                disabled={orderForm.t === 'market'}
                className="w-full px-3 py-2 rounded-lg border disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--color-hl-surface)',
                  borderColor: 'var(--color-hl-border)',
                  color: 'var(--color-hl-text)'
                }}
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={orderForm.ro || false}
                  onChange={(e) => setOrderForm({ ...orderForm, ro: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm" style={{ color: 'var(--color-hl-text)' }}>
                  Reduce Only
                </span>
              </label>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading || !agentKey || !pin || !orderForm.s || (orderForm.t === 'limit' && !orderForm.p)}
            className="px-6 py-3 bg-hl-primary text-white rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? 'Placing...' : 'Place Order'}
          </button>
        </div>
      </Card>

      {/* Message Display */}
      {message && (
        <Card className="mb-6">
          <div className="p-4">
            <p style={{ color: 'var(--color-hl-text)' }}>{message}</p>
          </div>
        </Card>
      )}

      {/* Open Orders */}
      <Card className="mb-6">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--color-hl-text)' }}>
              Open Orders
            </h2>
            <button
              onClick={loadData}
              disabled={loading}
              className="px-4 py-2 bg-hl-surface border border-hl-border rounded-lg text-sm"
              style={{ color: 'var(--color-hl-text)' }}
            >
              Refresh
            </button>
          </div>

          {orders.length === 0 ? (
            <p style={{ color: 'var(--color-hl-muted)' }}>No open orders</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-hl-border">
                    <th className="text-left py-2" style={{ color: 'var(--color-hl-text)' }}>Asset</th>
                    <th className="text-left py-2" style={{ color: 'var(--color-hl-text)' }}>Side</th>
                    <th className="text-left py-2" style={{ color: 'var(--color-hl-text)' }}>Type</th>
                    <th className="text-left py-2" style={{ color: 'var(--color-hl-text)' }}>Size</th>
                    <th className="text-left py-2" style={{ color: 'var(--color-hl-text)' }}>Price</th>
                    <th className="text-left py-2" style={{ color: 'var(--color-hl-text)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.oid} className="border-b border-hl-border">
                      <td className="py-2" style={{ color: 'var(--color-hl-text)' }}>{order.asset}</td>
                      <td className="py-2" style={{ color: 'var(--color-hl-text)' }}>{order.side}</td>
                      <td className="py-2" style={{ color: 'var(--color-hl-text)' }}>{order.type}</td>
                      <td className="py-2" style={{ color: 'var(--color-hl-text)' }}>{order.size}</td>
                      <td className="py-2" style={{ color: 'var(--color-hl-text)' }}>{order.price || '-'}</td>
                      <td className="py-2">
                        <button
                          onClick={() => handleCancelOrder(order.oid)}
                          disabled={loading || !agentKey || !pin}
                          className="px-3 py-1 bg-red-500 text-white rounded text-sm disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Positions */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--color-hl-text)' }}>
              Positions
            </h2>
            <button
              onClick={loadData}
              disabled={loading}
              className="px-4 py-2 bg-hl-surface border border-hl-border rounded-lg text-sm"
              style={{ color: 'var(--color-hl-text)' }}
            >
              Refresh
            </button>
          </div>

          {positions.length === 0 ? (
            <p style={{ color: 'var(--color-hl-muted)' }}>No open positions</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-hl-border">
                    <th className="text-left py-2" style={{ color: 'var(--color-hl-text)' }}>Asset</th>
                    <th className="text-left py-2" style={{ color: 'var(--color-hl-text)' }}>Side</th>
                    <th className="text-left py-2" style={{ color: 'var(--color-hl-text)' }}>Size</th>
                    <th className="text-left py-2" style={{ color: 'var(--color-hl-text)' }}>Entry Price</th>
                    <th className="text-left py-2" style={{ color: 'var(--color-hl-text)' }}>Mark Price</th>
                    <th className="text-left py-2" style={{ color: 'var(--color-hl-text)' }}>PnL</th>
                    <th className="text-left py-2" style={{ color: 'var(--color-hl-text)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((position, index) => (
                    <tr key={index} className="border-b border-hl-border">
                      <td className="py-2" style={{ color: 'var(--color-hl-text)' }}>{position.asset}</td>
                      <td className="py-2" style={{ color: 'var(--color-hl-text)' }}>{position.side}</td>
                      <td className="py-2" style={{ color: 'var(--color-hl-text)' }}>{position.size}</td>
                      <td className="py-2" style={{ color: 'var(--color-hl-text)' }}>{position.entryPrice}</td>
                      <td className="py-2" style={{ color: 'var(--color-hl-text)' }}>{position.markPrice}</td>
                      <td className="py-2" style={{ color: 'var(--color-hl-text)' }}>{position.pnl}</td>
                      <td className="py-2">
                        <button
                          onClick={() => handleClosePosition(position.asset, position.size)}
                          disabled={loading || !agentKey || !pin}
                          className="px-3 py-1 bg-orange-500 text-white rounded text-sm disabled:opacity-50"
                        >
                          Close
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Setup Agent Modal */}
      <SetupAgent
        isOpen={showSetupAgent}
        onClose={() => setShowSetupAgent(false)}
        onSuccess={handleAgentSetupSuccess}
      />
    </div>
  );
}

// Основной компонент страницы
export default function TradeSandboxPage() {
  // В production используем простую версию без хуков
  if (process.env.NODE_ENV === 'production') {
    return <ProductionTradeSandbox />;
  }

  // В development используем полную версию с хуками
  return <DevelopmentTradeSandbox />;
}
