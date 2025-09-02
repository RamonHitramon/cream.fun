import { BasketInput, PreparedOrder, BasketTradeResult, Side } from './types';
import { PerpMeta } from '../hl/types';
import { PerpMarket } from '@/lib/hyperliquid/types';
import { 
  splitUsdAcrossSymbols, 
  validateLeverage,
  calculateBuilderFees,
  applySlippage,
  MinOrderConfig
} from './math';
import { builderClient, WalletLike } from './client';

export interface PreviewResult {
  orders: PreparedOrder[];
  totalUsd: number;
  estimatedFees: number;
  stats: {
    totalPairs: number;
    processedPairs: number;
    droppedPairs: number;
    adjustedPairs: number;
    warnings: string[];
    leverageWarnings: string[];
  };
  canSubmit: boolean;
  criticalErrors: string[];
}

export interface PlaceBasketOptions {
  wallet: WalletLike;
  minOrderConfig?: MinOrderConfig;
  slippageBps?: number;
  retryAttempts?: number;
}

/**
 * Валидирует входные данные для корзины
 */
export function validateBasketInput(input: BasketInput, metas: Record<string, PerpMeta>): string[] {
  const errors: string[] = [];

  // Базовые проверки
  if (input.totalUsd <= 0) {
    errors.push('Total USD must be positive');
  }

  if (input.symbols.length === 0) {
    errors.push('At least one symbol must be selected');
  }

  // Проверка slippage
  if (input.slippageBps !== undefined) {
    if (input.slippageBps < 0 || input.slippageBps > 1000) {
      errors.push('Slippage must be between 0 and 1000 bps (0-10%)');
    }
  }

  // Проверка limit ордеров
  if (input.orderType === 'limit') {
    if (!input.limitPxBySymbol || Object.keys(input.limitPxBySymbol).length === 0) {
      errors.push('Limit orders require prices for all symbols');
    } else {
      // Проверяем, что у всех выбранных пар есть цены
      const missingPrices = input.symbols.filter(symbol => !input.limitPxBySymbol![symbol]);
      if (missingPrices.length > 0) {
        errors.push(`Missing prices for: ${missingPrices.join(', ')}`);
      }
    }
  }

  // Проверка плеча
  if (input.leverage) {
    if (input.leverage <= 0) {
      errors.push('Leverage must be positive');
    }
    
    // Проверяем максимальное плечо для каждой пары
    input.symbols.forEach(symbol => {
      const meta = metas[symbol];
      if (meta && meta.maxLeverage && input.leverage! > meta.maxLeverage) {
        errors.push(`${symbol}: leverage ${input.leverage}x exceeds maximum ${meta.maxLeverage}x`);
      }
    });
  }

  return errors;
}

/**
 * Конвертирует PerpMarket в PerpMeta
 */
export function convertToPerpMeta(markets: PerpMarket[]): Record<string, PerpMeta> {
  const metaMap: Record<string, PerpMeta> = {};
  
  markets.forEach(market => {
    metaMap[market.symbol] = {
      symbol: market.symbol,
      maxLeverage: market.maxLeverage,
      szDecimals: market.szDecimals,
      minOrderUsd: undefined, // Будет рассчитано
      markPx: market.markPx,
    };
  });
  
  return metaMap;
}

/**
 * Подготавливает preview корзины ордеров
 */
export function prepareBasketPreview(
  input: BasketInput,
  metas: Record<string, PerpMeta>
): PreviewResult {
  // Валидация
  const validationErrors = validateBasketInput(input, metas);
  
  if (validationErrors.length > 0) {
    return {
      orders: [],
      totalUsd: 0,
      estimatedFees: 0,
      stats: {
        totalPairs: input.symbols.length,
        processedPairs: 0,
        droppedPairs: input.symbols.length,
        adjustedPairs: 0,
        warnings: [],
        leverageWarnings: [],
      },
      canSubmit: false,
      criticalErrors: validationErrors,
    };
  }

  try {
    // Распределяем USD между парами
    const allocation = splitUsdAcrossSymbols(
      input.totalUsd,
      input.symbols,
      Object.values(metas),
      { respectMinOrDrop: true, compensateFromOthers: true }
    );

    // Применяем slippage и устанавливаем правильные параметры
    const orders: PreparedOrder[] = [];
    const leverageWarnings: string[] = [];
    let totalUsdUsed = 0;

    allocation.orders.forEach(order => {
      const meta = metas[order.symbol];
      if (!meta) return;

      // Проверяем плечо
      if (input.leverage) {
        const leverageCheck = validateLeverage(input.leverage, meta);
        if (!leverageCheck.valid && leverageCheck.adjusted) {
          leverageWarnings.push(`${order.symbol}: leverage clipped from ${input.leverage}x to ${leverageCheck.maxLeverage}x`);
        }
      }

      // Применяем slippage для market ордеров
      let finalPrice = meta.markPx;
      if (input.orderType === 'market' && input.slippageBps && finalPrice) {
        finalPrice = applySlippage(finalPrice, input.slippageBps, input.side);
      }

      // Устанавливаем limit цену
      let limitPrice: number | undefined;
      if (input.orderType === 'limit' && input.limitPxBySymbol) {
        limitPrice = input.limitPxBySymbol[order.symbol];
      }

      // Пересчитываем USD после округления
      if (finalPrice) {
        const recalculatedUsd = order.sz * finalPrice;
        totalUsdUsed += recalculatedUsd;
      }

      orders.push({
        symbol: order.symbol,
        side: input.side,
        sz: order.sz,
        type: input.orderType,
        px: limitPrice,
      });
    });

    // Рассчитываем комиссии
    const estimatedFees = calculateBuilderFees(
      totalUsdUsed, 
      builderClient.getBuilderInfo().feeBps
    );

    // Определяем, можно ли отправлять
    const canSubmit = orders.length > 0 && 
                     allocation.stats.processedPairs > 0 && 
                     validationErrors.length === 0;

    return {
      orders,
      totalUsd: totalUsdUsed,
      estimatedFees,
      stats: {
        ...allocation.stats,
        leverageWarnings,
      },
      canSubmit,
      criticalErrors: validationErrors,
    };
  } catch (error) {
    return {
      orders: [],
      totalUsd: 0,
      estimatedFees: 0,
      stats: {
        totalPairs: input.symbols.length,
        processedPairs: 0,
        droppedPairs: input.symbols.length,
        adjustedPairs: 0,
        warnings: [],
        leverageWarnings: [],
      },
      canSubmit: false,
      criticalErrors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}

/**
 * Размещает корзину ордеров через Builder Codes
 */
export async function placeBasket(
  input: BasketInput,
  metas: Record<string, PerpMeta>,
  options: PlaceBasketOptions
): Promise<BasketTradeResult> {
  // Подготавливаем preview
  const preview = prepareBasketPreview(input, metas);
  
  if (!preview.canSubmit) {
    return {
      success: false,
      orders: [],
      totalUsd: preview.totalUsd,
      estimatedFees: preview.estimatedFees,
      error: preview.criticalErrors.join('; '),
    };
  }

  // Проверяем конфигурацию Builder
  if (!builderClient.isConfigured()) {
    return {
      success: false,
      orders: [],
      totalUsd: preview.totalUsd,
      estimatedFees: preview.estimatedFees,
      error: 'Builder Codes not configured. Please set NEXT_PUBLIC_BUILDER_ADDRESS in environment variables.',
    };
  }

  try {
    // Отправляем ордера через Builder Codes
    const result = await builderClient.signAndSubmit(
      preview.orders,
      {
        builderAddress: builderClient.getBuilderInfo().address,
        builderFeeBps: builderClient.getBuilderInfo().feeBps,
        wallet: options.wallet,
        retryAttempts: options.retryAttempts || 3,
      }
    );

    if (result.success) {
      return {
        success: true,
        orders: preview.orders,
        totalUsd: preview.totalUsd,
        estimatedFees: preview.estimatedFees,
      };
    } else {
      return {
        success: false,
        orders: [],
        totalUsd: preview.totalUsd,
        estimatedFees: preview.estimatedFees,
        error: result.error || 'Failed to submit orders',
      };
    }
  } catch (error) {
    return {
      success: false,
      orders: [],
      totalUsd: preview.totalUsd,
      estimatedFees: preview.estimatedFees,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Создает корзину с раздельными лонг/шорт позициями
 */
export async function placePairBasket(
  longInput: Omit<BasketInput, 'side'>,
  shortInput: Omit<BasketInput, 'side'>,
  metas: Record<string, PerpMeta>,
  options: PlaceBasketOptions
): Promise<BasketTradeResult[]> {
  const longResult = await placeBasket(
    { ...longInput, side: 'BUY' as Side },
    metas,
    options
  );

  const shortResult = await placeBasket(
    { ...shortInput, side: 'SELL' as Side },
    metas,
    options
  );

  return [longResult, shortResult];
}

/**
 * Получает preview для двухсторонней торговли
 */
export function preparePairBasketPreview(
  longInput: Omit<BasketInput, 'side'>,
  shortInput: Omit<BasketInput, 'side'>,
  metas: Record<string, PerpMeta>
): { long: PreviewResult; short: PreviewResult; combined: PreviewResult } {
  const longPreview = prepareBasketPreview({ ...longInput, side: 'BUY' }, metas);
  const shortPreview = prepareBasketPreview({ ...shortInput, side: 'SELL' }, metas);

  // Комбинированная статистика
  const combined = {
    orders: [...longPreview.orders, ...shortPreview.orders],
    totalUsd: longPreview.totalUsd + shortPreview.totalUsd,
    estimatedFees: longPreview.estimatedFees + shortPreview.estimatedFees,
    stats: {
      totalPairs: longPreview.stats.totalPairs + shortPreview.stats.totalPairs,
      processedPairs: longPreview.stats.processedPairs + shortPreview.stats.processedPairs,
      droppedPairs: longPreview.stats.droppedPairs + shortPreview.stats.droppedPairs,
      adjustedPairs: longPreview.stats.adjustedPairs + shortPreview.stats.adjustedPairs,
      warnings: [...longPreview.stats.warnings, ...shortPreview.stats.warnings],
      leverageWarnings: [...longPreview.stats.leverageWarnings, ...shortPreview.stats.leverageWarnings],
    },
    canSubmit: longPreview.canSubmit && shortPreview.canSubmit,
    criticalErrors: [...longPreview.criticalErrors, ...shortPreview.criticalErrors],
  };

  return { long: longPreview, short: shortPreview, combined };
}
