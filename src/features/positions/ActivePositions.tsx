'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/features/ui/Card';
import { Button } from '@/features/ui/Button';

interface Position {
  asset: string;
  side: 'long' | 'short';
  size: string;
  entryPrice: string;
  markPrice: string;
  pnl: string;
  pnlPercent: string;
  leverage: string;
}

interface ActivePositionsProps {
  userAddress: string;
  pin: string;
}

export function ActivePositions({ userAddress, pin }: ActivePositionsProps) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [closingAll, setClosingAll] = useState(false);

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        setLoading(true);
        // TODO: Implement actual positions fetching from Hyperliquid API
        // For now, return mock data
        const mockPositions: Position[] = [
          {
            asset: 'BTC',
            side: 'long',
            size: '0.1',
            entryPrice: '45000',
            markPrice: '46000',
            pnl: '100',
            pnlPercent: '2.22',
            leverage: '2x'
          },
          {
            asset: 'ETH',
            side: 'short',
            size: '1.0',
            entryPrice: '3000',
            markPrice: '2950',
            pnl: '50',
            pnlPercent: '1.67',
            leverage: '3x'
          }
        ];
        setPositions(mockPositions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch positions');
      } finally {
        setLoading(false);
      }
    };

    if (userAddress && pin) {
      fetchPositions();
    }
  }, [userAddress, pin]);

  const closeAllPositions = async () => {
    try {
      setClosingAll(true);
      // TODO: Implement actual close all positions functionality
      console.log('Closing all positions...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      setPositions([]);
    } catch (err) {
      console.error('Failed to close all positions:', err);
    } finally {
      setClosingAll(false);
    }
  };

  const closePosition = async (asset: string) => {
    try {
      // TODO: Implement actual close position functionality
      console.log(`Closing position for ${asset}...`);
      setPositions(prev => prev.filter(p => p.asset !== asset));
    } catch (err) {
      console.error(`Failed to close position for ${asset}:`, err);
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-hl-text)' }}>
            Active Positions
          </h3>
          <div className="text-center text-hl-muted">Loading positions...</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-hl-text)' }}>
            Active Positions
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
            Active Positions
          </h3>
          {positions.length > 0 && (
            <Button
              onClick={closeAllPositions}
              disabled={closingAll}
              variant="danger"
            >
              {closingAll ? 'Closing...' : 'Close All'}
            </Button>
          )}
        </div>

        {positions.length === 0 ? (
          <div className="text-center text-hl-muted py-8">
            <div className="text-lg font-medium mb-2">No Active Positions</div>
            <div className="text-sm">Your positions will appear here when you open trades</div>
          </div>
        ) : (
          <div className="space-y-3">
            {positions.map((position) => (
              <div
                key={position.asset}
                className="p-4 border border-hl-border rounded-lg bg-hl-surface/30"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-lg" style={{ color: 'var(--color-hl-text)' }}>
                        {position.asset}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          position.side === 'long'
                            ? 'bg-green-500/20 text-green-600'
                            : 'bg-red-500/20 text-red-600'
                        }`}
                      >
                        {position.side.toUpperCase()}
                      </span>
                      <span className="text-xs px-2 py-1 bg-hl-primary/20 text-hl-primary rounded">
                        {position.leverage}
                      </span>
                    </div>
                    <div className="text-sm text-hl-muted">
                      Size: {position.size} {position.asset}
                    </div>
                  </div>
                  <Button
                    onClick={() => closePosition(position.asset)}
                    variant="danger"
                  >
                    Close
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-hl-muted">Entry Price</div>
                    <div style={{ color: 'var(--color-hl-text)' }}>
                      ${parseFloat(position.entryPrice).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-hl-muted">Mark Price</div>
                    <div style={{ color: 'var(--color-hl-text)' }}>
                      ${parseFloat(position.markPrice).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-hl-muted">PnL</div>
                    <div
                      className={`font-semibold ${
                        parseFloat(position.pnl) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      ${position.pnl} ({position.pnlPercent}%)
                    </div>
                  </div>
                  <div>
                    <div className="text-hl-muted">Value</div>
                    <div style={{ color: 'var(--color-hl-text)' }}>
                      ${(parseFloat(position.size) * parseFloat(position.markPrice)).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}