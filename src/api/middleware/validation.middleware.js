/**
 * Validation Middleware
 * Request validation using express-validator
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware to check validation results
 * Must be used after validation chains
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid request data',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  
  next();
};

/**
 * Validation chains for portfolio creation
 */
const validatePortfolioCreation = [
  body('tickers')
    .isArray({ min: 1, max: 20 })
    .withMessage('Tickers must be an array with 1-20 items'),
  body('tickers.*')
    .isString()
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Each ticker must be a string between 1-10 characters'),
  body('horizon')
    .isIn(['1', '2', '5', 1, 2, 5])
    .withMessage('Horizon must be 1, 2, or 5 years'),
  body('userId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('User ID is required'),
  validate
];

/**
 * Validation chains for user creation
 */
const validateUserCreation = [
  body('userId')
    .isString()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('User ID must be between 3-50 characters'),
  body('name')
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2-100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('password')
    .optional()
    .isString()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  validate
];

/**
 * Validation chains for user login
 */
const validateUserLogin = [
  body('userId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('User ID is required'),
  body('password')
    .isString()
    .notEmpty()
    .withMessage('Password is required'),
  validate
];

/**
 * Validation chains for token verification
 */
const validateTokenVerification = [
  body('token')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Token is required'),
  validate
];

/**
 * Validation chains for portfolio ID parameter
 */
const validatePortfolioId = [
  param('id')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Portfolio ID is required'),
  validate
];

/**
 * Validation chains for user ID parameter
 */
const validateUserId = [
  param('userId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('User ID is required'),
  validate
];

/**
 * Validation chains for stock search
 */
const validateStockSearch = [
  body('tickers')
    .isArray({ min: 1 })
    .withMessage('Tickers must be an array with at least 1 item'),
  body('tickers.*')
    .isString()
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Each ticker must be a string between 1-10 characters'),
  validate
];

/**
 * Validation chains for backtest
 */
const validateBacktest = [
  body('portfolioId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Portfolio ID is required'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be in ISO 8601 format (YYYY-MM-DD)'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be in ISO 8601 format (YYYY-MM-DD)'),
  validate
];

/**
 * Validation chains for coupled trade
 */
const validateCoupledTrade = [
  body('portfolioId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Portfolio ID is required'),
  body('method')
    .optional()
    .isIn(['pairs', 'beta_hedging'])
    .withMessage('Method must be either "pairs" or "beta_hedging"'),
  validate
];

module.exports = {
  validate,
  validatePortfolioCreation,
  validateUserCreation,
  validateUserLogin,
  validateTokenVerification,
  validatePortfolioId,
  validateUserId,
  validateStockSearch,
  validateBacktest,
  validateCoupledTrade
};

