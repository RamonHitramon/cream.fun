export interface StrategyConfig {
  mode: 'long-basket' | 'short-basket' | 'long-short';
  longAssets: string[];
  shortAssets: string[];
  longUsd: number;
  shortUsd: number;
  leverage: number;
  slippage?: number;
}

export interface StrategyItem {
  asset: string;
  side: 'buy' | 'sell';
  size: string;
  price?: string;
  leverage: number;
  usdValue: number;
  weight: number;
}

export interface StrategyPlan {
  items: StrategyItem[];
  totalLongUsd: number;
  totalShortUsd: number;
  warnings: string[];
  riskScore: number;
}

export async function buildStrategyPlan(config: StrategyConfig): Promise<StrategyPlan | null> {
  try {
    const plan: StrategyPlan = {
      items: [],
      totalLongUsd: 0,
      totalShortUsd: 0,
      warnings: [],
      riskScore: 0
    };

    // Validate configuration
    if (config.longAssets.length === 0 && config.shortAssets.length === 0) {
      plan.warnings.push('No assets selected');
      return plan;
    }

    if (config.longUsd <= 0 && config.shortUsd <= 0) {
      plan.warnings.push('No USD amount specified');
      return plan;
    }

    // Get current market prices (mock for now)
    const marketPrices = await getMarketPrices([...config.longAssets, ...config.shortAssets]);

    // Build long positions
    if (config.longAssets.length > 0 && config.longUsd > 0) {
      const longItems = buildAssetItems(
        config.longAssets,
        'buy',
        config.longUsd,
        config.leverage,
        marketPrices
      );
      plan.items.push(...longItems);
      plan.totalLongUsd = config.longUsd;
    }

    // Build short positions
    if (config.shortAssets.length > 0 && config.shortUsd > 0) {
      const shortItems = buildAssetItems(
        config.shortAssets,
        'sell',
        config.shortUsd,
        config.leverage,
        marketPrices
      );
      plan.items.push(...shortItems);
      plan.totalShortUsd = config.shortUsd;
    }

    // Calculate risk score
    plan.riskScore = calculateRiskScore(plan, config);

    // Add warnings based on risk
    if (plan.riskScore > 0.7) {
      plan.warnings.push('High risk strategy detected');
    }

    if (config.leverage > 5) {
      plan.warnings.push('High leverage detected');
    }

    if (plan.items.length > 10) {
      plan.warnings.push('Large number of positions');
    }

    return plan;
  } catch (error) {
    console.error('Failed to build strategy plan:', error);
    return null;
  }
}

function buildAssetItems(
  assets: string[],
  side: 'buy' | 'sell',
  totalUsd: number,
  leverage: number,
  marketPrices: Record<string, number>
): StrategyItem[] {
  const items: StrategyItem[] = [];
  const usdPerAsset = totalUsd / assets.length;

  for (const asset of assets) {
    const price = marketPrices[asset] || 1;
    const size = (usdPerAsset * leverage / price).toFixed(6);
    const weight = (1 / assets.length) * 100;

    items.push({
      asset,
      side,
      size,
      price: price.toString(),
      leverage,
      usdValue: usdPerAsset,
      weight
    });
  }

  return items;
}

async function getMarketPrices(assets: string[]): Promise<Record<string, number>> {
  // Mock market prices - in real implementation, fetch from API
  const mockPrices: Record<string, number> = {
    'BTC': 45000,
    'ETH': 3000,
    'SOL': 100,
    'AVAX': 25,
    'MATIC': 0.8,
    'LINK': 15,
    'UNI': 6,
    'AAVE': 100,
    'CRV': 0.5,
    'SUSHI': 1.2
  };

  const prices: Record<string, number> = {};
  for (const asset of assets) {
    prices[asset] = mockPrices[asset] || 1;
  }

  return prices;
}

function calculateRiskScore(plan: StrategyPlan, config: StrategyConfig): number {
  let riskScore = 0;

  // Base risk from leverage
  if (config.leverage > 1) riskScore += 0.1;
  if (config.leverage > 3) riskScore += 0.2;
  if (config.leverage > 5) riskScore += 0.3;

  // Risk from number of positions
  if (plan.items.length > 5) riskScore += 0.1;
  if (plan.items.length > 10) riskScore += 0.2;

  // Risk from total exposure
  const totalExposure = plan.totalLongUsd + plan.totalShortUsd;
  if (totalExposure > 10000) riskScore += 0.1;
  if (totalExposure > 50000) riskScore += 0.2;

  // Risk from mixed long/short
  if (plan.totalLongUsd > 0 && plan.totalShortUsd > 0) {
    riskScore += 0.1;
  }

  return Math.min(riskScore, 1.0);
}

export function validateStrategyConfig(config: StrategyConfig): string[] {
  const errors: string[] = [];

  if (config.longAssets.length === 0 && config.shortAssets.length === 0) {
    errors.push('At least one asset must be selected');
  }

  if (config.longUsd <= 0 && config.shortUsd <= 0) {
    errors.push('USD amount must be greater than 0');
  }

  if (config.leverage < 1 || config.leverage > 20) {
    errors.push('Leverage must be between 1x and 20x');
  }

  if (config.slippage && (config.slippage < 0 || config.slippage > 10)) {
    errors.push('Slippage must be between 0% and 10%');
  }

  return errors;
}
