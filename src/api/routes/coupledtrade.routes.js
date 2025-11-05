/**
 * Coupled Trade Routes
 * Express router for coupled trade endpoints
 */

const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/error.middleware');
const { validateCoupledTrade } = require('../middleware/validation.middleware');

// Import route handlers from the old routes.js
const { generateCoupledTrade } = require('../routes');

/**
 * POST /coupled-trade
 * Generate coupled trade recommendation
 * Body: { portfolioId: string, method?: 'pairs' | 'beta_hedging' }
 */
router.post(
  '/',
  validateCoupledTrade,
  asyncHandler(async (req, res) => {
    const result = await generateCoupledTrade(req.body);
    res.json(result);
  })
);

module.exports = router;

