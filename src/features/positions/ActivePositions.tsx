import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export function ActivePositions() {
  const longCount = 0;
  const shortCount = 0;
  const longPnL = 0;
  const shortPnL = 0;

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--color-hl-text)' }}>
          Active Positions
        </h2>
        <Button variant="danger" disabled={longCount === 0 && shortCount === 0}>
          Close All
        </Button>
      </div>

      {/* Stats Chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="chip" style={{ backgroundColor: 'rgba(111, 255, 176, 0.2)', color: 'var(--color-hl-success)' }}>
          Long: {longCount}
        </div>
        <div className="chip" style={{ backgroundColor: 'rgba(255, 111, 97, 0.2)', color: 'var(--color-hl-danger)' }}>
          Short: {shortCount}
        </div>
        <div className="chip" style={{ 
          backgroundColor: longPnL >= 0 ? 'rgba(111, 255, 176, 0.2)' : 'rgba(255, 111, 97, 0.2)', 
          color: longPnL >= 0 ? 'var(--color-hl-success)' : 'var(--color-hl-danger)' 
        }}>
          ▲ ${longPnL.toFixed(2)}
        </div>
        <div className="chip" style={{ 
          backgroundColor: shortPnL >= 0 ? 'rgba(111, 255, 176, 0.2)' : 'rgba(255, 111, 97, 0.2)', 
          color: shortPnL >= 0 ? 'var(--color-hl-success)' : 'var(--color-hl-danger)' 
        }}>
          ▲ ${shortPnL.toFixed(2)}
        </div>
      </div>

      {/* Empty State */}
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-hl-text)' }}>
          No active positions
        </h3>
        <p className="text-sm" style={{ color: 'var(--color-hl-muted)' }}>
          Create a strategy to start trading.
        </p>
      </div>
    </Card>
  );
}
