# Trading System Documentation

## Overview

The HorizonTrader trading system enables users to buy and sell stocks using dummy money with realistic trading mechanics including wallet management, transaction tracking, and portfolio integration.

## Features

### 1. Wallet Management
- **Automatic Creation**: Wallets are automatically created when a user first accesses trading features
- **Initial Balance**: New wallets start with $100,000 (configurable)
- **Balance Tracking**: Real-time balance updates after every transaction
- **Reserved Funds**: Support for reserved funds (for pending orders)
- **Performance Metrics**: Track total P&L, win rate, and trading statistics

### 2. Transaction Types
- **Buy**: Purchase stocks with available cash balance
- **Sell**: Sell owned stocks for cash
- **Deposit**: Add funds to wallet (for demo/testing purposes)
- **Withdrawal**: Remove funds from wallet (future feature)
- **Dividend**: Record dividend payments (future feature)

### 3. Position Tracking
- Real-time position updates
- Average cost calculation
- Unrealized P&L tracking
- Market value updates
- Integration with portfolios

### 4. Validation & Safety
- Sufficient funds check before buying
- Sufficient shares check before selling
- Position size limits
- Trade value limits
- Input validation on all operations

## API Endpoints

### Get Wallet Details
```
GET /wallet/:userId
```
Returns wallet balance, holdings value, and total portfolio value.

**Response:**
```json
{
  "success": true,
  "wallet": {
    "userId": "user123",
    "balance": 150000,
    "totalDeposited": 100000,
    "totalInvested": 50000,
    "totalProfitLoss": 5000,
    "totalTrades": 25,
    "winningTrades": 15,
    "losingTrades": 10
  },
  "totalHoldingsValue": 55000,
  "totalPortfolioValue": 205000,
  "cashPercentage": "73.17"
}
```

### Buy Stock
```
POST /wallet/buy
```

**Request Body:**
```json
{
  "userId": "user123",
  "ticker": "AAPL",
  "quantity": 10,
  "portfolioId": "portfolio_123" // optional
}
```

**Response:**
```json
{
  "success": true,
  "transaction": {
    "type": "buy",
    "ticker": "AAPL",
    "quantity": 10,
    "price": 175.50,
    "subtotal": 1755.00,
    "commission": 0,
    "total": 1755.00,
    "balanceBefore": 100000,
    "balanceAfter": 98245.00,
    "status": "completed"
  },
  "wallet": {
    "balance": 98245.00,
    "availableBalance": 98245.00
  },
  "message": "Successfully bought 10 shares of AAPL at $175.50"
}
```

### Sell Stock
```
POST /wallet/sell
```

**Request Body:**
```json
{
  "userId": "user123",
  "ticker": "AAPL",
  "quantity": 5,
  "portfolioId": "portfolio_123" // optional
}
```

**Response:**
```json
{
  "success": true,
  "transaction": {
    "type": "sell",
    "ticker": "AAPL",
    "quantity": 5,
    "price": 180.25,
    "subtotal": 901.25,
    "commission": 0,
    "total": 901.25,
    "balanceBefore": 98245.00,
    "balanceAfter": 99146.25,
    "costBasis": 175.50,
    "realizedProfitLoss": 23.75,
    "status": "completed"
  },
  "wallet": {
    "balance": 99146.25,
    "availableBalance": 99146.25
  },
  "profitLoss": 23.75,
  "message": "Successfully sold 5 shares of AAPL at $180.25"
}
```

### Deposit Funds
```
POST /wallet/deposit
```

**Request Body:**
```json
{
  "userId": "user123",
  "amount": 50000,
  "notes": "Additional funding"
}
```

**Response:**
```json
{
  "success": true,
  "transaction": {
    "type": "deposit",
    "total": 50000,
    "balanceBefore": 100000,
    "balanceAfter": 150000,
    "status": "completed"
  },
  "wallet": {
    "balance": 150000,
    "availableBalance": 150000
  },
  "message": "Successfully deposited $50000.00"
}
```

### Get Transaction History
```
GET /wallet/:userId/transactions?limit=50&skip=0&ticker=AAPL&type=buy
```

**Query Parameters:**
- `limit` (optional): Number of transactions to return (default: 50, max: 500)
- `skip` (optional): Number of transactions to skip (default: 0)
- `ticker` (optional): Filter by ticker symbol
- `type` (optional): Filter by transaction type (buy, sell, deposit, withdrawal)
- `startDate` (optional): Filter by start date (ISO 8601 format)
- `endDate` (optional): Filter by end date (ISO 8601 format)

**Response:**
```json
{
  "success": true,
  "userId": "user123",
  "transactions": [
    {
      "id": "trans_123",
      "date": "2024-11-05T10:30:00Z",
      "type": "buy",
      "ticker": "AAPL",
      "quantity": 10,
      "price": 175.50,
      "total": 1755.00,
      "commission": 0,
      "status": "completed"
    }
  ],
  "stats": {
    "totalBuys": 15,
    "totalSells": 10,
    "totalBuyAmount": 25000,
    "totalSellAmount": 18000,
    "totalCommissions": 0,
    "netTrades": 25
  },
  "count": 25
}
```

### Get Holdings
```
GET /wallet/:userId/holdings
```

Returns all stock positions across all portfolios.

**Response:**
```json
{
  "success": true,
  "userId": "user123",
  "holdings": [
    {
      "ticker": "AAPL",
      "quantity": 15,
      "averageCost": 175.50,
      "currentPrice": 180.25,
      "totalValue": 2703.75
    },
    {
      "ticker": "MSFT",
      "quantity": 10,
      "averageCost": 350.00,
      "currentPrice": 365.50,
      "totalValue": 3655.00
    }
  ],
  "count": 2
}
```

### Get Wallet Summary
```
GET /wallet/:userId/summary
```

Returns comprehensive wallet information including balance, holdings, transactions, and statistics.

**Response:**
```json
{
  "success": true,
  "userId": "user123",
  "wallet": { /* wallet object */ },
  "summary": {
    "totalCash": 150000,
    "totalHoldingsValue": 55000,
    "totalPortfolioValue": 205000,
    "cashPercentage": "73.17",
    "totalProfitLoss": 5000,
    "totalTrades": 25,
    "winRate": "60.00"
  },
  "holdings": {
    "positions": [ /* holdings array */ ],
    "count": 5
  },
  "recentTransactions": [ /* last 10 transactions */ ],
  "transactionStats": { /* transaction statistics */ }
}
```

## Database Models

### WalletModel
Stores user wallet information:
- `userId`: Unique user identifier
- `balance`: Current cash balance
- `reservedFunds`: Funds reserved for pending orders
- `totalDeposited`: Lifetime deposits
- `totalInvested`: Total amount invested in stocks
- `totalWithdrawn`: Total amount withdrawn
- `totalProfitLoss`: Net realized P&L
- `totalTrades`: Total number of completed trades
- `winningTrades`: Number of profitable trades
- `losingTrades`: Number of loss-making trades
- `status`: Wallet status (active, frozen, closed)

### TransactionModel
Records all trading transactions:
- `userId`: User identifier
- `portfolioId`: Associated portfolio (optional)
- `type`: Transaction type (buy, sell, deposit, etc.)
- `ticker`: Stock ticker symbol
- `quantity`: Number of shares
- `price`: Price per share
- `subtotal`: Quantity × Price
- `commission`: Trading commission
- `fees`: Additional fees
- `total`: Total transaction amount
- `balanceBefore`: Wallet balance before transaction
- `balanceAfter`: Wallet balance after transaction
- `costBasis`: Average cost basis (for sell orders)
- `realizedProfitLoss`: Realized P&L (for sell orders)
- `status`: Transaction status (pending, completed, failed, cancelled)

## Configuration

Trading settings in `config/config.js`:

```javascript
trading: {
  // Commission and fees
  commission: 0, // Per trade commission (default: $0 for demo)
  commissionPercent: 0.001, // 0.1% commission (alternative)
  slippage: 0.0005, // 0.05% slippage per trade
  
  // Wallet settings
  initialCapital: 100000, // $100,000 starting capital
  minBalance: 0, // Minimum wallet balance
  maxDeposit: 1000000, // Maximum single deposit
  
  // Position limits
  maxPositions: 20, // Maximum positions in portfolio
  minSharesPerTrade: 1, // Minimum shares per trade
  maxSharesPerTrade: 10000, // Maximum shares per trade
  minTradeValue: 1, // Minimum trade value in dollars
  maxTradeValue: 1000000, // Maximum trade value in dollars
  
  // Risk management
  maxPositionSize: 0.20, // Max 20% of portfolio in single position
  maxPortfolioRisk: 0.02 // Max 2% risk per trade
}
```

## Usage Examples

### Basic Trading Flow

1. **Create a User** (if not exists):
```javascript
POST /user
{
  "userId": "trader123",
  "name": "John Trader"
}
```

2. **Check Wallet** (auto-created with $100,000):
```javascript
GET /wallet/trader123
```

3. **Buy Stocks**:
```javascript
POST /wallet/buy
{
  "userId": "trader123",
  "ticker": "AAPL",
  "quantity": 10
}
```

4. **View Holdings**:
```javascript
GET /wallet/trader123/holdings
```

5. **Sell Stocks**:
```javascript
POST /wallet/sell
{
  "userId": "trader123",
  "ticker": "AAPL",
  "quantity": 5
}
```

6. **View Transaction History**:
```javascript
GET /wallet/trader123/transactions
```

### Integration with Portfolios

When buying/selling stocks with a `portfolioId`, the system:
1. Validates the portfolio belongs to the user
2. Updates portfolio positions automatically
3. Tracks average cost and P&L per position
4. Maintains portfolio-level statistics

```javascript
POST /wallet/buy
{
  "userId": "trader123",
  "ticker": "AAPL",
  "quantity": 10,
  "portfolioId": "portfolio_abc123"
}
```

## Error Handling

### Common Error Responses

**Insufficient Funds:**
```json
{
  "error": "Error",
  "message": "Insufficient funds. Required: $17550.00, Available: $10000.00"
}
```

**Insufficient Shares:**
```json
{
  "error": "Error",
  "message": "Insufficient shares. You have 5 shares of AAPL"
}
```

**Invalid Ticker:**
```json
{
  "error": "Error",
  "message": "Unable to get current price for INVALID"
}
```

**Validation Error:**
```json
{
  "error": "Validation Error",
  "message": "Invalid request data",
  "errors": [
    {
      "field": "quantity",
      "message": "Quantity must be an integer between 1 and 10,000",
      "value": -5
    }
  ]
}
```

## Testing

Run the trading system test script:

```bash
node scripts/test-trading.js
```

This script tests:
- Wallet creation and retrieval
- Fund deposits
- Stock purchases (buy)
- Stock sales (sell)
- Transaction history
- Holdings tracking
- Error conditions (insufficient funds, insufficient shares)

## Future Enhancements

1. **Limit Orders**: Set buy/sell orders at specific prices
2. **Stop Loss Orders**: Automatic selling when price drops below threshold
3. **Fractional Shares**: Buy/sell partial shares
4. **Short Selling**: Borrow and sell shares
5. **Options Trading**: Trade stock options
6. **Margin Trading**: Trade with borrowed funds
7. **Real-time Updates**: WebSocket-based live price updates
8. **Order Book**: View pending orders
9. **Trade Analytics**: Advanced trading statistics and charts
10. **Commission Tiers**: Different commission structures based on trading volume

## Security Considerations

- All trading operations validate user ownership
- Input validation prevents invalid trades
- Balance checks prevent overdrafts
- Position checks prevent short selling (without explicit permission)
- Transaction history is immutable once completed
- Wallet status can be frozen to prevent trading

## Performance

- Database indexes on userId, ticker, and timestamps for fast queries
- Transaction aggregation for efficient statistics
- Caching of current prices to reduce API calls
- Optimized portfolio position updates

---

**Last Updated**: November 5, 2024

