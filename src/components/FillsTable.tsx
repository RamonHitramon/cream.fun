'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/features/ui/Card';

interface Fill {
  id: string;
  asset: string;
  side: 'buy' | 'sell';
  size: string;
  price: string;
  timestamp: number;
  fee: string;
}

interface FillsTableProps {
  userAddress: string;
  pin: string;
}

export function FillsTable({ userAddress, pin }: FillsTableProps) {
  const [fills, setFills] = useState<Fill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFills = async () => {
      try {
        setLoading(true);
        // TODO: Implement actual fills fetching from Hyperliquid API
        // For now, return mock data
        const mockFills: Fill[] = [
          {
            id: '1',
            asset: 'BTC',
            side: 'buy',
            size: '0.1',
            price: '45000',
            timestamp: Date.now() - 3600000,
            fee: '2.25'
          },
          {
            id: '2',
            asset: 'ETH',
            side: 'sell',
            size: '1.0',
            price: '3000',
            timestamp: Date.now() - 7200000,
            fee: '1.5'
          }
        ];
        setFills(mockFills);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch fills');
      } finally {
        setLoading(false);
      }
    };

    if (userAddress && pin) {
      fetchFills();
    }
  }, [userAddress, pin]);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Asset', 'Side', 'Size', 'Price', 'Timestamp', 'Fee'],
      ...fills.map(fill => [
        fill.asset,
        fill.side,
        fill.size,
        fill.price,
        formatTimestamp(fill.timestamp),
        fill.fee
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fills_${userAddress.slice(0, 8)}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-hl-text)' }}>
            Trade History
          </h3>
          <div className="text-center text-hl-muted">Loading fills...</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-hl-text)' }}>
            Trade History
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
            Trade History
          </h3>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-hl-primary text-white rounded-lg text-sm hover:bg-hl-primary/80"
          >
            Export CSV
          </button>
        </div>

        {fills.length === 0 ? (
          <div className="text-center text-hl-muted py-8">
            No fills found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hl-border">
                  <th className="text-left py-2" style={{ color: 'var(--color-hl-text)' }}>Asset</th>
                  <th className="text-left py-2" style={{ color: 'var(--color-hl-text)' }}>Side</th>
                  <th className="text-right py-2" style={{ color: 'var(--color-hl-text)' }}>Size</th>
                  <th className="text-right py-2" style={{ color: 'var(--color-hl-text)' }}>Price</th>
                  <th className="text-right py-2" style={{ color: 'var(--color-hl-text)' }}>Fee</th>
                  <th className="text-left py-2" style={{ color: 'var(--color-hl-text)' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {fills.map((fill) => (
                  <tr key={fill.id} className="border-b border-hl-border/50">
                    <td className="py-2 font-medium" style={{ color: 'var(--color-hl-text)' }}>
                      {fill.asset}
                    </td>
                    <td className="py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          fill.side === 'buy'
                            ? 'bg-green-500/20 text-green-600'
                            : 'bg-red-500/20 text-red-600'
                        }`}
                      >
                        {fill.side.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2 text-right" style={{ color: 'var(--color-hl-text)' }}>
                      {fill.size}
                    </td>
                    <td className="py-2 text-right" style={{ color: 'var(--color-hl-text)' }}>
                      ${parseFloat(fill.price).toLocaleString()}
                    </td>
                    <td className="py-2 text-right" style={{ color: 'var(--color-hl-text)' }}>
                      ${fill.fee}
                    </td>
                    <td className="py-2 text-xs" style={{ color: 'var(--color-hl-muted)' }}>
                      {formatTimestamp(fill.timestamp)}
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
