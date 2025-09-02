import { config } from '@/lib/config';
import { BuilderOrder, BasketTradeResult, PreparedOrder } from './types';
import { generateCloid, generateIdempotencyKey } from './math';

export interface WalletLike {
  address: string;
  signMessage?: (message: string) => Promise<string>;
  signTypedData?: (data: unknown) => Promise<string>;
}

export interface SubmitOptions {
  builderAddress: string;
  builderFeeBps: number;
  wallet: WalletLike;
  idempotencyKey?: string;
  retryAttempts?: number;
  retryDelayMs?: number;
}

export interface SubmitResult {
  success: boolean;
  orders: BuilderOrder[];
  idempotencyKey: string;
  txHash?: string;
  error?: string;
  warnings?: string[];
}

// Ограничение параллелизма
const MAX_CONCURRENT_SUBMISSIONS = 5;
let activeSubmissions = 0;
const submissionQueue: Array<() => Promise<void>> = [];

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
    orders: PreparedOrder[]
  ): BuilderOrder[] {
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
   * Основная функция подписи и отправки ордеров
   */
  async signAndSubmit(
    orders: PreparedOrder[],
    opts: SubmitOptions
  ): Promise<SubmitResult> {
    const idempotencyKey = opts.idempotencyKey || generateIdempotencyKey();
    
    // Проверяем ограничение параллелизма
    if (activeSubmissions >= MAX_CONCURRENT_SUBMISSIONS) {
      return new Promise((resolve) => {
        submissionQueue.push(async () => {
          const result = await this._executeSubmission(orders, opts, idempotencyKey);
          resolve(result);
        });
      });
    }

    return this._executeSubmission(orders, opts, idempotencyKey);
  }

  /**
   * Внутренняя функция выполнения отправки
   */
  private async _executeSubmission(
    orders: PreparedOrder[],
    opts: SubmitOptions,
    idempotencyKey: string
  ): Promise<SubmitResult> {
    activeSubmissions++;
    
    try {
      console.log(`[BuilderClient] Starting submission ${idempotencyKey}`, {
        ordersCount: orders.length,
        builderAddress: opts.builderAddress,
        walletAddress: opts.wallet.address,
      });

      // Подготавливаем ордера для Builder
      const builderOrders = this.prepareBasketOrders(orders);

      // Здесь будет реальная интеграция с Builder Codes SDK/HTTP
      const result = await this._submitToBuilder(builderOrders, opts, idempotencyKey);

      console.log(`[BuilderClient] Submission ${idempotencyKey} completed:`, result);
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[BuilderClient] Submission ${idempotencyKey} failed:`, error);
      
      return {
        success: false,
        orders: [],
        idempotencyKey,
        error: errorMessage,
      };
    } finally {
      activeSubmissions--;
      
      // Обрабатываем очередь
      if (submissionQueue.length > 0 && activeSubmissions < MAX_CONCURRENT_SUBMISSIONS) {
        const nextSubmission = submissionQueue.shift();
        if (nextSubmission) {
          nextSubmission();
        }
      }
    }
  }

  /**
   * Отправляет ордера в Builder Codes с retry логикой
   */
  private async _submitToBuilder(
    orders: BuilderOrder[],
    opts: SubmitOptions,
    idempotencyKey: string
  ): Promise<SubmitResult> {
    const maxRetries = opts.retryAttempts || 3;
    const baseDelay = opts.retryDelayMs || 1000;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Имитация отправки в Builder Codes
        // В реальности здесь будет вызов SDK или HTTP API
        console.log(`[BuilderClient] Attempt ${attempt + 1}/${maxRetries + 1} for ${idempotencyKey}`);
        
        // Симулируем задержку сети
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
        
        // Симулируем успешную отправку
        const txHash = `0x${idempotencyKey.slice(-8)}${Math.random().toString(16).slice(2, 10)}`;
        
        return {
          success: true,
          orders,
          idempotencyKey,
          txHash,
          warnings: [],
        };
        
      } catch (error) {
        const isLastAttempt = attempt === maxRetries;
        const isNetworkError = this._isNetworkError(error);
        
        if (isLastAttempt || !isNetworkError) {
          throw error;
        }
        
        // Экспоненциальный backoff для сетевых ошибок
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`[BuilderClient] Network error, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error('Max retry attempts exceeded');
  }

  /**
   * Определяет, является ли ошибка сетевой
   */
  private _isNetworkError(error: unknown): boolean {
    if (!error) return false;
    
    const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    const networkErrors = [
      'network', 'timeout', 'fetch', 'connection', 'econnreset', 
      'enotfound', 'econnrefused', 'rate limit', 'too many requests'
    ];
    
    return networkErrors.some(term => errorMessage.includes(term));
  }

  /**
   * Отправляет корзину ордеров через Builder Codes (legacy метод)
   */
  async placeBasketOrders(
    orders: BuilderOrder[],
    userAddress: string
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
      // Используем новый метод signAndSubmit
      const result = await this.signAndSubmit(
        orders.map(o => ({
          symbol: o.symbol,
          side: o.side,
          sz: parseFloat(o.sz),
          type: o.type,
          px: o.px ? parseFloat(o.px) : undefined,
        })),
        {
          builderAddress: this.builderAddress,
          builderFeeBps: this.feeBps,
          wallet: { address: userAddress },
        }
      );

      if (result.success) {
        return {
          success: true,
          orders: result.orders.map(o => ({
            symbol: o.symbol,
            side: o.side,
            sz: parseFloat(o.sz),
            type: o.type,
            px: o.px ? parseFloat(o.px) : undefined,
          })),
          totalUsd: 0, // Будет рассчитано на основе ордеров
          estimatedFees: 0, // Будет рассчитано на основе суммы
        };
      } else {
        return {
          success: false,
          orders: [],
          totalUsd: 0,
          estimatedFees: 0,
          error: result.error || 'Failed to submit orders',
        };
      }
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

  /**
   * Получает статистику активных отправок
   */
  getSubmissionStats(): { active: number; queued: number; maxConcurrent: number } {
    return {
      active: activeSubmissions,
      queued: submissionQueue.length,
      maxConcurrent: MAX_CONCURRENT_SUBMISSIONS,
    };
  }
}

// Экспортируем singleton instance
export const builderClient = new BuilderClient();
