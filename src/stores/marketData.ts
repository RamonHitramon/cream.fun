import { create } from 'zustand';
import { getWSClient, TradeData, OrderBookData, OrderBookLevel } from '@/services/wsClient';

export interface MarketPrice {
  mark: string;
  last: string;
  timestamp: number;
}

export interface MarketDataState {
  // Market data
  lastTrades: Record<string, TradeData[]>;
  orderBooks: Record<string, OrderBookData>;
  marketPrices: Record<string, MarketPrice>;
  
  // Subscriptions
  subscribedAssets: Set<string>;
  
  // Loading states
  loading: {
    trades: Record<string, boolean>;
    orderBook: Record<string, boolean>;
  };
  
  // Actions
  subscribeAsset: (asset: string) => void;
  unsubscribeAsset: (asset: string) => void;
  handleTrade: (trade: TradeData) => void;
  handleOrderBook: (orderBook: OrderBookData) => void;
  updateMarketPrice: (asset: string, mark: string, last: string) => void;
  clearAssetData: (asset: string) => void;
}

export const useMarketDataStore = create<MarketDataState>((set, get) => {

  return {
    // Initial state
    lastTrades: {},
    orderBooks: {},
    marketPrices: {},
    subscribedAssets: new Set(),
    loading: {
      trades: {},
      orderBook: {}
    },

    // Actions
    subscribeAsset: (asset: string) => {
      const state = get();
      
      if (state.subscribedAssets.has(asset)) {
        return; // Already subscribed
      }

      // Add to subscriptions
      set(state => ({
        subscribedAssets: new Set([...state.subscribedAssets, asset]),
        loading: {
          ...state.loading,
          trades: { ...state.loading.trades, [asset]: true },
          orderBook: { ...state.loading.orderBook, [asset]: true }
        }
      }));

      // Subscribe to WebSocket channels
      const wsClient = getWSClient();
      wsClient.subscribeTrades(asset);
      wsClient.subscribeOrderBook(asset);

      console.log(`[MarketData] Subscribed to ${asset}`);
    },

    unsubscribeAsset: (asset: string) => {
      const state = get();
      
      if (!state.subscribedAssets.has(asset)) {
        return; // Not subscribed
      }

      // Remove from subscriptions
      const newSubscribedAssets = new Set(state.subscribedAssets);
      newSubscribedAssets.delete(asset);
      
      set({
        subscribedAssets: newSubscribedAssets
      });

      // Unsubscribe from WebSocket channels
      const wsClient = getWSClient();
      wsClient.unsubscribe(asset, 'trades');
      wsClient.unsubscribe(asset, 'l2Book');

      // Clear data for this asset
      get().clearAssetData(asset);

      console.log(`[MarketData] Unsubscribed from ${asset}`);
    },

    handleTrade: (trade: TradeData) => {
      set(state => {
        const currentTrades = state.lastTrades[trade.coin] || [];
        
        // Add new trade and keep only last 100 trades
        const newTrades = [trade, ...currentTrades].slice(0, 100);
        
        return {
          lastTrades: {
            ...state.lastTrades,
            [trade.coin]: newTrades
          },
          loading: {
            ...state.loading,
            trades: { ...state.loading.trades, [trade.coin]: false }
          }
        };
      });
    },

    handleOrderBook: (orderBook: OrderBookData) => {
      set(state => ({
        orderBooks: {
          ...state.orderBooks,
          [orderBook.coin]: orderBook
        },
        loading: {
          ...state.loading,
          orderBook: { ...state.loading.orderBook, [orderBook.coin]: false }
        }
      }));
    },

    updateMarketPrice: (asset: string, mark: string, last: string) => {
      set(state => ({
        marketPrices: {
          ...state.marketPrices,
          [asset]: {
            mark,
            last,
            timestamp: Date.now()
          }
        }
      }));
    },

    clearAssetData: (asset: string) => {
      set(state => {
        const newLastTrades = { ...state.lastTrades };
        const newOrderBooks = { ...state.orderBooks };
        const newMarketPrices = { ...state.marketPrices };
        const newLoadingTrades = { ...state.loading.trades };
        const newLoadingOrderBook = { ...state.loading.orderBook };

        delete newLastTrades[asset];
        delete newOrderBooks[asset];
        delete newMarketPrices[asset];
        delete newLoadingTrades[asset];
        delete newLoadingOrderBook[asset];

        return {
          lastTrades: newLastTrades,
          orderBooks: newOrderBooks,
          marketPrices: newMarketPrices,
          loading: {
            trades: newLoadingTrades,
            orderBook: newLoadingOrderBook
          }
        };
      });
    }
  };
});

// Selectors for better performance
export const useLastTrades = (asset: string) => 
  useMarketDataStore(state => state.lastTrades[asset] || []);

export const useOrderBook = (asset: string) => 
  useMarketDataStore(state => state.orderBooks[asset]);

export const useMarketPrice = (asset: string) => 
  useMarketDataStore(state => state.marketPrices[asset]);

export const useSubscribedAssets = () => 
  useMarketDataStore(state => Array.from(state.subscribedAssets));

export const useMarketDataLoading = (asset: string) => 
  useMarketDataStore(state => ({
    trades: state.loading.trades[asset] || false,
    orderBook: state.loading.orderBook[asset] || false
  }));

// Helper functions
export const getLastTrade = (asset: string): TradeData | null => {
  const trades = useMarketDataStore.getState().lastTrades[asset];
  return trades && trades.length > 0 ? trades[0] : null;
};

export const getTopBids = (asset: string, count: number = 10): OrderBookLevel[] => {
  const orderBook = useMarketDataStore.getState().orderBooks[asset];
  if (!orderBook || !orderBook.levels.bids) return [];
  
  return orderBook.levels.bids
    .sort((a, b) => Number(b.px) - Number(a.px))
    .slice(0, count);
};

export const getTopAsks = (asset: string, count: number = 10): OrderBookLevel[] => {
  const orderBook = useMarketDataStore.getState().orderBooks[asset];
  if (!orderBook || !orderBook.levels.asks) return [];
  
  return orderBook.levels.asks
    .sort((a, b) => Number(a.px) - Number(b.px))
    .slice(0, count);
};

export const getSpread = (asset: string): number | null => {
  const orderBook = useMarketDataStore.getState().orderBooks[asset];
  if (!orderBook || !orderBook.levels.bids || !orderBook.levels.asks || 
      orderBook.levels.bids.length === 0 || orderBook.levels.asks.length === 0) {
    return null;
  }
  
  const bestBid = Number(orderBook.levels.bids[0].px);
  const bestAsk = Number(orderBook.levels.asks[0].px);
  
  return bestAsk - bestBid;
};

export const getSpreadPercent = (asset: string): number | null => {
  const spread = getSpread(asset);
  if (spread === null) return null;

  const orderBook = useMarketDataStore.getState().orderBooks[asset];
  if (!orderBook || !orderBook.levels.bids || orderBook.levels.bids.length === 0) {
    return null;
  }

  const bestBid = Number(orderBook.levels.bids[0].px);
  return (spread / bestBid) * 100;
};
