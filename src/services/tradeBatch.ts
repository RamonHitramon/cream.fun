import { placeOrder } from './trade';

export interface BatchItem {
  asset: string;
  side: 'buy' | 'sell';
  size: string;
  price?: string;
  leverage?: number;
  reduceOnly?: boolean;
}

export interface BatchPlan {
  items: BatchItem[];
  totalLongUsd: number;
  totalShortUsd: number;
  warnings: string[];
  riskScore: number;
}

export interface BatchResult {
  success: boolean;
  orderIds: string[];
  errors: string[];
  error?: string;
  riskScore?: number;
}

export async function placeBatch(
  plan: BatchPlan,
  orderType: 'market' | 'limit',
  pin: string,
  userAddress: string
): Promise<BatchResult> {
  const results: BatchResult = {
    success: false,
    orderIds: [],
    errors: [],
    riskScore: plan.riskScore
  };

  // Risk validation
  if (plan.riskScore > 0.8) {
    results.error = 'Risk validation failed: Risk score too high';
    return results;
  }

  // Check warnings
  if (plan.warnings.length > 0) {
    console.warn('Batch plan warnings:', plan.warnings);
  }

  try {
    // Place orders sequentially to avoid overwhelming the API
    for (const item of plan.items) {
      try {
        const orderRequest = {
          a: item.asset,
          b: item.side,
          t: orderType,
          s: item.size,
          p: orderType === 'limit' ? item.price : undefined,
          ro: item.reduceOnly || false,
          cloid: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };

        const response = await placeOrder(orderRequest, pin, userAddress);
        if (response.success && response.orderId) {
          results.orderIds.push(response.orderId);
        } else {
          results.errors.push(`${item.asset} ${item.side}: ${response.error || 'Unknown error'}`);
        }
        
        // Small delay between orders
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`${item.asset} ${item.side}: ${errorMsg}`);
        console.error(`Failed to place order for ${item.asset}:`, error);
      }
    }

    results.success = results.orderIds.length > 0;
    
    if (results.errors.length > 0 && results.orderIds.length === 0) {
      results.error = `All orders failed: ${results.errors.join(', ')}`;
    } else if (results.errors.length > 0) {
      results.error = `Partial success: ${results.errors.length} orders failed`;
    }

    return results;
  } catch (error) {
    results.error = error instanceof Error ? error.message : 'Unknown error';
    return results;
  }
}

export function calculateBatchRisk(plan: BatchPlan): number {
  let riskScore = 0;

  // Base risk from total exposure
  const totalExposure = plan.totalLongUsd + plan.totalShortUsd;
  if (totalExposure > 10000) riskScore += 0.2;
  if (totalExposure > 50000) riskScore += 0.3;

  // Risk from number of orders
  if (plan.items.length > 10) riskScore += 0.1;
  if (plan.items.length > 20) riskScore += 0.2;

  // Risk from leverage
  const highLeverageItems = plan.items.filter(item => (item.leverage || 1) > 5);
  if (highLeverageItems.length > 0) riskScore += 0.2;

  // Risk from warnings
  riskScore += plan.warnings.length * 0.1;

  return Math.min(riskScore, 1.0);
}
