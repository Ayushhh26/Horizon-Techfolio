/**
 * WalletModel.js
 * Mongoose model for user wallets - manages cash balance and trading account
 */

const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  balance: {
    type: Number,
    required: true,
    default: 10000, // Default starting balance: $10,000
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD']
  },
  // Track reserved funds (for pending orders in future)
  reservedFunds: {
    type: Number,
    default: 0,
    min: 0
  },
  // Total amount deposited (for tracking)
  totalDeposited: {
    type: Number,
    default: 10000,
    min: 0
  },
  // Performance metrics
  totalInvested: {
    type: Number,
    default: 0,
    min: 0
  },
  totalWithdrawn: {
    type: Number,
    default: 0,
    min: 0
  },
  totalProfitLoss: {
    type: Number,
    default: 0
  },
  // Statistics
  totalTrades: {
    type: Number,
    default: 0,
    min: 0
  },
  winningTrades: {
    type: Number,
    default: 0,
    min: 0
  },
  losingTrades: {
    type: Number,
    default: 0,
    min: 0
  },
  // Metadata
  status: {
    type: String,
    enum: ['active', 'frozen', 'closed'],
    default: 'active'
  },
  lastTransactionAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Indexes for performance
walletSchema.index({ userId: 1, status: 1 });

// Virtual for available balance (balance - reserved)
walletSchema.virtual('availableBalance').get(function() {
  return this.balance - this.reservedFunds;
});

// Virtual for total portfolio value (will be calculated separately)
walletSchema.virtual('totalValue').get(function() {
  return this.balance;
});

// Methods
walletSchema.methods.hasAvailableFunds = function(amount) {
  return this.availableBalance >= amount;
};

walletSchema.methods.deductFunds = function(amount) {
  if (!this.hasAvailableFunds(amount)) {
    throw new Error('Insufficient funds');
  }
  this.balance -= amount;
  this.lastTransactionAt = new Date();
  this.totalTrades += 1;
};

walletSchema.methods.addFunds = function(amount) {
  this.balance += amount;
  this.lastTransactionAt = new Date();
};

walletSchema.methods.reserveFunds = function(amount) {
  if (!this.hasAvailableFunds(amount)) {
    throw new Error('Insufficient available funds to reserve');
  }
  this.reservedFunds += amount;
};

walletSchema.methods.releaseFunds = function(amount) {
  this.reservedFunds = Math.max(0, this.reservedFunds - amount);
};

walletSchema.methods.updateProfitLoss = function(profitLoss, isWinning) {
  this.totalProfitLoss += profitLoss;
  if (isWinning) {
    this.winningTrades += 1;
  } else {
    this.losingTrades += 1;
  }
};

// Static methods
walletSchema.statics.createWallet = async function(userId, initialBalance = 10000) {
  const wallet = new this({
    userId,
    balance: initialBalance,
    totalDeposited: initialBalance
  });
  return await wallet.save();
};

walletSchema.statics.findByUserId = async function(userId) {
  return await this.findOne({ userId });
};

walletSchema.statics.getOrCreateWallet = async function(userId, initialBalance = 10000) {
  let wallet = await this.findByUserId(userId);
  if (!wallet) {
    wallet = await this.createWallet(userId, initialBalance);
  }
  return wallet;
};

// Ensure virtuals are included in JSON
walletSchema.set('toJSON', { virtuals: true });
walletSchema.set('toObject', { virtuals: true });

const WalletModel = mongoose.model('Wallet', walletSchema);

module.exports = WalletModel;

