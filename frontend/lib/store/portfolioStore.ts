import { create } from 'zustand';
import * as portfolioApi from '../api/portfolio';
import type { 
  Portfolio, 
  CreatePortfolioRequest,
  Signal,
  Strategy,
  PerformanceMetrics
} from '../types/portfolio';

interface PortfolioState {
  portfolios: Portfolio[];
  selectedPortfolio: Portfolio | null;
  signals: Signal[];
  strategy: Strategy | null;
  performance: PerformanceMetrics | null;
  isLoading: boolean;
  error: string | null;
}

interface PortfolioActions {
  fetchPortfolios: (userId: string) => Promise<void>;
  createPortfolio: (data: CreatePortfolioRequest) => Promise<string>;
  selectPortfolio: (portfolio: Portfolio) => void;
  fetchPortfolioSignals: (portfolioId: string) => Promise<void>;
  fetchPortfolioStrategy: (portfolioId: string) => Promise<void>;
  fetchPortfolioPerformance: (portfolioId: string) => Promise<void>;
  clearError: () => void;
}

type PortfolioStore = PortfolioState & PortfolioActions;

export const usePortfolioStore = create<PortfolioStore>((set) => ({
  // Initial state
  portfolios: [],
  selectedPortfolio: null,
  signals: [],
  strategy: null,
  performance: null,
  isLoading: false,
  error: null,

  // Fetch all portfolios for a user
  fetchPortfolios: async (userId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await portfolioApi.getPortfolios(userId);
      set({
        portfolios: response.portfolios,
        isLoading: false
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch portfolios';
      set({ 
        isLoading: false, 
        error: errorMessage 
      });
      throw error;
    }
  },

  // Create a new portfolio
  createPortfolio: async (data: CreatePortfolioRequest) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await portfolioApi.createPortfolio(data);
      
      // Add new portfolio to the list
      set((state) => ({
        portfolios: [...state.portfolios, response.portfolio],
        isLoading: false
      }));
      
      return response.portfolioId;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create portfolio';
      set({ 
        isLoading: false, 
        error: errorMessage 
      });
      throw error;
    }
  },

  // Select a portfolio
  selectPortfolio: (portfolio: Portfolio) => {
    set({ selectedPortfolio: portfolio });
  },

  // Fetch signals for a portfolio
  fetchPortfolioSignals: async (portfolioId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await portfolioApi.getPortfolioSignals(portfolioId);
      set({
        signals: response.signals,
        isLoading: false
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch signals';
      set({ 
        isLoading: false, 
        error: errorMessage 
      });
      throw error;
    }
  },

  // Fetch strategy for a portfolio
  fetchPortfolioStrategy: async (portfolioId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await portfolioApi.getPortfolioStrategy(portfolioId);
      set({
        strategy: response.strategy,
        isLoading: false
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch strategy';
      set({ 
        isLoading: false, 
        error: errorMessage 
      });
      throw error;
    }
  },

  // Fetch performance for a portfolio
  fetchPortfolioPerformance: async (portfolioId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await portfolioApi.getPortfolioPerformance(portfolioId);
      set({
        performance: response.metrics,
        isLoading: false
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch performance';
      set({ 
        isLoading: false, 
        error: errorMessage 
      });
      throw error;
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  }
}));

