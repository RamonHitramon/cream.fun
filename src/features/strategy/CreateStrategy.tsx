import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LongBlock } from './LongBlock';
import { ShortBlock } from './ShortBlock';
import { useStrategyState } from '@/lib/hooks';

import { PerpMarket } from '@/lib/hyperliquid/types';

interface CreateStrategyProps {
  pairs: string[];
  markets?: PerpMarket[];
}

export function CreateStrategy({ pairs, markets = [] }: CreateStrategyProps) {
  const {
    longNotional,
    setLongNotional,
    shortNotional,
    setShortNotional,
    longLeverage,
    setLongLeverage,
    shortLeverage,
    setShortLeverage,
    longSlippage,
    setLongSlippage,
    shortSlippage,
    setShortSlippage,
    longMarketSelection,
    shortMarketSelection,
    hasSelectedPairs
  } = useStrategyState();

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-hl-success)' }}>
          Create Strategy
        </h2>
        <div className="px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: 'rgba(111, 255, 176, 0.2)', color: 'var(--color-hl-success)' }}>
          Data loaded successfully!
        </div>
      </div>

      <div className="space-y-6">
        {/* Long Block */}
        <LongBlock
          pairs={pairs}
          selectedPairs={longMarketSelection.selectedMarkets}
          onPairsChange={(pairs) => {
            // Convert pairs to market IDs for consistency
            const marketIds = pairs.map(pair => {
              const market = markets.find(m => m.display === pair);
              return market?.id || pair;
            });
            longMarketSelection.selectedMarkets.forEach(id => {
              if (!marketIds.includes(id)) {
                longMarketSelection.toggleMarket(id);
              }
            });
            marketIds.forEach(id => {
              if (!longMarketSelection.selectedMarkets.includes(id)) {
                longMarketSelection.toggleMarket(id);
              }
            });
          }}
          notional={longNotional}
          onNotionalChange={setLongNotional}
          leverage={longLeverage}
          onLeverageChange={setLongLeverage}
          slippage={longSlippage}
          onSlippageChange={setLongSlippage}
          markets={markets}
        />

        {/* Short Block */}
        <ShortBlock
          pairs={pairs}
          selectedPairs={shortMarketSelection.selectedMarkets}
          onPairsChange={(pairs) => {
            // Convert pairs to market IDs for consistency
            const marketIds = pairs.map(pair => {
              const market = markets.find(m => m.display === pair);
              return market?.id || pair;
            });
            shortMarketSelection.selectedMarkets.forEach(id => {
              if (!marketIds.includes(id)) {
                shortMarketSelection.toggleMarket(id);
              }
            });
            marketIds.forEach(id => {
              if (!shortMarketSelection.selectedMarkets.includes(id)) {
                shortMarketSelection.toggleMarket(id);
              }
            });
          }}
          notional={shortNotional}
          onNotionalChange={setShortNotional}
          leverage={shortLeverage}
          onLeverageChange={setShortLeverage}
          slippage={shortSlippage}
          onSlippageChange={setShortSlippage}
          markets={markets}
        />

        {/* Action Buttons */}
        <div className="pt-4" style={{ borderTop: '1px solid var(--color-hl-border)' }}>
          <div className="flex gap-3 mb-3">
            <Button variant="primary">
              Build Strategy Preview
            </Button>
            <Button variant="success" disabled={!hasSelectedPairs}>
              Place Basket Orders
            </Button>
          </div>
          <p className="text-sm" style={{ color: 'var(--color-hl-muted)' }}>
            Select at least one pair in Long or Short.
          </p>
        </div>
      </div>
    </Card>
  );
}
