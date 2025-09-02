'use client';

import { useState, useCallback, useMemo } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { BasketInput, BasketPreview, BasketTradeResult } from '../builder/types';
import { PerpMarket } from '@/lib/hyperliquid/types';
import { 
  placeBasket, 
  placePairBasket, 
  prepareBasketPreview, 
  preparePairBasketPreview,
  convertToPerpMeta,
  PlaceBasketOptions 
} from '../builder/placeBasket';
import { builderClient, WalletLike } from '../builder/client';

export interface BasketTradeState {
  preview: BasketPreview | null;
  canSubmit: boolean;
  isSubmitting: boolean;
  lastResult: BasketTradeResult | null;
  error: string | null;
  warnings: string[];
}

export function useBasketTrade(markets: PerpMarket[] = []) {
  const { address, isConnected } = useWallet();
  const [state, setState] = useState<BasketTradeState>({
    preview: null,
    canSubmit: false,
    isSubmitting: false,
    lastResult: null,
    error: null,
    warnings: [],
  });

  // Конвертируем markets в PerpMeta для использования в функциях
  const metas = useMemo(() => convertToPerpMeta(markets), [markets]);

  /**
   * Создает preview для корзины
   */
  const preview = useCallback(async (
    input: BasketInput
  ): Promise<BasketPreview | null> => {
    if (!isConnected || !address) {
      const error = 'Wallet not connected';
      setState(prev => ({ ...prev, error, canSubmit: false }));
      return null;
    }

    try {
      const previewResult = prepareBasketPreview(input, metas);
      
      // Определяем, можно ли отправлять
      const canSubmit = previewResult.prepared.length > 0;
      
      // Собираем предупреждения из пропущенных пар
      const warnings = previewResult.skipped.map(s => `${s.symbol}: ${s.reason}`);
      
      setState(prev => ({
        ...prev,
        preview: previewResult,
        canSubmit,
        error: null,
        warnings,
      }));

      return previewResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setState(prev => ({ ...prev, error: errorMessage, canSubmit: false }));
      return null;
    }
  }, [isConnected, address, metas]);

  /**
   * Создает preview для двухсторонней торговли
   */
  const previewPairBasket = useCallback(async (
    longInput: Omit<BasketInput, 'side'>,
    shortInput: Omit<BasketInput, 'side'>
  ): Promise<{ long: BasketPreview; short: BasketPreview; combined: BasketPreview } | null> => {
    if (!isConnected || !address) {
      const error = 'Wallet not connected';
      setState(prev => ({ ...prev, error, canSubmit: false }));
      return null;
    }

    try {
      const previewResult = preparePairBasketPreview(longInput, shortInput, metas);
      
      // Определяем, можно ли отправлять
      const canSubmit = previewResult.combined.prepared.length > 0;
      
      // Собираем предупреждения из пропущенных пар
      const warnings = previewResult.combined.skipped.map(s => `${s.symbol}: ${s.reason}`);
      
      setState(prev => ({
        ...prev,
        preview: previewResult.combined,
        canSubmit,
        error: null,
        warnings,
      }));

      return previewResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setState(prev => ({ ...prev, error: errorMessage, canSubmit: false }));
      return null;
    }
  }, [isConnected, address, metas]);

  /**
   * Размещает корзину ордеров
   */
  const submit = useCallback(async (
    input: BasketInput,
    options?: Partial<PlaceBasketOptions>
  ): Promise<BasketTradeResult | null> => {
    if (!isConnected || !address) {
      const error = 'Wallet not connected';
      setState(prev => ({ ...prev, error, canSubmit: false }));
      return null;
    }

    setState(prev => ({ ...prev, isSubmitting: true, error: null }));

    try {
      const wallet: WalletLike = { address };
      const submitOptions: PlaceBasketOptions = {
        wallet,
        retryAttempts: 3,
        ...options,
      };

      const result = await placeBasket(input, metas, submitOptions);
      
      setState(prev => ({
        ...prev,
        lastResult: result,
        isSubmitting: false,
        error: result.success ? null : (result.error || 'Failed to place orders'),
      }));

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setState(prev => ({ 
        ...prev, 
        isSubmitting: false, 
        error: errorMessage 
      }));
      
      return {
        success: false,
        orders: [],
        totalUsd: 0,
        estimatedFees: 0,
        error: errorMessage,
      };
    }
  }, [isConnected, address, metas]);

  /**
   * Размещает корзину с раздельными лонг/шорт позициями
   */
  const submitPairBasket = useCallback(async (
    longInput: Omit<BasketInput, 'side'>,
    shortInput: Omit<BasketInput, 'side'>,
    options?: Partial<PlaceBasketOptions>
  ): Promise<BasketTradeResult[]> => {
    if (!isConnected || !address) {
      const error = 'Wallet not connected';
      setState(prev => ({ ...prev, error, canSubmit: false }));
      return [];
    }

    setState(prev => ({ ...prev, isSubmitting: true, error: null }));

    try {
      const wallet: WalletLike = { address };
      const submitOptions: PlaceBasketOptions = {
        wallet,
        retryAttempts: 3,
        ...options,
      };

      const results = await placePairBasket(longInput, shortInput, metas, submitOptions);
      
      // Проверяем успешность
      const hasErrors = results.some(r => !r.success);
      let errorMessages = '';
      if (hasErrors) {
        errorMessages = results
          .filter(r => !r.success)
          .map(r => r.error)
          .filter(Boolean)
          .join(', ');
        setState(prev => ({ ...prev, error: errorMessages }));
      }
      
      // Устанавливаем последний результат как комбинацию
      const combinedResult: BasketTradeResult = {
        success: results.every(r => r.success),
        orders: results.flatMap(r => r.orders),
        totalUsd: results.reduce((sum, r) => sum + r.totalUsd, 0),
        estimatedFees: results.reduce((sum, r) => sum + r.estimatedFees, 0),
        error: hasErrors ? errorMessages : undefined,
      };
      
      setState(prev => ({
        ...prev,
        lastResult: combinedResult,
        isSubmitting: false,
        error: hasErrors ? errorMessages : null,
      }));

      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setState(prev => ({ 
        ...prev, 
        isSubmitting: false, 
        error: errorMessage 
      }));
      
      return [];
    }
  }, [isConnected, address, metas]);

  /**
   * Очищает ошибки и результаты
   */
  const clearResults = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
      lastResult: null,
      preview: null,
      warnings: [],
    }));
  }, []);

  /**
   * Проверяет конфигурацию Builder
   */
  const isBuilderConfigured = builderClient.isConfigured();
  const builderInfo = builderClient.getBuilderInfo();

  /**
   * Получает статистику отправок
   */
  const submissionStats = builderClient.getSubmissionStats();

  return {
    // Состояние
    ...state,
    
    // Действия
    preview,
    previewPairBasket,
    submit,
    submitPairBasket,
    clearResults,
    
    // Конфигурация
    isBuilderConfigured,
    builderInfo,
    submissionStats,
    
    // Утилиты
    isConnected,
    address,
    metas,
  };
}
