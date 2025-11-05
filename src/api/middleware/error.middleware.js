/**
 * Error Handling Middleware
 * Centralized error handling for Express
 */

/**
 * Not Found (404) Error Handler
 * Catches requests to non-existent routes
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Global Error Handler
 * Handles all errors thrown in the application
 */
const errorHandler = (err, req, res, next) => {
  // Log error in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error occurred:');
    console.error('  Message:', err.message);
    console.error('  Stack:', err.stack);
    console.error('  URL:', req.originalUrl);
    console.error('  Method:', req.method);
  }

  // Determine status code
  let statusCode = err.statusCode || err.status || 500;
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    return res.status(statusCode).json({
      error: err.message || 'Validation Error',
      type: 'ValidationError',
      details: err.errors || {},
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
  }

  if (err.name === 'UnauthorizedError' || err.message.includes('token') || err.message.includes('authentication')) {
    statusCode = 401;
    return res.status(statusCode).json({
      error: 'Invalid or expired authentication token',
      type: 'UnauthorizedError',
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    return res.status(statusCode).json({
      error: 'The provided ID format is not valid',
      type: 'CastError',
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
  }

  if (err.name === 'MongoError' && err.code === 11000) {
    statusCode = 409;
    return res.status(statusCode).json({
      error: 'A record with this value already exists',
      type: 'DuplicateEntry',
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
  }

  // Default error response
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal server error'
    : err.message || 'Something went wrong';

  // For better frontend compatibility, put the main error message in the 'error' field
  res.status(statusCode).json({
    error: message,  // The actual error message goes here
    type: err.name || 'Error',  // Error type/name for debugging
    ...(process.env.NODE_ENV !== 'production' && {
      stack: err.stack,
      url: req.originalUrl,
      method: req.method
    })
  });
};

/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors automatically
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Create custom error
 */
const createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

module.exports = {
  notFound,
  errorHandler,
  asyncHandler,
  createError
};

