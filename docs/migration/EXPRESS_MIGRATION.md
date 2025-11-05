# Express.js Migration Documentation

## Overview

The HorizonTrader backend has been successfully migrated from a pure Node.js HTTP server to a production-ready Express.js application. This migration improves code maintainability, security, and follows industry best practices.

## Migration Date

November 5, 2025

## What Changed

### 1. Server Architecture

**Before:**
- Pure Node.js `http.createServer()`
- Manual routing with URL parsing
- Manual JSON body parsing
- Manual error handling
- Manual CORS implementation

**After:**
- Express.js application with modular routers
- Express Router for clean route definitions
- Built-in `express.json()` middleware
- Centralized error handling middleware
- CORS middleware with configuration

### 2. New File Structure

```
src/
├── app.js                          # NEW: Express app with middleware
├── api/
│   ├── server.js                   # MODIFIED: Now uses Express app
│   ├── routes.js                   # KEPT: Business logic handlers
│   ├── routes/                     # NEW: Modular Express routers
│   │   ├── index.js               # Main router aggregator
│   │   ├── portfolio.routes.js   # Portfolio endpoints
│   │   ├── user.routes.js         # User & auth endpoints
│   │   ├── stock.routes.js        # Stock endpoints
│   │   ├── backtest.routes.js     # Backtest endpoints
│   │   ├── papertrading.routes.js # Paper trading endpoints
│   │   └── coupledtrade.routes.js # Coupled trade endpoints
│   └── middleware/                 # NEW: Custom middleware
│       ├── auth.middleware.js      # JWT authentication
│       ├── error.middleware.js     # Error handling
│       └── validation.middleware.js # Request validation
```

### 3. Middleware Stack

The Express app includes the following middleware (in order):

1. **Helmet** - Security headers
2. **Morgan** - HTTP request logging
3. **CORS** - Cross-origin resource sharing
4. **express.json()** - JSON body parsing
5. **express.urlencoded()** - URL-encoded body parsing
6. **Compression** - Gzip compression
7. **Rate Limiting** - Request rate limiting
8. **Custom Middleware** - Authentication, validation, error handling

### 4. New Dependencies

Added to `package.json`:
```json
{
  "express": "^4.18.2",
  "helmet": "^7.1.0",
  "morgan": "^1.10.0",
  "cors": "^2.8.5",
  "compression": "^1.7.4",
  "express-rate-limit": "^7.1.5",
  "express-validator": "^7.0.1"
}
```

### 5. Configuration Changes

**config/config.js** - Added Express-specific configuration:
```javascript
express: {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    maxRequests: 100,
    authWindowMs: 15 * 60 * 1000,
    authMaxRequests: 5
  },
  logging: {
    level: 'info',
    format: process.env.NODE_ENV === 'production' ? 'combined' : 'dev'
  },
  bodyLimit: '10mb'
}
```

**.env** - Added new environment variables:
```
NODE_ENV=development
PORT=3000
CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

## API Endpoints (Unchanged)

All API endpoints remain the same:

### Portfolio Management
- `POST /portfolio/initialize`
- `GET /portfolio/:id/signals`
- `GET /portfolio/:id/strategy`
- `GET /portfolio/:id/performance`

### User & Authentication
- `POST /user`
- `POST /auth/login`
- `POST /auth/verify`
- `GET /user/:userId/portfolios`

### Stocks
- `POST /stocks/search`
- `GET /stocks/popular`
- `GET /stocks/available`

### Advanced Features
- `POST /backtest`
- `GET /portfolio/:id/paper-trading`
- `POST /coupled-trade`

### System
- `GET /health`
- `GET /api`

## Breaking Changes

### None for API consumers

All API endpoints maintain backward compatibility. The migration is transparent to frontend clients.

### For developers

1. **Imports**: Route handlers now use Express `req`, `res`, `next` pattern
2. **Error Handling**: Errors should be passed to `next(error)` instead of manual response
3. **Validation**: Request validation now uses express-validator middleware
4. **Authentication**: JWT verification now uses middleware instead of manual checking

## Benefits of Migration

### 1. **Cleaner Code**
- Modular router structure
- Separation of concerns
- Easier to maintain and extend

### 2. **Better Security**
- Helmet middleware for security headers
- Input validation with express-validator
- Rate limiting built-in
- CORS configuration

### 3. **Improved Logging**
- Morgan for HTTP request logging
- Environment-based log formats
- Better debugging capabilities

### 4. **Error Handling**
- Centralized error middleware
- Consistent error responses
- Development vs production error details

### 5. **Performance**
- Gzip compression for responses
- Efficient routing
- Better request parsing

### 6. **Developer Experience**
- Industry-standard framework
- Extensive ecosystem
- Better documentation
- Easier testing with supertest

### 7. **Scalability**
- Modular architecture
- Easy to add new routes
- Middleware composition
- Better for team development

## Testing

### Unit Tests
- All existing unit tests pass (73 specs)
- Models and services unchanged
- Test location: `spec/unit/`

### Integration Tests
- New integration tests using supertest
- Test all API endpoints
- Test location: `spec/integration/`
- Run with: `npm run test:integration`

### Running All Tests
```bash
npm test
```

## Monitoring

### Health Check
```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-05T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

### API Information
```bash
curl http://localhost:3000/api
```

## Rate Limiting

### Global Rate Limit
- **Window**: 15 minutes
- **Max Requests**: 100 per IP
- **Applies to**: All `/api/*`, `/portfolio/*`, `/user/*`, `/stocks/*` routes
- **Excludes**: `/health`, `/api` info endpoint

### Authentication Rate Limit
- **Window**: 15 minutes
- **Max Requests**: 5 per IP
- **Applies to**: `/auth/login`
- **Purpose**: Prevent brute force attacks

### Rate Limit Headers
```
RateLimit-Limit: 100
RateLimit-Remaining: 99
RateLimit-Reset: 1730764800
```

## Error Responses

All errors follow consistent format:

### Validation Error (400)
```json
{
  "error": "Validation Error",
  "message": "Invalid request data",
  "errors": [
    {
      "field": "userId",
      "message": "User ID is required",
      "value": ""
    }
  ]
}
```

### Authentication Error (401)
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### Not Found (404)
```json
{
  "error": "Route not found",
  "path": "/invalid/path",
  "method": "GET",
  "message": "The endpoint GET /invalid/path does not exist"
}
```

### Server Error (500)
```json
{
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
```

## Migration Checklist

- [x] Install Express and middleware packages
- [x] Create Express app with middleware configuration
- [x] Create authentication middleware
- [x] Create error handling middleware
- [x] Create validation middleware
- [x] Create modular routers for all endpoints
- [x] Update server.js to use Express
- [x] Update configuration for Express
- [x] Create integration tests
- [x] Verify unit tests still pass
- [x] Update documentation
- [x] Test all endpoints
- [x] Verify rate limiting works
- [x] Verify error handling works
- [x] Verify logging works

## Future Enhancements

1. **API Versioning**: Add `/api/v1/` prefix for versioned endpoints
2. **GraphQL**: Consider GraphQL API alongside REST
3. **WebSockets**: Real-time updates for paper trading
4. **API Documentation**: Add Swagger/OpenAPI documentation
5. **Monitoring**: Add APM (e.g., New Relic, Datadog)
6. **Caching**: Add Redis for response caching
7. **Queue System**: Add Bull/BullMQ for background jobs
8. **Microservices**: Consider splitting into microservices

## Support

For questions or issues related to the Express migration:
1. Check this documentation
2. Review `src/app.js` for middleware configuration
3. Check individual route files in `src/api/routes/`
4. Run tests: `npm test`
5. Check server logs

## Rollback Plan

If rollback is needed:
1. Revert to commit before migration
2. Run `npm install` to restore old dependencies
3. Restart server

Note: The old pure Node.js server code is preserved in git history.

