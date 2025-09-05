import { create } from 'zustand';
import { Portfolio, Position, Order } from '@/services/portfolio';

interface UserDataState {
  portfolio: Portfolio | null;
  positions: Position[];
  openOrders: Order[];
  loading: boolean;
  error: string | null;
  lastUpdate: number | null;
  
  // Actions
  setPortfolio: (portfolio: Portfolio) => void;
  setPositions: (positions: Position[]) => void;
  setOpenOrders: (orders: Order[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateLastUpdate: () => void;
  clearData: () => void;
}

export const usePortfolio = create<UserDataState>((set) => ({
  portfolio: null,
  positions: [],
  openOrders: [],
  loading: false,
  error: null,
  lastUpdate: null,

  setPortfolio: (portfolio) => set({ portfolio }),
  setPositions: (positions) => set({ positions }),
  setOpenOrders: (orders) => set({ openOrders: orders }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  updateLastUpdate: () => set({ lastUpdate: Date.now() }),
  clearData: () => set({
    portfolio: null,
    positions: [],
    openOrders: [],
    loading: false,
    error: null,
    lastUpdate: null
  })
}));

// Selectors for easier access
export const usePortfolioData = () => usePortfolio((state) => ({
  portfolio: state.portfolio,
  positions: state.positions,
  openOrders: state.openOrders,
  loading: state.loading,
  error: state.error,
  lastUpdate: state.lastUpdate
}));

export const usePortfolioActions = () => usePortfolio((state) => ({
  setPortfolio: state.setPortfolio,
  setPositions: state.setPositions,
  setOpenOrders: state.setOpenOrders,
  setLoading: state.setLoading,
  setError: state.setError,
  updateLastUpdate: state.updateLastUpdate,
  clearData: state.clearData
}));
