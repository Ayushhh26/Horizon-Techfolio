/**
 * Backtest Routes
 * Express router for backtesting endpoints
 */

const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/error.middleware');
const { validateBacktest } = require('../middleware/validation.middleware');

// Import route handlers from the old routes.js
const { runBacktest } = require('../routes');

/**
 * POST /backtest
 * Run a historical backtest
 * Body: { portfolioId: string, startDate?: string, endDate?: string }
 */
router.post(
  '/',
  validateBacktest,
  asyncHandler(async (req, res) => {
    const result = await runBacktest(req.body);
    res.json(result);
  })
);

module.exports = router;

