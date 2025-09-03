import type { BasketInput, BasketPreview, PreparedOrder } from './types';
import type { PerpMetaMap } from '@/features/trade/hl/types';

export function previewBasket(input: BasketInput, metas: PerpMetaMap): BasketPreview {
  const { orderType, side, totalUsd, symbols } = input;
  const errors: string[] = [];
  const prepared: PreparedOrder[] = [];

  if (symbols.length === 0) {
    errors.push('No symbols selected');
    return { prepared, totalValue: 0, errors };
  }

  if (totalUsd <= 0) {
    errors.push('Total USD amount must be positive');
    return { prepared, totalValue: 0, errors };
  }

  // Равномерно распределяем сумму по выбранным символам
  const usdPerSymbol = totalUsd / symbols.length;

  for (const symbol of symbols) {
    const meta = metas[symbol];
    if (!meta) {
      errors.push(`No metadata for ${symbol}`);
      continue;
    }

    // Рассчитываем размер позиции в базовой валюте
    // Для простоты используем текущую цену или 1 если цена недоступна
    const price = meta.markPrice || 1;
    const sz = usdPerSymbol / price;

    // Округляем до нужного количества десятичных знаков
    const decimals = meta.szDecimals || 3;
    const roundedSz = Math.round(sz * Math.pow(10, decimals)) / Math.pow(10, decimals);

    prepared.push({
      symbol,
      side,
      sz: roundedSz,
      price: orderType === 'limit' ? price : undefined
    });
  }

  return {
    prepared,
    totalValue: totalUsd,
    errors: errors.length > 0 ? errors : undefined
  };
}
