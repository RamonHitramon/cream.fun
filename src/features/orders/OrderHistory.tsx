import React from 'react';
import { Card } from '@/features/ui/Card';

export function OrderHistory() {
  // Mock data для истории ордеров
  const mockOrders = [
    {
      id: '1',
      symbol: 'BTC',
      side: 'Long',
      size: '0.1',
      price: '$45,000',
      status: 'Filled',
      time: '2 hours ago',
      pnl: '+$150'
    },
    {
      id: '2',
      symbol: 'ETH',
      side: 'Short',
      size: '1.5',
      price: '$2,800',
      status: 'Open',
      time: '5 hours ago',
      pnl: '-$45'
    },
    {
      id: '3',
      symbol: 'SOL',
      side: 'Long',
      size: '10',
      price: '$95',
      status: 'Filled',
      time: '1 day ago',
      pnl: '+$320'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Filled':
        return 'var(--color-hl-success)';
      case 'Open':
        return 'var(--color-hl-primary)';
      case 'Cancelled':
        return 'var(--color-hl-danger)';
      default:
        return 'var(--color-hl-muted)';
    }
  };

  const getPnlColor = (pnl: string) => {
    return pnl.startsWith('+') ? 'var(--color-hl-success)' : 'var(--color-hl-danger)';
  };

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-hl-text)' }}>
          Order History
        </h2>
        
        <div className="space-y-3">
          {mockOrders.map((order) => (
            <div
              key={order.id}
              className="p-4 rounded-lg border"
              style={{
                borderColor: 'var(--color-hl-border)',
                backgroundColor: 'var(--color-hl-surface)'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: order.side === 'Long' ? 'rgba(111, 255, 176, 0.2)' : 'rgba(255, 111, 97, 0.2)',
                        color: order.side === 'Long' ? 'var(--color-hl-success)' : 'var(--color-hl-danger)'
                      }}
                    >
                      {order.side}
                    </span>
                    <span className="font-semibold" style={{ color: 'var(--color-hl-text)' }}>
                      {order.symbol}
                    </span>
                  </div>
                  
                  <div className="text-sm" style={{ color: 'var(--color-hl-muted)' }}>
                    {order.size} @ {order.price}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span
                    className="text-sm font-medium"
                    style={{ color: getStatusColor(order.status) }}
                  >
                    {order.status}
                  </span>
                  
                  <span
                    className="text-sm font-medium"
                    style={{ color: getPnlColor(order.pnl) }}
                  >
                    {order.pnl}
                  </span>
                  
                  <span className="text-sm" style={{ color: 'var(--color-hl-muted)' }}>
                    {order.time}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {mockOrders.length === 0 && (
          <div className="text-center py-8" style={{ color: 'var(--color-hl-muted)' }}>
            No orders yet
          </div>
        )}
      </div>
    </Card>
  );
}
