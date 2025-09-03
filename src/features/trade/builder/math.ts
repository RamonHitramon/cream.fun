import { Side, PreparedOrder } from './types';
import type { PerpMeta } from '@/features/trade/hl/types';

export const DEFAULT_MIN_ORDER_USD = 10; // $10 minimum order size

export interface OrderSummary {
  orders: PreparedOrder[];
  totalUsd: number;
  estimatedFees: number;
  stats: {
    totalPairs: number;
    processedPairs: number;
    droppedPairs: number;
    adjustedPairs: number;
    warnings: string[];
  };
}

export interface MinOrderConfig {
  respectMinOrDrop: boolean; // true = поднимаем до минимума, false = отбрасываем
  compensateFromOthers: boolean; // true = компенсируем за счет других пар
}

/**
 * Возвращает минимальный допустимый объём ордера в USD.
 * Приоритет:
 * 1) meta.minOrderUsd, если задано;
 * 2) эвристика: markPx * 10^-szDecimals (если есть markPx и szDecimals);
 * 3) жёсткий фолбэк = $1.
 */
export function calculateMinOrderUsd(meta: PerpMeta): number {
  if (typeof meta.minOrderUsd === 'number' && isFinite(meta.minOrderUsd)) {
    return meta.minOrderUsd;
  }

  const hasPx = typeof meta.markPx === 'number' && isFinite(meta.markPx);
  const hasSz = typeof meta.szDecimals === 'number' && isFinite(meta.szDecimals);

  if (hasPx && hasSz) {
    const stepSz = Math.pow(10, -(meta.szDecimals as number));
    const est = (meta.markPx as number) * stepSz;
    if (est > 1) return est;
  }

  return 1;
}

/**
 * Рассчитывает размер позиции в базовой валюте
 */
export function calculatePositionSize(
  usdAmount: number,
  price: number,
  szDecimals: number
): number {
  const size = usdAmount / price;
  const precision = Math.pow(10, szDecimals);
  return Math.floor(size * precision) / precision;
}

/**
 * Пересчитывает размер обратно в USD после округления
 */
export function recalculateUsdFromSize(
  size: number,
  price: number
): number {
  return size * price;
}

/**
 * Валидирует плечо для пары
 */
export function validateLeverage(leverage: number, meta: PerpMeta): { valid: boolean; maxLeverage: number; adjusted?: number } {
  if (!meta.maxLeverage) {
    return { valid: true, maxLeverage: Infinity };
  }
  
  if (leverage <= meta.maxLeverage) {
    return { valid: true, maxLeverage: meta.maxLeverage };
  }
  
  return { 
    valid: false, 
    maxLeverage: meta.maxLeverage, 
    adjusted: meta.maxLeverage 
  };
}

/**
 * Распределяет USD равными долями между символами с учетом минимальных ордеров
 */
export function splitUsdAcrossSymbols(
  totalUsd: number,
  symbols: string[],
  metas: PerpMeta[],
  config: MinOrderConfig = { respectMinOrDrop: true, compensateFromOthers: true }
): OrderSummary {
  if (symbols.length === 0) {
    return {
      orders: [],
      totalUsd: 0,
      estimatedFees: 0,
      stats: {
        totalPairs: 0,
        processedPairs: 0,
        droppedPairs: 0,
        adjustedPairs: 0,
        warnings: [],
      },
    };
  }

  const warnings: string[] = [];
  const orders: PreparedOrder[] = [];
  let totalUsdUsed = 0;
  let droppedPairs = 0;
  let adjustedPairs = 0;

  // Первый проход: рассчитываем базовое распределение
  const baseUsdPerSymbol = totalUsd / symbols.length;
  const symbolAllocations: Record<string, { 
    baseUsd: number; 
    meta: PerpMeta; 
    minOrderUsd: number;
    canProcess: boolean;
  }> = {};

  symbols.forEach(symbol => {
    const meta = metas.find(m => m.symbol === symbol);
    if (!meta) {
      droppedPairs++;
      return;
    }

    const minOrderUsd = calculateMinOrderUsd(meta);
    const canProcess = baseUsdPerSymbol >= minOrderUsd;

    symbolAllocations[symbol] = {
      baseUsd: baseUsdPerSymbol,
      meta,
      minOrderUsd,
      canProcess,
    };

    if (!canProcess && !config.respectMinOrDrop) {
      droppedPairs++;
    }
  });

  // Второй проход: обрабатываем пары
  const processableSymbols = Object.entries(symbolAllocations)
    .filter(([, data]) => data.canProcess || config.respectMinOrDrop);

  if (processableSymbols.length === 0) {
    return {
      orders: [],
      totalUsd: 0,
      estimatedFees: 0,
      stats: {
        totalPairs: symbols.length,
        processedPairs: 0,
        droppedPairs: symbols.length,
        adjustedPairs: 0,
        warnings: ['No pairs can be processed due to minimum order requirements'],
      },
    };
  }

  // Пересчитываем распределение для обрабатываемых пар
  let adjustedTotalUsd = totalUsd;
  let compensationNeeded = 0;

  // Собираем компенсацию от отброшенных пар
  Object.entries(symbolAllocations).forEach(([, data]) => {
    if (!data.canProcess && !config.respectMinOrDrop) {
      compensationNeeded += data.baseUsd;
    }
  });

  // Если нужно компенсировать, увеличиваем сумму для оставшихся пар
  if (compensationNeeded > 0 && config.compensateFromOthers) {
    adjustedTotalUsd = totalUsd + compensationNeeded;
    warnings.push(`Compensated ${compensationNeeded.toFixed(2)} USD from dropped pairs`);
  }

  const finalUsdPerSymbol = adjustedTotalUsd / processableSymbols.length;

  // Обрабатываем каждую пару
  processableSymbols.forEach(([, data]) => {
    let finalUsd = finalUsdPerSymbol;

    // Если пара не проходит минимум, но мы уважаем его
    if (!data.canProcess && config.respectMinOrDrop) {
      finalUsd = data.minOrderUsd;
      adjustedPairs++;
      warnings.push(`${data.meta.symbol}: raised to minimum order size ${data.minOrderUsd.toFixed(2)} USD`);
    }

    // Рассчитываем размер в базовой валюте
    if (data.meta.markPx && data.meta.szDecimals !== undefined) {
      const size = calculatePositionSize(finalUsd, data.meta.markPx, data.meta.szDecimals);
      const recalculatedUsd = recalculateUsdFromSize(size, data.meta.markPx);

      orders.push({
        symbol: data.meta.symbol,
        side: 'BUY', // Будет установлено позже
        sz: size,
        type: 'market', // Будет установлено позже
      });

      totalUsdUsed += recalculatedUsd;
    }
  });

  return {
    orders,
    totalUsd: totalUsdUsed,
    estimatedFees: 0, // Будет рассчитано позже
    stats: {
      totalPairs: symbols.length,
      processedPairs: orders.length,
      droppedPairs,
      adjustedPairs,
      warnings,
    },
  };
}

/**
 * Применяет slippage к цене
 */
export function applySlippage(
  price: number,
  slippageBps: number,
  side: Side
): number {
  const slippageMultiplier = slippageBps / 10000;
  
  if (side === 'BUY') {
    // Для покупки: увеличиваем цену (хуже для покупателя)
    return price * (1 + slippageMultiplier);
  } else {
    // Для продажи: уменьшаем цену (хуже для продавца)
    return price * (1 - slippageMultiplier);
  }
}

/**
 * Рассчитывает комиссии Builder Codes
 */
export function calculateBuilderFees(totalUsd: number, feeBps: number): number {
  return (totalUsd * feeBps) / 10000;
}

/**
 * Генерирует уникальный client order ID
 */
export function generateCloid(): string {
  return `cloid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Генерирует UUID для idempotency
 */
export function generateIdempotencyKey(): string {
  return `basket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
