import { get, post } from './client';
import type {
  StockSearchRequest,
  AvailableStocksResponse
} from '../types/portfolio';

export interface WatchlistStock {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  date: string;
  previousClose: number;
}

export interface WatchlistResponse {
  watchlist: WatchlistStock[];
  count: number;
  lastUpdated: string | null;
  marketStatus: 'open' | 'closed' | 'weekend';
}

export interface StockDetails {
  ticker: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  previousClose: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  high52w: number;
  low52w: number;
  date: string;
  lastUpdated: string;
  historicalData: Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
  totalDataPoints: number;
}

/**
 * Get all available stocks from database
 */
export const getAvailableStocks = async (): Promise<AvailableStocksResponse> => {
  const response = await get<AvailableStocksResponse>('/stocks/available');
  return response;
};

/**
 * Search for stocks by ticker
 */
export const searchStocks = async (tickers: string[]): Promise<any> => {
  const response = await post<any>('/stocks/search', { tickers });
  return response;
};

/**
 * Get popular/recommended stocks
 */
export const getPopularStocks = async (): Promise<any> => {
  const response = await get<any>('/stocks/popular');
  return response;
};

/**
 * Get watchlist with current prices and daily changes
 */
export const getWatchlist = async (): Promise<WatchlistResponse> => {
  const response = await get<WatchlistResponse>('/stocks/watchlist');
  return response;
};

/**
 * Get detailed stock information
 */
export const getStockDetails = async (ticker: string): Promise<StockDetails> => {
  const response = await get<StockDetails>(`/stocks/${ticker}`);
  return response;
};

