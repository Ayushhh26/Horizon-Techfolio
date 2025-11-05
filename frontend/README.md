# Horizon Techfolio - Frontend

Modern Next.js frontend for the HorizonTrader Technical Analysis Portfolio Management System.

## 🎨 Design Philosophy

This frontend features a unique "Financial Horizon" theme designed to stand out from generic AI-generated interfaces:

- **Dark Theme**: Modern slate-900/slate-950 gradient backgrounds
- **Glassmorphism UI**: Semi-transparent cards with backdrop blur effects
- **Vibrant Accents**: Blue-to-purple gradients for primary actions
- **Custom Typography**: Inter for UI, JetBrains Mono for numbers and data
- **Status Colors**: Green for gains, red for losses, blue for info
- **Responsive Design**: Mobile-first approach with touch-friendly interfaces

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: Axios + TanStack Query
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Icons**: Lucide React
- **Animations**: Framer Motion

## 📦 Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Edit .env.local with your backend API URL
# Default: NEXT_PUBLIC_API_URL=http://localhost:3000

# Run development server
npm run dev
```

The application will be available at `http://localhost:3001`

## 🏗️ Project Structure

```
/app                        # Next.js App Router pages
  /login                    # Login page
  /register                 # Registration page
  /dashboard                # Main dashboard
  /portfolio/[id]           # Portfolio detail page
  /trading                  # Trading interface
  /transactions             # Transaction history
  /backtest                 # Backtesting tool
  /paper-trading            # Paper trading dashboard
  /coupled-trades           # Coupled trades interface
  layout.tsx                # Root layout with navigation
  page.tsx                  # Landing page

/components                 # React components
  /ui                       # Reusable UI components (Button, Card, etc.)
  /auth                     # Authentication components
  /portfolio                # Portfolio-related components
  /trading                  # Trading components

/lib                        # Core libraries
  /api                      # API client and functions
    client.ts               # Axios configuration
    auth.ts                 # Authentication APIs
    portfolio.ts            # Portfolio APIs
    trading.ts              # Trading APIs
  /store                    # Zustand state stores
    authStore.ts            # Auth state
    portfolioStore.ts       # Portfolio state
    walletStore.ts          # Wallet state
  /types                    # TypeScript type definitions
    user.ts                 # User types
    portfolio.ts            # Portfolio types
    wallet.ts               # Wallet/trading types
  /utils                    # Utility functions
    cn.ts                   # Class name merger
    formatters.ts           # Number/date formatters

/public                     # Static assets
  /images                   # Image files
```

## 🎯 Features

### ✅ Core Features
- **User Authentication**: Secure login/register with JWT tokens and password hashing
- **Portfolio Management**: Create and manage multiple portfolios with custom names
- **Stock Selection**: Choose from popular stocks (AAPL, MSFT, GOOGL, AMZN, etc.)
- **Trading System**: Buy/sell stocks with virtual wallet ($10,000 starting balance)
- **Transaction History**: Track all trades with detailed filters and statistics
- **Portfolio Analysis**: View signals, strategy recommendations, and performance metrics

### ✅ Advanced Features
- **Backtesting**: Test trading strategies against historical data with detailed metrics
- **Paper Trading**: Practice trading in real-time with virtual money
- **Coupled Trades**: Analyze correlated stock pairs for trading opportunities
- **Technical Indicators**: SMA, EMA, RSI, MACD, Bollinger Bands
- **Performance Analytics**: Sharpe ratio, max drawdown, win rate, and more

## 🔗 API Integration

The frontend communicates with the HorizonTrader backend API running on `http://localhost:3000`.

### Key Endpoints

**Authentication**:
- `POST /user` - Register new user
- `POST /auth/login` - Login
- `POST /verify` - Verify JWT token

**Portfolio**:
- `GET /user/:userId/portfolios` - Get user portfolios
- `POST /portfolio/initialize` - Create new portfolio
- `GET /portfolio/:id/signals` - Get trading signals
- `GET /portfolio/:id/strategy` - Get recommended strategy
- `GET /portfolio/:id/performance` - Get performance metrics

**Trading**:
- `GET /wallet/:userId` - Get wallet details
- `POST /wallet/buy` - Buy stock
- `POST /wallet/sell` - Sell stock
- `POST /wallet/deposit` - Deposit funds
- `GET /wallet/:userId/transactions` - Get transaction history
- `GET /wallet/:userId/holdings` - Get current holdings
- `GET /wallet/:userId/summary` - Get wallet summary

**Stocks**:
- `GET /stocks/available` - Get available stocks
- `POST /stocks/search` - Search stocks by ticker

**Backtesting**:
- `POST /backtest/run` - Run backtest on historical data

**Paper Trading**:
- `GET /portfolio/:userId/paper-trading/active` - Get active session
- `POST /portfolio/paper-trading/start` - Start paper trading session
- `POST /portfolio/paper-trading/:id/pause` - Pause session
- `POST /portfolio/paper-trading/:id/resume` - Resume session
- `POST /portfolio/paper-trading/:id/stop` - Stop session

**Coupled Trades**:
- `POST /coupled-trade/analyze` - Analyze stock pair correlation

## 🎨 Custom Design System

### Color Palette
- **Primary**: Blue-to-Purple gradient (`from-blue-500 to-purple-600`)
- **Success**: `#10B981` (Green for positive returns)
- **Danger**: `#EF4444` (Red for negative returns)
- **Background**: Slate-950 to Slate-900 gradient
- **Cards**: Slate-800 with 50% opacity + backdrop blur
- **Text**: White for primary, Slate-400 for secondary

### Typography
- **UI Text**: Inter (400, 500, 600, 700)
- **Numbers/Data**: JetBrains Mono (400, 500, 700)

### Custom Components
- **GlassCard**: Semi-transparent cards with backdrop blur and border gradients
- **Button**: Variant support (primary, secondary, ghost) with hover effects
- **Input**: Dark themed with focus states and error handling
- **Badge**: Contextual colors (success, danger, warning, info)
- **Modal**: Glassmorphism overlay with smooth animations
- **Tabs**: Horizontal navigation with active state indicators
- **Loading**: Spinner with customizable size and optional text
- **Toast**: Notification system with auto-dismiss

## 🛠️ Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 📝 Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 🚦 Backend Setup

Make sure the backend is running on `http://localhost:3000` with CORS enabled for `http://localhost:3001`.

In the backend's `.env` file:
```
CORS_ORIGIN=http://localhost:3001
```

## 📱 Responsive Design

The application is fully responsive with:
- Mobile-first approach
- Touch-friendly interfaces
- Hamburger navigation on mobile
- Optimized layouts for all screen sizes

## ♿ Accessibility

- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader friendly
- High contrast support
- Reduced motion respect

## 🔒 Security

- JWT token authentication
- Secure cookie storage
- HTTPS in production
- XSS protection
- CSRF protection

## 📄 License

This project is part of the HorizonTrader system.

## 🧪 Testing the Application

1. **Start Backend Server** (Terminal 1):
```bash
cd "/Users/ayush/Documents/Horizon Trading"
npm start
```
Backend will run on `http://localhost:3000`

2. **Start Frontend Server** (Terminal 2):
```bash
cd "/Users/ayush/Documents/Horizon Trading/frontend"
npm run dev
```
Frontend will run on `http://localhost:3001`

3. **Login or Register**:
   - Navigate to `http://localhost:3001`
   - Register a new account or login with existing credentials
   - Default test user: `and179` / `Ayush@26`

4. **Explore Features**:
   - Create a portfolio with stocks like AAPL, MSFT, GOOGL
   - Trade stocks using your $10,000 wallet balance
   - View transaction history and holdings
   - Run backtests on historical data
   - Start paper trading sessions
   - Analyze coupled trades

## 🤝 Contributing

This is an academic project for portfolio management and technical analysis.
