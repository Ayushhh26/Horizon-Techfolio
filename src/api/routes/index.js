/**
 * Main Router
 * Aggregates all route modules
 */

const express = require('express');
const router = express.Router();

// Import individual route modules
const portfolioRoutes = require('./portfolio.routes');
const userRoutes = require('./user.routes');
const stockRoutes = require('./stock.routes');
const walletRoutes = require('./wallet.routes');
const backtestRoutes = require('./backtest.routes');
const papertradingRoutes = require('./papertrading.routes');
const coupledtradeRoutes = require('./coupledtrade.routes');

// Mount routes without prefixes (they're already defined in the individual route files)
// Portfolio routes: /portfolio/*
router.use('/portfolio', portfolioRoutes);

// User routes: /user/* and /auth/*
router.use('/user', userRoutes);
router.use('/auth', userRoutes);

// Stock routes: /stocks/*
router.use('/stocks', stockRoutes);

// Wallet routes: /wallet/*
router.use('/wallet', walletRoutes);

// Backtest routes: /backtest/*
router.use('/backtest', backtestRoutes);

// Paper trading routes: /paper-trading/*
// Note: The paper trading route is /portfolio/:id/paper-trading, not /paper-trading/:id
// So we need to mount it differently
router.use('/portfolio', papertradingRoutes);

// Coupled trade routes: /coupled-trade/*
router.use('/coupled-trade', coupledtradeRoutes);

module.exports = router;

