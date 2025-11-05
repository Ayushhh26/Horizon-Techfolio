/**
 * Express Application Setup
 * Main Express app with all middleware configuration
 */

const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const config = require('../config/config');

// Create Express app
const app = express();

// ==================== Security Middleware ====================

// Helmet - Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable for now since we serve HTML
  crossOriginEmbedderPolicy: false // Disable for API compatibility
}));

// ==================== CORS Configuration ====================

const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*', // Allow all origins in development
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// ==================== Logging Middleware ====================

// Morgan - HTTP request logging
// Use 'combined' format for production, 'dev' for development
const logFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(logFormat));

// ==================== Parsing Middleware ====================

// Body parsing middleware
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

// ==================== Compression Middleware ====================

// Compress all responses
app.use(compression());

// ==================== Rate Limiting ====================

// Global rate limiter - 100 requests per 15 minutes
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for health check
  skip: (req) => req.path === '/health' || req.path === '/api'
});

// Apply global rate limiter to all API routes
app.use('/api', globalLimiter);
app.use('/portfolio', globalLimiter);
app.use('/backtest', globalLimiter);
app.use('/user', globalLimiter);
app.use('/stocks', globalLimiter);

// Stricter rate limiter for authentication endpoints - 5 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    error: 'Too many login attempts from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Don't count successful requests
});

// Store auth limiter for use in routes
app.locals.authLimiter = authLimiter;

// ==================== Request Logging (Custom) ====================

// Log all incoming requests in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// ==================== Health Check (No Rate Limit) ====================

// Health check endpoint - always available
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'HorizonTrader API',
    version: '1.0.0',
    description: 'Technical Analysis Portfolio Management System',
    endpoints: {
      portfolio: [
        'POST /portfolio/initialize',
        'GET /portfolio/:id/signals',
        'GET /portfolio/:id/strategy',
        'GET /portfolio/:id/performance'
      ],
      user: [
        'POST /user',
        'POST /auth/login',
        'POST /auth/verify',
        'GET /user/:userId/portfolios'
      ],
      stocks: [
        'POST /stocks/search',
        'GET /stocks/popular',
        'GET /stocks/available'
      ],
      advanced: [
        'POST /backtest',
        'GET /portfolio/:id/paper-trading',
        'POST /coupled-trade'
      ],
      system: [
        'GET /health',
        'GET /api'
      ]
    },
    documentation: 'See README.md for detailed API documentation'
  });
});

// ==================== Routes Will Be Mounted Here ====================
// Routes will be imported and mounted in server.js after database connection
// Note: 404 and error handlers are also added in server.js AFTER routes

module.exports = app;

