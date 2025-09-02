import { config } from '@/lib/config';
import { BuilderOrder, BasketTradeResult, PreparedOrder } from './types';
import { generateCloid } from './math';

/**
 * Клиент для работы с Hyperliquid Builder Codes
 */
export class BuilderClient {
  private builderAddress: string;
  private feeBps: number;
  private defaultSlippageBps: number;

  constructor() {
    this.builderAddress = config.builder.address;
    this.feeBps = config.builder.feeBps;
    this.defaultSlippageBps = config.builder.defaultSlippageBps;
  }

  /**
   * Проверяет, настроен ли Builder Address
   */
  isConfigured(): boolean {
    return this.builderAddress !== "0x0000000000000000000000000000000000000000";
  }

  /**
   * Получает информацию о Builder
   */
  getBuilderInfo(): { address: string; feeBps: number; defaultSlippageBps: number } {
    return {
      address: this.builderAddress,
      feeBps: this.feeBps,
      defaultSlippageBps: this.defaultSlippageBps,
    };
  }

  /**
   * Подготавливает ордера для корзины
   */
  prepareBasketOrders(
    orders: PreparedOrder[],
    slippageBps?: number
  ): BuilderOrder[] {
    // slippageBps используется для будущей логики
    return orders.map(order => ({
      symbol: order.symbol,
      side: order.side,
      sz: order.sz.toString(),
      type: order.type,
      px: order.px?.toString(),
      reduceOnly: false,
      cloid: generateCloid(),
    }));
  }

  /**
   * Отправляет корзину ордеров через Builder Codes
   */
  async placeBasketOrders(
    orders: BuilderOrder[],
    userAddress: string,
    signature?: string
  ): Promise<BasketTradeResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        orders: [],
        totalUsd: 0,
        estimatedFees: 0,
        error: 'Builder address not configured',
      };
    }

    try {
      // Здесь будет интеграция с Builder Codes API
      // Пока возвращаем заглушку
      console.log('Placing basket orders:', {
        orders,
        userAddress,
        builderAddress: this.builderAddress,
        signature,
      });

      // Имитация успешного размещения
      return {
        success: true,
        orders: orders.map(o => ({
          symbol: o.symbol,
          side: o.side,
          sz: parseFloat(o.sz),
          type: o.type,
          px: o.px ? parseFloat(o.px) : undefined,
        })),
        totalUsd: 0, // Будет рассчитано на основе ордеров
        estimatedFees: 0, // Будет рассчитано на основе суммы
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
   * Получает статус ордера
   */
  async getOrderStatus(cloid: string): Promise<{ status: string; cloid: string }> {
    // Здесь будет API для проверки статуса
    return { status: 'pending', cloid };
  }

  /**
   * Отменяет ордер
   */
  async cancelOrder(cloid: string): Promise<boolean> {
    // Здесь будет API для отмены
    console.log('Cancelling order:', cloid);
    return true;
  }
}

// Экспортируем singleton instance
export const builderClient = new BuilderClient();
