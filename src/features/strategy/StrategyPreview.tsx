'use client';

import React from 'react';
import { StrategyPlan } from '@/services/strategy/calc';

interface StrategyPreviewProps {
  plan: StrategyPlan | null;
  loading: boolean;
}

export function StrategyPreview({ plan, loading }: StrategyPreviewProps) {
  if (loading) {
    return (
      <div className="mt-6 p-4 bg-hl-surface border border-hl-border rounded-lg">
        <div className="text-center text-hl-muted">
          <div className="animate-spin w-6 h-6 border-2 border-hl-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          Calculating strategy...
        </div>
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  return (
    <div className="mt-6 p-4 bg-hl-surface border border-hl-border rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--color-hl-text)' }}>
          Strategy Preview
        </h3>
        <div className="text-sm text-hl-muted">
          Long: ${plan.totalLongUsd.toFixed(2)} | Short: ${plan.totalShortUsd.toFixed(2)}
        </div>
      </div>

      {/* Strategy Items Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-hl-border">
              <th className="text-left py-2 font-medium" style={{ color: 'var(--color-hl-text)' }}>
                Asset
              </th>
              <th className="text-center py-2 font-medium" style={{ color: 'var(--color-hl-text)' }}>
                Side
              </th>
              <th className="text-right py-2 font-medium" style={{ color: 'var(--color-hl-text)' }}>
                Size (Rounded)
              </th>
              <th className="text-right py-2 font-medium" style={{ color: 'var(--color-hl-text)' }}>
                Est. Price
              </th>
              <th className="text-right py-2 font-medium" style={{ color: 'var(--color-hl-text)' }}>
                Target USD
              </th>
              <th className="text-left py-2 font-medium" style={{ color: 'var(--color-hl-text)' }}>
                Warnings
              </th>
            </tr>
          </thead>
          <tbody>
            {plan.items.map((item) => (
              <tr key={`${item.asset}-${item.side}`} className="border-b border-hl-border/50">
                <td className="py-2 font-medium" style={{ color: 'var(--color-hl-text)' }}>
                  {item.asset}
                </td>
                <td className="py-2 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.side === 'buy' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.side.toUpperCase()}
                  </span>
                </td>
                <td className="py-2 text-right font-mono" style={{ color: 'var(--color-hl-text)' }}>
                  {parseFloat(item.size).toFixed(6)}
                </td>
                <td className="py-2 text-right font-mono" style={{ color: 'var(--color-hl-text)' }}>
                  ${parseFloat(item.price || '0').toFixed(2)}
                </td>
                <td className="py-2 text-right font-mono" style={{ color: 'var(--color-hl-text)' }}>
                  ${item.usdValue.toFixed(2)}
                </td>
                <td className="py-2 text-left">
                  <span className="text-xs text-green-600">✓ OK</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Global Warnings */}
      {plan.warnings.length > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="font-semibold text-yellow-800 mb-2">⚠️ Strategy Warnings:</div>
          <div className="space-y-1">
            {plan.warnings.map((warning, index) => (
              <div key={index} className="text-sm text-yellow-700">
                • {warning}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-hl-border">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-hl-muted">Total Long:</span>
            <span className="ml-2 font-medium text-green-600">
              ${plan.totalLongUsd.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-hl-muted">Total Short:</span>
            <span className="ml-2 font-medium text-red-600">
              ${plan.totalShortUsd.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
