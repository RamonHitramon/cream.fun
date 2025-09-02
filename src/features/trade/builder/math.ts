import { PerpMeta, Side } from './types';

export const DEFAULT_MIN_ORDER_USD = 10; // $10 minimum order size

/**
 * Рассчитывает минимальный размер ордера в USD для пары
 */
export function calculateMinOrderUsd(meta: PerpMeta): number {
  if (meta.minOrderUsd) {
    return meta.minOrderUsd;
  }
  
  // Если нет minOrderUsd, оцениваем по szDecimals и markPx
  if (meta.szDecimals !== undefined && meta.markPx) {
    const minSz = Math.pow(10, -meta.szDecimals);
    return minSz * meta.markPx;
  }
  
  return DEFAULT_MIN_ORDER_USD;
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
 * Валидирует плечо для пары
 */
export function validateLeverage(leverage: number, meta: PerpMeta): boolean {
  if (!meta.maxLeverage) return true; // Если нет ограничений, разрешаем
  return leverage <= meta.maxLeverage;
}

/**
 * Рассчитывает пропорциональное распределение суммы между парами
 */
export function calculateProportionalAllocation(
  totalUsd: number,
  symbols: string[],
  metas: PerpMeta[]
): Record<string, number> {
  const allocation: Record<string, number> = {};
  
  if (symbols.length === 0) return allocation;
  
  // Равномерное распределение
  const usdPerSymbol = totalUsd / symbols.length;
  
  symbols.forEach(symbol => {
    const meta = metas.find(m => m.symbol === symbol);
    if (meta) {
      allocation[symbol] = usdPerSymbol;
    }
  });
  
  return allocation;
}

/**
 * Рассчитывает размер ордера с учетом минимальных требований
 */
export function calculateOrderSize(
  usdAmount: number,
  meta: PerpMeta,
  _side: Side // Используем подчеркивание для неиспользуемого параметра
): number | null {
  const minOrderUsd = calculateMinOrderUsd(meta);
  
  if (usdAmount < minOrderUsd) {
    return null; // Слишком маленький ордер
  }
  
  if (!meta.markPx || !meta.szDecimals) {
    return null; // Нет необходимых данных
  }
  
  const size = calculatePositionSize(usdAmount, meta.markPx, meta.szDecimals);
  
  // Проверяем, что размер не слишком маленький
  const minSize = Math.pow(10, -meta.szDecimals);
  if (size < minSize) {
    return null;
  }
  
  return size;
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
