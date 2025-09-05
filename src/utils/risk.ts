import { StrategyPlan } from '@/services/strategy/calc';

export interface RiskLimits {
  maxGrossExposureUsd: number;    // Максимальная общая экспозиция
  maxPerAssetUsd: number;         // Максимум на один актив
  minPerAssetUsd: number;         // Минимум на один актив
  maxCountLong: number;           // Максимум лонг позиций
  maxCountShort: number;          // Максимум шорт позиций
  maxTotalPositions: number;      // Максимум общих позиций
  maxLeverage: number;            // Максимальное плечо
}

export interface RiskValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

// Default risk limits
export const DEFAULT_RISK_LIMITS: RiskLimits = {
  maxGrossExposureUsd: 10000,     // $10,000 max exposure
  maxPerAssetUsd: 2000,           // $2,000 max per asset
  minPerAssetUsd: 50,             // $50 min per asset
  maxCountLong: 5,                // Max 5 long positions
  maxCountShort: 5,               // Max 5 short positions
  maxTotalPositions: 8,           // Max 8 total positions
  maxLeverage: 10                 // Max 10x leverage
};

export function validatePlan(plan: StrategyPlan, limits: RiskLimits = DEFAULT_RISK_LIMITS): RiskValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Filter out items with zero size
  const validItems = plan.items.filter(item => parseFloat(item.size) > 0);
  
  if (validItems.length === 0) {
    errors.push('No valid positions to open (all sizes are zero)');
    return { ok: false, errors, warnings };
  }

  // 1. Check total exposure
  const totalLongUsd = plan.totalLongUsd;
  const totalShortUsd = plan.totalShortUsd;
  const grossExposure = totalLongUsd + totalShortUsd;

  if (grossExposure > limits.maxGrossExposureUsd) {
    errors.push(`Total exposure $${grossExposure.toFixed(2)} exceeds limit $${limits.maxGrossExposureUsd}`);
  }

  // 2. Check per-asset limits
  for (const item of validItems) {
    if (item.usdValue > limits.maxPerAssetUsd) {
      errors.push(`${item.asset}: $${item.usdValue.toFixed(2)} exceeds per-asset limit $${limits.maxPerAssetUsd}`);
    }

    if (item.usdValue < limits.minPerAssetUsd) {
      errors.push(`${item.asset}: $${item.usdValue.toFixed(2)} below minimum $${limits.minPerAssetUsd}`);
    }
  }

  // 3. Check position counts
  const longCount = validItems.filter(item => item.side === 'buy').length;
  const shortCount = validItems.filter(item => item.side === 'sell').length;
  const totalCount = validItems.length;

  if (longCount > limits.maxCountLong) {
    errors.push(`Too many long positions: ${longCount} (max ${limits.maxCountLong})`);
  }

  if (shortCount > limits.maxCountShort) {
    errors.push(`Too many short positions: ${shortCount} (max ${limits.maxCountShort})`);
  }

  if (totalCount > limits.maxTotalPositions) {
    errors.push(`Too many total positions: ${totalCount} (max ${limits.maxTotalPositions})`);
  }

  // 4. Check leverage (simplified calculation)
  const maxLeverageUsed = Math.max(
    totalLongUsd > 0 ? totalLongUsd / Math.max(totalLongUsd - totalShortUsd, 1) : 0,
    totalShortUsd > 0 ? totalShortUsd / Math.max(totalShortUsd - totalLongUsd, 1) : 0
  );

  if (maxLeverageUsed > limits.maxLeverage) {
    errors.push(`Effective leverage ${maxLeverageUsed.toFixed(2)}x exceeds limit ${limits.maxLeverage}x`);
  }

  // 5. Check for warnings
  if (grossExposure > limits.maxGrossExposureUsd * 0.8) {
    warnings.push(`High exposure: $${grossExposure.toFixed(2)} (${((grossExposure / limits.maxGrossExposureUsd) * 100).toFixed(1)}% of limit)`);
  }

  if (totalCount > limits.maxTotalPositions * 0.8) {
    warnings.push(`Many positions: ${totalCount} (${((totalCount / limits.maxTotalPositions) * 100).toFixed(1)}% of limit)`);
  }

  // 6. Check for concentration risk
  const maxAssetExposure = Math.max(...validItems.map(item => item.usdValue));
  const concentrationRatio = maxAssetExposure / grossExposure;

  if (concentrationRatio > 0.5) {
    warnings.push(`High concentration: largest position is ${(concentrationRatio * 100).toFixed(1)}% of total exposure`);
  }

  // 7. Check for balanced exposure
  const longShortRatio = totalLongUsd > 0 && totalShortUsd > 0 
    ? Math.min(totalLongUsd, totalShortUsd) / Math.max(totalLongUsd, totalShortUsd)
    : 0;

  if (longShortRatio < 0.3 && totalLongUsd > 0 && totalShortUsd > 0) {
    warnings.push(`Unbalanced exposure: long/short ratio ${longShortRatio.toFixed(2)}`);
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings
  };
}

// Helper function to get risk summary
export function getRiskSummary(plan: StrategyPlan): string {
  const validItems = plan.items.filter(item => parseFloat(item.size) > 0);
  const longCount = validItems.filter(item => item.side === 'buy').length;
  const shortCount = validItems.filter(item => item.side === 'sell').length;
  const grossExposure = plan.totalLongUsd + plan.totalShortUsd;

  return `${validItems.length} positions (${longCount}L/${shortCount}S), $${grossExposure.toFixed(0)} exposure`;
}

// Helper function to check if plan is within safe limits
export function isPlanSafe(plan: StrategyPlan, limits: RiskLimits = DEFAULT_RISK_LIMITS): boolean {
  const validation = validatePlan(plan, limits);
  return validation.ok;
}

// Helper function to get risk score (0-100, lower is safer)
export function getRiskScore(plan: StrategyPlan, limits: RiskLimits = DEFAULT_RISK_LIMITS): number {
  const validation = validatePlan(plan, limits);
  
  if (!validation.ok) {
    return 100; // Maximum risk if validation fails
  }

  let score = 0;
  const validItems = plan.items.filter(item => parseFloat(item.size) > 0);
  const grossExposure = plan.totalLongUsd + plan.totalShortUsd;

  // Exposure score (0-30 points)
  const exposureRatio = grossExposure / limits.maxGrossExposureUsd;
  score += Math.min(exposureRatio * 30, 30);

  // Position count score (0-20 points)
  const positionRatio = validItems.length / limits.maxTotalPositions;
  score += Math.min(positionRatio * 20, 20);

  // Concentration score (0-25 points)
  const maxAssetExposure = Math.max(...validItems.map(item => item.usdValue));
  const concentrationRatio = maxAssetExposure / grossExposure;
  score += concentrationRatio * 25;

  // Leverage score (0-25 points)
  const maxLeverageUsed = Math.max(
    plan.totalLongUsd > 0 ? plan.totalLongUsd / Math.max(plan.totalLongUsd - plan.totalShortUsd, 1) : 0,
    plan.totalShortUsd > 0 ? plan.totalShortUsd / Math.max(plan.totalShortUsd - plan.totalLongUsd, 1) : 0
  );
  const leverageRatio = maxLeverageUsed / limits.maxLeverage;
  score += Math.min(leverageRatio * 25, 25);

  return Math.min(Math.round(score), 100);
}
