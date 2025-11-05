/**
 * Paper Trading Routes
 * Express router for paper trading endpoints
 */

const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/error.middleware');
const { validatePortfolioId } = require('../middleware/validation.middleware');

// Import route handlers from the old routes.js
const { getPaperTradingStatus } = require('../routes');

/**
 * GET /portfolio/:id/paper-trading
 * Get paper trading status for a portfolio
 */
router.get(
  '/:id/paper-trading',
  validatePortfolioId,
  asyncHandler(async (req, res) => {
    const result = await getPaperTradingStatus(req.params.id);
    res.json(result);
  })
);

module.exports = router;

