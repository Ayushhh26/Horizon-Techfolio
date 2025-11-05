/**
 * TransactionModel.js
 * Mongoose model for trading transactions - tracks all buy/sell operations
 */

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  portfolioId: {
    type: String,
    required: false,
    index: true
  },
  // Transaction details
  type: {
    type: String,
    required: true,
    enum: ['buy', 'sell', 'deposit', 'withdrawal', 'dividend', 'fee', 'commission']
  },
  ticker: {
    type: String,
    required: function() {
      return ['buy', 'sell'].includes(this.type);
    },
    uppercase: true
  },
  // Quantity and pricing
  quantity: {
    type: Number,
    required: function() {
      return ['buy', 'sell'].includes(this.type);
    },
    min: 0
  },
  price: {
    type: Number,
    required: function() {
      return ['buy', 'sell'].includes(this.type);
    },
    min: 0
  },
  // Costs
  subtotal: {
    type: Number,
    required: true
  },
  commission: {
    type: Number,
    default: 0,
    min: 0
  },
  fees: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true
  },
  // Wallet state before and after
  balanceBefore: {
    type: Number,
    required: true
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  // Transaction metadata
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'completed'
  },
  executionType: {
    type: String,
    enum: ['market', 'limit', 'stop', 'stop-limit'],
    default: 'market'
  },
  orderSource: {
    type: String,
    enum: ['manual', 'strategy', 'auto-rebalance', 'coupled-trade'],
    default: 'manual'
  },
  // For sell orders - track profit/loss
  costBasis: {
    type: Number,
    default: null
  },
  realizedProfitLoss: {
    type: Number,
    default: null
  },
  // Notes and metadata
  notes: {
    type: String,
    default: ''
  },
  errorMessage: {
    type: String,
    default: null
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Compound indexes for efficient queries
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ userId: 1, ticker: 1, type: 1 });
transactionSchema.index({ portfolioId: 1, createdAt: -1 });
transactionSchema.index({ ticker: 1, type: 1, createdAt: -1 });

// Virtual for transaction direction
transactionSchema.virtual('direction').get(function() {
  if (this.type === 'buy') return 'debit';
  if (this.type === 'sell') return 'credit';
  if (this.type === 'deposit') return 'credit';
  if (this.type === 'withdrawal') return 'debit';
  return 'neutral';
});

// Methods
transactionSchema.methods.getDisplayInfo = function() {
  return {
    id: this._id,
    date: this.createdAt,
    type: this.type,
    ticker: this.ticker,
    quantity: this.quantity,
    price: this.price,
    total: this.total,
    commission: this.commission,
    status: this.status,
    profitLoss: this.realizedProfitLoss
  };
};

// Static methods
transactionSchema.statics.createBuyTransaction = async function(data) {
  const {
    userId,
    portfolioId,
    ticker,
    quantity,
    price,
    commission = 0,
    fees = 0,
    balanceBefore,
    orderSource = 'manual',
    notes = ''
  } = data;

  const subtotal = quantity * price;
  const total = subtotal + commission + fees;
  const balanceAfter = balanceBefore - total;

  const transaction = new this({
    userId,
    portfolioId,
    type: 'buy',
    ticker,
    quantity,
    price,
    subtotal,
    commission,
    fees,
    total,
    balanceBefore,
    balanceAfter,
    status: 'completed',
    executionType: 'market',
    orderSource,
    notes
  });

  return await transaction.save();
};

transactionSchema.statics.createSellTransaction = async function(data) {
  const {
    userId,
    portfolioId,
    ticker,
    quantity,
    price,
    commission = 0,
    fees = 0,
    balanceBefore,
    costBasis = null,
    orderSource = 'manual',
    notes = ''
  } = data;

  const subtotal = quantity * price;
  const total = subtotal - commission - fees; // Deduct costs from proceeds
  const balanceAfter = balanceBefore + total;
  
  // Calculate profit/loss if cost basis provided
  let realizedProfitLoss = null;
  if (costBasis !== null) {
    const totalCost = costBasis * quantity;
    realizedProfitLoss = subtotal - totalCost - commission - fees;
  }

  const transaction = new this({
    userId,
    portfolioId,
    type: 'sell',
    ticker,
    quantity,
    price,
    subtotal,
    commission,
    fees,
    total,
    balanceBefore,
    balanceAfter,
    costBasis,
    realizedProfitLoss,
    status: 'completed',
    executionType: 'market',
    orderSource,
    notes
  });

  return await transaction.save();
};

transactionSchema.statics.createDepositTransaction = async function(userId, amount, balanceBefore, notes = '') {
  const transaction = new this({
    userId,
    type: 'deposit',
    subtotal: amount,
    total: amount,
    balanceBefore,
    balanceAfter: balanceBefore + amount,
    status: 'completed',
    notes
  });

  return await transaction.save();
};

transactionSchema.statics.getTransactionHistory = async function(userId, options = {}) {
  const {
    limit = 50,
    skip = 0,
    ticker = null,
    type = null,
    startDate = null,
    endDate = null
  } = options;

  const query = { userId };
  
  if (ticker) query.ticker = ticker;
  if (type) query.type = type;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  return await this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

transactionSchema.statics.getTransactionStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId, type: { $in: ['buy', 'sell'] } } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalAmount: { $sum: '$total' },
        totalCommissions: { $sum: '$commission' }
      }
    }
  ]);

  const result = {
    totalBuys: 0,
    totalSells: 0,
    totalBuyAmount: 0,
    totalSellAmount: 0,
    totalCommissions: 0,
    netTrades: 0
  };

  stats.forEach(stat => {
    if (stat._id === 'buy') {
      result.totalBuys = stat.count;
      result.totalBuyAmount = stat.totalAmount;
      result.totalCommissions += stat.totalCommissions;
    } else if (stat._id === 'sell') {
      result.totalSells = stat.count;
      result.totalSellAmount = stat.totalAmount;
      result.totalCommissions += stat.totalCommissions;
    }
  });

  result.netTrades = result.totalBuys + result.totalSells;

  return result;
};

// Ensure virtuals are included in JSON
transactionSchema.set('toJSON', { virtuals: true });
transactionSchema.set('toObject', { virtuals: true });

const TransactionModel = mongoose.model('Transaction', transactionSchema);

module.exports = TransactionModel;

