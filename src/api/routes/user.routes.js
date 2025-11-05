/**
 * User & Authentication Routes
 * Express router for user management and authentication
 */

const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/error.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const {
  validateUserCreation,
  validateUserLogin,
  validateTokenVerification,
  validateUserId
} = require('../middleware/validation.middleware');

// Import route handlers from the old routes.js
const {
  createUser,
  loginUser,
  verifyAuth,
  getUserPortfolios
} = require('../routes');

/**
 * POST /user
 * Create a new user
 * Body: { userId: string, name: string, email?: string, password?: string }
 */
router.post(
  '/',
  validateUserCreation,
  asyncHandler(async (req, res) => {
    const result = await createUser(req.body);
    res.status(201).json(result);
  })
);

/**
 * GET /user/:userId/portfolios
 * Get all portfolios for a user
 */
router.get(
  '/:userId/portfolios',
  validateUserId,
  asyncHandler(async (req, res) => {
    const result = await getUserPortfolios(req.params.userId);
    res.json(result);
  })
);

/**
 * POST /login (when mounted at /auth)
 * User login
 * Body: { userId: string, password: string }
 * Apply stricter rate limiting for login attempts
 */
router.post(
  '/login',
  (req, res, next) => {
    // Apply auth rate limiter if available
    if (req.app.locals.authLimiter) {
      return req.app.locals.authLimiter(req, res, next);
    }
    next();
  },
  validateUserLogin,
  asyncHandler(async (req, res) => {
    const result = await loginUser(req.body);
    res.json(result);
  })
);

/**
 * POST /verify (when mounted at /auth)
 * Verify JWT token
 * Body: { token: string }
 */
router.post(
  '/verify',
  validateTokenVerification,
  asyncHandler(async (req, res) => {
    const result = await verifyAuth(req.body);
    res.json(result);
  })
);

module.exports = router;

