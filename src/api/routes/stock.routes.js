/**
 * Stock Routes
 * Express router for stock-related endpoints
 */

const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/error.middleware');
const { validateStockSearch } = require('../middleware/validation.middleware');

// Import route handlers from the old routes.js
const {
  searchStocks,
  getPopularStocks,
  getAvailableStocks,
  getWatchlist,
  getStockDetails
} = require('../routes');

/**
 * POST /stocks/search
 * Validate stock symbols
 * Body: { tickers: string[] }
 */
router.post(
  '/search',
  validateStockSearch,
  asyncHandler(async (req, res) => {
    const result = await searchStocks(req.body);
    res.json(result);
  })
);

/**
 * GET /stocks/popular
 * Get list of popular stocks
 */
router.get(
  '/popular',
  asyncHandler(async (req, res) => {
    const result = await getPopularStocks();
    res.json(result);
  })
);

/**
 * GET /stocks/available
 * Get list of stocks available in the database
 */
router.get(
  '/available',
  asyncHandler(async (req, res) => {
    const result = await getAvailableStocks();
    res.json(result);
  })
);

/**
 * GET /stocks/watchlist
 * Get watchlist with current prices and daily changes
 */
router.get(
  '/watchlist',
  asyncHandler(async (req, res) => {
    const result = await getWatchlist();
    res.json(result);
  })
);

/**
 * GET /stocks/:ticker
 * Get detailed stock information
 */
router.get(
  '/:ticker',
  asyncHandler(async (req, res) => {
    const { ticker } = req.params;
    const result = await getStockDetails(ticker);
    res.json(result);
  })
);

module.exports = router;

