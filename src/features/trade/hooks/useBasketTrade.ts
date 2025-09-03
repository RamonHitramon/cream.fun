'use client';

import { useState, useCallback, useMemo } from 'react';
import { BasketInput, BasketPreview, PreparedOrder } from '../builder/types';
import { PerpMeta } from '../hl/types';
import { HyperliquidAsset } from '@/lib/hyperliquid/types';
import { convertToPerpMeta, prepareBasketPreview } from '../builder/placeBasket';

export interface BasketTradeState {
  preview: BasketPreview | null;
  canSubmit: boolean;
  isSubmitting: boolean;
  error: string | null;
}

export interface BasketTradeActions {
  preview: () => void;
  submit: () => Promise<BasketTradeResult>;
  reset: () => void;
}

export interface BasketTradeResult {
  success: boolean;
  orders: PreparedOrder[];
  totalUsd: number;
  estimatedFees: number;
  error?: string;
}

export function useBasketTrade(markets: HyperliquidAsset[] = []) {
  const [state, setState] = useState<BasketTradeState>({
    preview: null,
    canSubmit: false,
    isSubmitting: false,
    error: null,
  });

  // Конвертируем markets в PerpMeta для совместимости
  const metas = useMemo(() => convertToPerpMeta(markets), [markets]);

  const preview = useCallback(() => {
    try {
      // Здесь нужно получить input из формы
      // Пока что создаем mock input для демонстрации
      const mockInput: BasketInput = {
        orderType: 'market',
        side: 'BUY',
        totalUsd: 1000,
        symbols: ['BTC', 'ETH'],
        leverage: 2,
        slippageBps: 50,
      };

      const preview = prepareBasketPreview(mockInput, metas);
      
      setState(prev => ({
        ...prev,
        preview,
        canSubmit: preview.prepared.length > 0,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Preview failed',
        canSubmit: false,
      }));
    }
  }, [metas]);

  const submit = useCallback(async (): Promise<BasketTradeResult> => {
    if (!state.preview || state.preview.prepared.length === 0) {
      return {
        success: false,
        orders: [],
        totalUsd: 0,
        estimatedFees: 0,
        error: 'No orders to submit',
      };
    }

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      // Здесь будет реальная логика отправки через Builder Codes
      // Пока что возвращаем mock результат
      await new Promise(resolve => setTimeout(resolve, 1000)); // Имитируем задержку

      const result: BasketTradeResult = {
        success: true,
        orders: state.preview.prepared,
        totalUsd: state.preview.estUsedUsd,
        estimatedFees: 0,
      };

      setState(prev => ({ ...prev, isSubmitting: false }));
      return result;
    } catch (error) {
      const result: BasketTradeResult = {
        success: false,
        orders: [],
        totalUsd: 0,
        estimatedFees: 0,
        error: error instanceof Error ? error.message : 'Submission failed',
      };

      setState(prev => ({ 
        ...prev, 
        isSubmitting: false,
        error: result.error || 'Submission failed',
      }));
      
      return result;
    }
  }, [state.preview]);

  const reset = useCallback(() => {
    setState({
      preview: null,
      canSubmit: false,
      isSubmitting: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    preview,
    submit,
    reset,
  };
}
