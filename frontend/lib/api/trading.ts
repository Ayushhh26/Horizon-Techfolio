import { get, post } from './client';
import type {
  Wallet,
  BuyStockRequest,
  SellStockRequest,
  DepositFundsRequest,
  TradeResponse,
  WalletSummary,
  TransactionHistoryResponse,
  TransactionFilters,
  Holding
} from '../types/wallet';

/**
 * Get wallet details for a user
 */
export const getWallet = async (userId: string): Promise<Wallet> => {
  const response = await get<any>(`/wallet/${userId}`);
  // Backend returns { success: true, wallet: {...} }, extract wallet
  return response.wallet || response;
};

/**
 * Get wallet summary with holdings
 */
export const getWalletSummary = async (userId: string): Promise<WalletSummary> => {
  const response = await get<any>(`/wallet/${userId}/summary`);
  // Backend returns complex structure, restructure to match WalletSummary type
  if (response.summary) {
    return {
      balance: response.wallet?.balance || 0,
      totalInvested: response.wallet?.totalInvested || 0,
      totalProfitLoss: response.summary.totalProfitLoss || 0,
      totalTrades: response.summary.totalTrades || 0,
      holdings: response.holdings?.positions || []
    };
  }
  return response;
};

/**
 * Buy stock
 */
export const buyStock = async (data: BuyStockRequest): Promise<TradeResponse> => {
  const response = await post<any>('/wallet/buy', data);
  // Backend may wrap response, extract if needed
  return response.wallet ? { wallet: response.wallet, transaction: response.transaction } : response;
};

/**
 * Sell stock
 */
export const sellStock = async (data: SellStockRequest): Promise<TradeResponse> => {
  const response = await post<any>('/wallet/sell', data);
  // Backend may wrap response, extract if needed
  return response.wallet ? { wallet: response.wallet, transaction: response.transaction } : response;
};

/**
 * Deposit funds to wallet
 */
export const depositFunds = async (data: DepositFundsRequest): Promise<TradeResponse> => {
  const response = await post<any>('/wallet/deposit', data);
  // Backend may wrap response, extract if needed
  return response.wallet ? { wallet: response.wallet, transaction: response.transaction } : response;
};

/**
 * Get transaction history
 */
export const getTransactions = async (
  userId: string, 
  filters?: TransactionFilters
): Promise<TransactionHistoryResponse> => {
  const response = await get<any>(
    `/wallet/${userId}/transactions`,
    filters
  );
  // Backend returns { success: true, transactions: [...] }, restructure if needed
  if (response.transactions && Array.isArray(response.transactions)) {
    return {
      transactions: response.transactions,
      summary: response.summary || null
    };
  }
  return response;
};

/**
 * Get current holdings
 */
export const getHoldings = async (userId: string): Promise<Holding[]> => {
  const response = await get<any>(`/wallet/${userId}/holdings`);
  // Backend returns { success: true, holdings: [...] }, extract holdings
  return response.holdings || response;
};

