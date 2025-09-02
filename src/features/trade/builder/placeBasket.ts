import { BasketInput, PerpMeta, PreparedOrder, BasketTradeResult, Side } from './types';
import { 
  calculateProportionalAllocation, 
  calculateOrderSize, 
  validateLeverage,
  calculateBuilderFees 
} from './math';
import { builderClient } from './client';

/**
 * Подготавливает корзину ордеров на основе входных данных
 */
export function prepareBasketOrders(
  input: BasketInput,
  metas: PerpMeta[]
): BasketTradeResult {
  try {
    // Валидация входных данных
    if (input.symbols.length === 0) {
      return {
        success: false,
        orders: [],
        totalUsd: 0,
        estimatedFees: 0,
        error: 'No symbols selected',
      };
    }

    if (input.totalUsd <= 0) {
      return {
        success: false,
        orders: [],
        totalUsd: 0,
        estimatedFees: 0,
        error: 'Total USD must be positive',
      };
    }

    // Валидация плеча
    if (input.leverage) {
      for (const symbol of input.symbols) {
        const meta = metas.find(m => m.symbol === symbol);
        if (meta && !validateLeverage(input.leverage, meta)) {
          return {
            success: false,
            orders: [],
            totalUsd: 0,
            estimatedFees: 0,
            error: `Leverage ${input.leverage}x exceeds maximum for ${symbol}`,
          };
        }
      }
    }

    // Рассчитываем распределение суммы между парами
    const allocation = calculateProportionalAllocation(
      input.totalUsd,
      input.symbols,
      metas
    );

    // Подготавливаем ордера
    const orders: PreparedOrder[] = [];
    let totalUsdUsed = 0;

    for (const symbol of input.symbols) {
      const meta = metas.find(m => m.symbol === symbol);
      if (!meta) continue;

      const usdAmount = allocation[symbol];
      const orderSize = calculateOrderSize(usdAmount, meta, input.side);

      if (orderSize === null) {
        // Пропускаем пары, которые не могут быть обработаны
        console.warn(`Cannot process ${symbol}: insufficient data or too small amount`);
        continue;
      }

      orders.push({
        symbol,
        side: input.side,
        sz: orderSize,
        type: input.orderType,
        px: input.limitPxBySymbol?.[symbol],
      });

      totalUsdUsed += usdAmount;
    }

    if (orders.length === 0) {
      return {
        success: false,
        orders: [],
        totalUsd: 0,
        estimatedFees: 0,
        error: 'No valid orders could be prepared',
      };
    }

    // Рассчитываем комиссии
    const estimatedFees = calculateBuilderFees(totalUsdUsed, builderClient.getBuilderInfo().feeBps);

    return {
      success: true,
      orders,
      totalUsd: totalUsdUsed,
      estimatedFees,
    };
  } catch (error) {
    return {
      success: false,
      orders: [],
      totalUsd: 0,
      estimatedFees: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Размещает корзину ордеров через Builder Codes
 */
export async function placeBasketOrders(
  input: BasketInput,
  metas: PerpMeta[],
  userAddress: string
): Promise<BasketTradeResult> {
  // Подготавливаем ордера
  const preparation = prepareBasketOrders(input, metas);
  
  if (!preparation.success) {
    return preparation;
  }

  // Проверяем конфигурацию Builder
  if (!builderClient.isConfigured()) {
    return {
      success: false,
      orders: [],
      totalUsd: preparation.totalUsd,
      estimatedFees: preparation.estimatedFees,
      error: 'Builder Codes not configured. Please set NEXT_PUBLIC_BUILDER_ADDRESS in environment variables.',
    };
  }

  try {
    // Подготавливаем ордера для Builder
    const builderOrders = builderClient.prepareBasketOrders(
      preparation.orders,
      input.slippageBps
    );

    // Отправляем ордера
    const result = await builderClient.placeBasketOrders(
      builderOrders,
      userAddress
    );

    return {
      ...result,
      totalUsd: preparation.totalUsd,
      estimatedFees: preparation.estimatedFees,
    };
  } catch (error) {
    return {
      success: false,
      orders: [],
      totalUsd: preparation.totalUsd,
      estimatedFees: preparation.estimatedFees,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Создает корзину с раздельными лонг/шорт позициями
 */
export async function placePairBasketOrders(
  longInput: Omit<BasketInput, 'side'>,
  shortInput: Omit<BasketInput, 'side'>,
  metas: PerpMeta[],
  userAddress: string
): Promise<BasketTradeResult[]> {
  const longResult = await placeBasketOrders(
    { ...longInput, side: 'BUY' as Side },
    metas,
    userAddress
  );

  const shortResult = await placeBasketOrders(
    { ...shortInput, side: 'SELL' as Side },
    metas,
    userAddress
  );

  return [longResult, shortResult];
}
