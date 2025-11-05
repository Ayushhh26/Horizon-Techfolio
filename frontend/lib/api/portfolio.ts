import { get, post } from './client';
import type {
  Portfolio,
  CreatePortfolioRequest,
  CreatePortfolioResponse,
  PortfolioListResponse,
  PortfolioSignalsResponse,
  PortfolioStrategyResponse,
  PortfolioPerformanceResponse
} from '../types/portfolio';

/**
 * Get all portfolios for a user
 */
export const getPortfolios = async (userId: string): Promise<PortfolioListResponse> => {
  const response = await get<PortfolioListResponse>(`/user/${userId}/portfolios`);
  return response;
};

/**
 * Create a new portfolio
 */
export const createPortfolio = async (data: CreatePortfolioRequest): Promise<CreatePortfolioResponse> => {
  const response = await post<CreatePortfolioResponse>('/portfolio/initialize', data);
  return response;
};

/**
 * Get trading signals for a portfolio
 */
export const getPortfolioSignals = async (portfolioId: string): Promise<PortfolioSignalsResponse> => {
  const response = await get<PortfolioSignalsResponse>(`/portfolio/${portfolioId}/signals`);
  return response;
};

/**
 * Get recommended strategy for a portfolio
 */
export const getPortfolioStrategy = async (portfolioId: string): Promise<PortfolioStrategyResponse> => {
  const response = await get<PortfolioStrategyResponse>(`/portfolio/${portfolioId}/strategy`);
  return response;
};

/**
 * Get performance metrics for a portfolio
 */
export const getPortfolioPerformance = async (portfolioId: string): Promise<PortfolioPerformanceResponse> => {
  const response = await get<PortfolioPerformanceResponse>(`/portfolio/${portfolioId}/performance`);
  return response;
};

