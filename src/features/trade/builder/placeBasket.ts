import { BasketInput, BasketTradeResult, Side, BasketPreview } from './types';
import { PerpMeta } from '../hl/types';
import { HyperliquidAsset } from '@/lib/hyperliquid/types';
import { previewBasket } from './preview';
import { builderClient, WalletLike } from './client';

export interface PlaceBasketOptions {
  wallet: WalletLike;
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
 * Конвертирует HyperliquidAsset в PerpMeta
 */
export function convertToPerpMeta(markets: HyperliquidAsset[]): Record<string, PerpMeta> {
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
): BasketPreview {
  // Валидация
  const validationErrors = validateBasketInput(input, metas);
  
  if (validationErrors.length > 0) {
    return {
      prepared: [],
      skipped: input.symbols.map(s => ({ symbol: s, reason: 'validation failed' })),
      estUsedUsd: 0,
    };
  }

  try {
    // Используем простую функцию previewBasket
    return previewBasket(input, metas);
  } catch {
    return {
      prepared: [],
      skipped: input.symbols.map(s => ({ symbol: s, reason: 'preview error' })),
      estUsedUsd: 0,
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
  
  if (preview.prepared.length === 0) {
    return {
      success: false,
      orders: [],
      totalUsd: preview.estUsedUsd,
      estimatedFees: 0,
      error: `No orders can be prepared. Skipped: ${preview.skipped.map(s => `${s.symbol}(${s.reason})`).join(', ')}`,
    };
  }

  // Проверяем конфигурацию Builder
  if (!builderClient.isConfigured()) {
    return {
      success: false,
      orders: [],
      totalUsd: preview.estUsedUsd,
      estimatedFees: 0,
      error: 'Builder Codes not configured. Please set NEXT_PUBLIC_BUILDER_ADDRESS in environment variables.',
    };
  }

  try {
    // Отправляем ордера через Builder Codes
    const result = await builderClient.signAndSubmit(
      preview.prepared,
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
        orders: preview.prepared,
        totalUsd: preview.estUsedUsd,
        estimatedFees: 0, // Будет рассчитано на основе суммы
      };
    } else {
      return {
        success: false,
        orders: [],
        totalUsd: preview.estUsedUsd,
        estimatedFees: 0,
        error: result.error || 'Failed to submit orders',
      };
    }
  } catch (error) {
    return {
      success: false,
      orders: [],
      totalUsd: preview.estUsedUsd,
      estimatedFees: 0,
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
): { long: BasketPreview; short: BasketPreview; combined: BasketPreview } {
  const longPreview = prepareBasketPreview({ ...longInput, side: 'BUY' }, metas);
  const shortPreview = prepareBasketPreview({ ...shortInput, side: 'SELL' }, metas);

  // Комбинированная статистика
  const combined: BasketPreview = {
    prepared: [...longPreview.prepared, ...shortPreview.prepared],
    skipped: [...longPreview.skipped, ...shortPreview.skipped],
    estUsedUsd: longPreview.estUsedUsd + shortPreview.estUsedUsd,
  };

  return { long: longPreview, short: shortPreview, combined };
}
