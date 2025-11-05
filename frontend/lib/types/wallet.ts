export interface Wallet {
  userId: string;
  balance: number;
  currency: string;
  reservedFunds: number;
  totalDeposited: number;
  totalInvested: number;
  totalProfitLoss: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  avgTradeSize: number;
  largestWin: number;
  largestLoss: number;
  status: 'active' | 'frozen' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  userId: string;
  portfolioId?: string;
  type: 'buy' | 'sell' | 'deposit' | 'withdrawal';
  ticker?: string;
  quantity?: number;
  price?: number;
  subtotal?: number;
  commission: number;
  fees: number;
  total: number;
  balanceBefore: number;
  balanceAfter: number;
  status: 'completed' | 'pending' | 'failed';
  executionType: 'market' | 'limit' | 'stop';
  orderSource: 'manual' | 'strategy' | 'paper' | 'backtest';
  costBasis?: number;
  realizedProfitLoss?: number;
  notes?: string;
  errorMessage?: string;
  createdAt: string;
}

export interface Holding {
  ticker: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  marketValue: number;
  profitLoss: number;
  profitLossPercent: number;
  totalInvested: number;
}

export interface BuyStockRequest {
  userId: string;
  ticker: string;
  quantity: number;
  portfolioId?: string;
}

export interface SellStockRequest {
  userId: string;
  ticker: string;
  quantity: number;
  portfolioId?: string;
}

export interface DepositFundsRequest {
  userId: string;
  amount: number;
  notes?: string;
}

export interface TradeResponse {
  success: boolean;
  message: string;
  transaction: Transaction;
  wallet: Wallet;
}

export interface WalletSummary {
  balance: number;
  totalHoldingsValue: number;
  totalPortfolioValue: number;
  totalInvested: number;
  totalProfitLoss: number;
  profitLossPercent: number;
  totalTrades: number;
  winRate: number;
  holdings: Holding[];
}

export interface TransactionFilters {
  type?: 'buy' | 'sell' | 'deposit' | 'withdrawal';
  ticker?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  skip?: number;
}

export interface TransactionHistoryResponse {
  transactions: Transaction[];
  count: number;
  summary: {
    totalBuys: number;
    totalSells: number;
    totalBuyAmount: number;
    totalSellAmount: number;
    netTrading: number;
  };
}

