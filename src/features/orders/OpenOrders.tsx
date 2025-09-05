'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/features/ui/Card';
import { Button } from '@/features/ui/Button';

interface Order {
  id: string;
  asset: string;
  side: 'buy' | 'sell';
  type: 'limit' | 'market';
  size: string;
  price?: string;
  status: 'open' | 'partial' | 'cancelled' | 'filled';
  timestamp: number;
  reduceOnly?: boolean;
}

interface OpenOrdersProps {
  userAddress: string;
  pin: string;
}

export function OpenOrders({ userAddress, pin }: OpenOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingAll, setCancellingAll] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // TODO: Implement actual orders fetching from Hyperliquid API
        // For now, return mock data
        const mockOrders: Order[] = [
          {
            id: '1',
            asset: 'BTC',
            side: 'buy',
            type: 'limit',
            size: '0.05',
            price: '44000',
            status: 'open',
            timestamp: Date.now() - 1800000,
            reduceOnly: false
          },
          {
            id: '2',
            asset: 'ETH',
            side: 'sell',
            type: 'limit',
            size: '0.5',
            price: '3100',
            status: 'open',
            timestamp: Date.now() - 3600000,
            reduceOnly: true
          }
        ];
        setOrders(mockOrders);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    if (userAddress && pin) {
      fetchOrders();
    }
  }, [userAddress, pin]);

  const cancelAllOrders = async () => {
    try {
      setCancellingAll(true);
      // TODO: Implement actual cancel all orders functionality
      console.log('Cancelling all orders...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      setOrders([]);
    } catch (err) {
      console.error('Failed to cancel all orders:', err);
    } finally {
      setCancellingAll(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      // TODO: Implement actual cancel order functionality
      console.log(`Cancelling order ${orderId}...`);
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (err) {
      console.error(`Failed to cancel order ${orderId}:`, err);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-hl-text)' }}>
            Open Orders
          </h3>
          <div className="text-center text-hl-muted">Loading orders...</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-hl-text)' }}>
            Open Orders
          </h3>
          <div className="text-center text-hl-danger">Error: {error}</div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--color-hl-text)' }}>
            Open Orders
          </h3>
          {orders.length > 0 && (
            <Button
              onClick={cancelAllOrders}
              disabled={cancellingAll}
              variant="danger"
            >
              {cancellingAll ? 'Cancelling...' : 'Cancel All'}
            </Button>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="text-center text-hl-muted py-8">
            <div className="text-lg font-medium mb-2">No Open Orders</div>
            <div className="text-sm">Your open orders will appear here</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hl-border">
                  <th className="text-left py-2" style={{ color: 'var(--color-hl-text)' }}>Asset</th>
                  <th className="text-left py-2" style={{ color: 'var(--color-hl-text)' }}>Side</th>
                  <th className="text-left py-2" style={{ color: 'var(--color-hl-text)' }}>Type</th>
                  <th className="text-right py-2" style={{ color: 'var(--color-hl-text)' }}>Size</th>
                  <th className="text-right py-2" style={{ color: 'var(--color-hl-text)' }}>Price</th>
                  <th className="text-left py-2" style={{ color: 'var(--color-hl-text)' }}>Status</th>
                  <th className="text-left py-2" style={{ color: 'var(--color-hl-text)' }}>Time</th>
                  <th className="text-center py-2" style={{ color: 'var(--color-hl-text)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-hl-border/50">
                    <td className="py-2 font-medium" style={{ color: 'var(--color-hl-text)' }}>
                      {order.asset}
                    </td>
                    <td className="py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          order.side === 'buy'
                            ? 'bg-green-500/20 text-green-600'
                            : 'bg-red-500/20 text-red-600'
                        }`}
                      >
                        {order.side.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2">
                      <span className="px-2 py-1 rounded text-xs bg-hl-primary/20 text-hl-primary">
                        {order.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2 text-right" style={{ color: 'var(--color-hl-text)' }}>
                      {order.size}
                    </td>
                    <td className="py-2 text-right" style={{ color: 'var(--color-hl-text)' }}>
                      {order.price ? `$${parseFloat(order.price).toLocaleString()}` : 'Market'}
                    </td>
                    <td className="py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          order.status === 'open'
                            ? 'bg-blue-500/20 text-blue-600'
                            : order.status === 'partial'
                            ? 'bg-yellow-500/20 text-yellow-600'
                            : 'bg-gray-500/20 text-gray-600'
                        }`}
                      >
                        {order.status.toUpperCase()}
                      </span>
                      {order.reduceOnly && (
                        <span className="ml-1 px-1 py-0.5 rounded text-xs bg-orange-500/20 text-orange-600">
                          RO
                        </span>
                      )}
                    </td>
                    <td className="py-2 text-xs" style={{ color: 'var(--color-hl-muted)' }}>
                      {formatTimestamp(order.timestamp)}
                    </td>
                    <td className="py-2 text-center">
                      <Button
                        onClick={() => cancelOrder(order.id)}
                        variant="danger"
                      >
                        Cancel
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
}
