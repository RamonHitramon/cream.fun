'use client';

import { useState, useCallback } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { BasketInput, BasketTradeResult, PerpMeta } from '../builder/types';
import { placeBasketOrders, placePairBasketOrders } from '../builder/placeBasket';
import { builderClient } from '../builder/client';

export function useBasketTrade() {
  const { address, isConnected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<BasketTradeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Размещает корзину ордеров
   */
  const placeBasket = useCallback(async (
    input: BasketInput,
    metas: PerpMeta[]
  ): Promise<BasketTradeResult> => {
    if (!isConnected || !address) {
      const result: BasketTradeResult = {
        success: false,
        orders: [],
        totalUsd: 0,
        estimatedFees: 0,
        error: 'Wallet not connected',
      };
      setLastResult(result);
      setError('Wallet not connected');
      return result;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await placeBasketOrders(input, metas, address);
      setLastResult(result);
      
      if (!result.success && result.error) {
        setError(result.error);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      
      const result: BasketTradeResult = {
        success: false,
        orders: [],
        totalUsd: 0,
        estimatedFees: 0,
        error: errorMessage,
      };
      
      setLastResult(result);
      return result;
    } finally {
      setLoading(false);
    }
  }, [isConnected, address]);

  /**
   * Размещает корзину с раздельными лонг/шорт позициями
   */
  const placePairBasket = useCallback(async (
    longInput: Omit<BasketInput, 'side'>,
    shortInput: Omit<BasketInput, 'side'>,
    metas: PerpMeta[]
  ): Promise<BasketTradeResult[]> => {
    if (!isConnected || !address) {
      const result: BasketTradeResult = {
        success: false,
        orders: [],
        totalUsd: 0,
        estimatedFees: 0,
        error: 'Wallet not connected',
      };
      setLastResult(result);
      setError('Wallet not connected');
      return [result, result];
    }

    setLoading(true);
    setError(null);

    try {
      const results = await placePairBasketOrders(longInput, shortInput, metas, address);
      
      // Проверяем успешность
      const hasErrors = results.some(r => !r.success);
      if (hasErrors) {
        const errorMessages = results
          .filter(r => !r.success)
          .map(r => r.error)
          .filter(Boolean)
          .join(', ');
        setError(errorMessages);
      }
      
      // Устанавливаем последний результат как комбинацию
      const combinedResult: BasketTradeResult = {
        success: results.every(r => r.success),
        orders: results.flatMap(r => r.orders),
        totalUsd: results.reduce((sum, r) => sum + r.totalUsd, 0),
        estimatedFees: results.reduce((sum, r) => sum + r.estimatedFees, 0),
        error: hasErrors ? (results
          .filter(r => !r.success)
          .map(r => r.error)
          .filter(Boolean)
          .join(', ')) : undefined,
      };
      
      setLastResult(combinedResult);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      
      const result: BasketTradeResult = {
        success: false,
        orders: [],
        totalUsd: 0,
        estimatedFees: 0,
        error: errorMessage,
      };
      
      setLastResult(result);
      return [result, result];
    } finally {
      setLoading(false);
    }
  }, [isConnected, address]);

  /**
   * Очищает ошибки и результаты
   */
  const clearResults = useCallback(() => {
    setError(null);
    setLastResult(null);
  }, []);

  /**
   * Проверяет конфигурацию Builder
   */
  const isBuilderConfigured = builderClient.isConfigured();
  const builderInfo = builderClient.getBuilderInfo();

  return {
    // Состояние
    loading,
    lastResult,
    error,
    
    // Действия
    placeBasket,
    placePairBasket,
    clearResults,
    
    // Конфигурация
    isBuilderConfigured,
    builderInfo,
    
    // Утилиты
    isConnected,
    address,
  };
}
