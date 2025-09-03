import React from 'react';
import { Card } from '@/features/ui/Card';

export function ActionButtons() {
  return (
    <Card>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-hl-text)' }}>
          Strategy Actions
        </h3>
        
        <div className="flex gap-3">
          <button
            className="flex-1 px-6 py-3 rounded-lg font-medium transition hover:opacity-90"
            style={{
              backgroundColor: 'var(--color-hl-primary)',
              color: 'var(--color-hl-bg)'
            }}
          >
            Calculate Strategy
          </button>
          <button
            className="flex-1 px-6 py-3 rounded-lg font-medium transition hover:opacity-90"
            style={{
              backgroundColor: 'var(--color-hl-success)',
              color: 'var(--color-hl-bg)'
            }}
          >
            Open Position
          </button>
        </div>
      </div>
    </Card>
  );
}
