# Technical Indicators in HorizonTrader

## Overview

Technical indicators are mathematical calculations based on historical price data that help predict future price movements. Our system uses **5 main indicators** to generate buy/hold/sell signals for portfolio management.

---

## Architecture

### 1. **Base Class: `TechnicalIndicator`**
- **Location**: `src/models/TechnicalIndicator.js`
- **Purpose**: Abstract base class that all indicators inherit from
- **Key Methods**:
  - `compute(priceData)` - Calculates indicator values from price history
  - `generateSignals(priceData, values)` - Generates buy/hold/sell signals
  - `calculateSignal(priceData, values, index)` - Determines signal for each data point
  - `getLatestSignal()` - Returns the most recent signal
  - `getSignalStrength(index)` - Returns confidence level (0-1)

### 2. **Indicator Implementations**
- **Location**: `src/services/IndicatorService.js`
- **5 Indicators Available**:

#### A. **SMA (Simple Moving Average)**
- **What it does**: Average of closing prices over a window (default: 20 days)
- **Signal Logic**:
  - **BUY**: Price crosses above SMA (momentum shift upward)
  - **SELL**: Price crosses below SMA (momentum shift downward)
  - **HOLD**: Price stays on same side of SMA

#### B. **EMA (Exponential Moving Average)**
- **What it does**: Weighted average that gives more weight to recent prices (default: 12 days)
- **Signal Logic**: Same as SMA but more responsive to recent price changes
- **Why it's different**: Reacts faster to price changes than SMA

#### C. **RSI (Relative Strength Index)**
- **What it does**: Measures momentum, shows if stock is overbought (>70) or oversold (<30)
- **Default window**: 14 days
- **Signal Logic**:
  - **BUY**: RSI < 30 (oversold - potential bounce)
  - **SELL**: RSI > 70 (overbought - potential pullback)
  - **HOLD**: RSI between 30-70 (neutral)
- **Signal Strength**: Stronger when RSI is further from 50 (more extreme)

#### D. **MACD (Moving Average Convergence Divergence)**
- **What it does**: Shows relationship between two EMAs (fast EMA - slow EMA)
- **Components**:
  - **MACD Line**: Fast EMA (12) - Slow EMA (26)
  - **Signal Line**: EMA of MACD line (9 periods)
  - **Histogram**: MACD Line - Signal Line
- **Signal Logic**:
  - **BUY**: MACD line crosses above signal line (bullish momentum)
  - **SELL**: MACD line crosses below signal line (bearish momentum)
  - **HOLD**: No crossover
- **Signal Strength**: Based on histogram magnitude

#### E. **Bollinger Bands**
- **What it does**: Creates upper and lower bands around SMA (2 standard deviations)
- **Default window**: 20 days, multiplier: 2
- **Signal Logic**:
  - **BUY**: Price touches/crosses lower band (oversold, potential bounce)
  - **SELL**: Price touches/crosses upper band (overbought, potential pullback)
  - **HOLD**: Price stays within bands
- **Signal Strength**: Stronger when price is further from middle band

---

## How It Works: End-to-End Flow

### Step 1: Portfolio Signals Request
```
GET /portfolio/:id/signals
```

### Step 2: Strategy Selection
- System recommends a strategy based on:
  - Investment horizon (1, 2, or 5 years)
  - Risk tolerance
  - Portfolio size
- Each strategy uses specific indicators:
  - **Trend Following**: SMA, EMA
  - **Momentum**: RSI, MACD
  - **Mean Reversion**: Bollinger Bands, RSI

### Step 3: Data Retrieval
- For each ticker in portfolio:
  - Fetches historical price data from MongoDB (10 years)
  - Formats as: `[{date, open, high, low, close, volume}, ...]`

### Step 4: Indicator Calculation
For each indicator in the strategy:

```javascript
// Example: Calculate RSI
const indicator = IndicatorService.createIndicator('RSI', {window: 14});
const values = indicator.compute(priceData);  // Returns RSI values
const signals = indicator.getAllSignals();    // Returns ['hold', 'buy', 'sell', ...]
```

### Step 5: Signal Aggregation
- Each indicator produces a signal for the latest data point
- Strategy combines multiple indicators using rules:
  - **Entry Rule**: When to buy (e.g., "2 out of 3 indicators say buy")
  - **Exit Rule**: When to sell (e.g., "RSI > 70 AND MACD negative")
- Final signal = `buy`, `hold`, or `sell`

### Step 6: Confidence Calculation
- **Confidence** (0-1): How strong the signal is
  - Based on:
    - Number of indicators agreeing
    - Signal strength from each indicator
    - How extreme the indicator values are
- **Strength**: Maps confidence to human-readable terms:
  - 0.8-1.0: "Very Strong"
  - 0.6-0.8: "Strong"
  - 0.4-0.6: "Moderate"
  - 0.2-0.4: "Weak"
  - 0.0-0.2: "Very Weak"

### Step 7: Response
```json
{
  "portfolioId": "portfolio_123",
  "signals": [
    {
      "ticker": "AAPL",
      "signal": "hold",
      "strength": "Very Strong",
      "price": 269.05,
      "confidence": 0.85,
      "reason": "SMA and EMA indicate strong uptrend, RSI neutral",
      "indicators": {
        "SMA": {"signal": "hold", "value": 265.20},
        "RSI": {"signal": "hold", "value": 55.3},
        "MACD": {"signal": "buy", "value": 2.45}
      }
    }
  ]
}
```

---

## Example: How RSI Works

### Calculation Process:
1. **Calculate price changes**:
   ```
   Day 1: $100 → Day 2: $105 = +$5 gain
   Day 2: $105 → Day 3: $102 = -$3 loss
   ```

2. **Separate gains and losses**:
   - Gains: [+5, 0, 0, +3, ...]
   - Losses: [0, 3, 0, 0, ...]

3. **Calculate average gain/loss** (14-day window):
   - Average Gain = sum of gains / 14
   - Average Loss = sum of losses / 14

4. **Calculate RSI**:
   ```
   RS = Average Gain / Average Loss
   RSI = 100 - (100 / (1 + RS))
   ```

5. **Generate Signal**:
   - RSI = 25 → **BUY** (oversold, below 30)
   - RSI = 75 → **SELL** (overbought, above 70)
   - RSI = 50 → **HOLD** (neutral)

---

## Signal Generation Logic

### Individual Indicator Signals:
Each indicator has its own `calculateSignal()` method:

```javascript
// Example: SMA Indicator
if (previousPrice <= previousSMA && currentPrice > currentSMA) {
  return 'buy';  // Price crossed above SMA
}
if (previousPrice >= previousSMA && currentPrice < currentSMA) {
  return 'sell'; // Price crossed below SMA
}
return 'hold';
```

### Strategy-Level Signals:
Strategies combine multiple indicators using rules:

```javascript
// Example: Trend Following Strategy
entryRule: (signals) => {
  // Buy if SMA and EMA both say buy
  return signals.SMA === 'buy' && signals.EMA === 'buy';
}
```

---

## Data Requirements

### Minimum Data Needed:
- **SMA/EMA**: 20 days minimum (default window)
- **RSI**: 15 days minimum (14 days + 1 for calculation)
- **MACD**: 26 days minimum (slow EMA period)
- **Bollinger Bands**: 20 days minimum (default window)

### Our System:
- **Has**: 10 years of daily data (~2,514 data points per stock)
- **More than enough**: All indicators can calculate with confidence
- **Latest data**: Cron job updates daily

---

## Performance Considerations

### Efficiency:
- **Cached calculations**: Indicator values are calculated once per request
- **Database queries**: Uses indexed MongoDB queries for fast data retrieval
- **Batch processing**: All indicators calculated in parallel for each ticker

### Accuracy:
- **10 years of data**: Provides robust historical context
- **Multiple indicators**: Reduces false signals by requiring consensus
- **Signal strength**: Helps filter weak signals

---

## Usage in API

### Get Signals for Portfolio:
```bash
GET /portfolio/:portfolioId/signals
Authorization: Bearer <token>
```

### Response Example:
```json
{
  "portfolioId": "portfolio_123",
  "strategy": {
    "name": "Trend Following",
    "frequency": "weekly"
  },
  "signals": [
    {
      "ticker": "AAPL",
      "signal": "hold",
      "strength": "Very Strong",
      "price": 269.05,
      "confidence": 0.85,
      "reason": "Strong uptrend with neutral momentum",
      "timestamp": "2025-11-04T12:00:00Z"
    }
  ]
}
```

---

## Customization

### Adding New Indicators:
1. Create a new class extending `TechnicalIndicator`
2. Implement `calculateValues()` and `calculateSignal()`
3. Register in `IndicatorService.createIndicator()`

### Modifying Signal Logic:
- Edit `calculateSignal()` method in specific indicator class
- Adjust thresholds (e.g., RSI overbought/oversold levels)
- Change window sizes for different sensitivities

---

## Best Practices

1. **Multiple Indicators**: Never rely on a single indicator
2. **Signal Strength**: Pay attention to confidence levels
3. **Market Context**: Consider overall market conditions
4. **Backtesting**: Test strategies with historical data before using
5. **Regular Updates**: Ensure daily data updates are running

---

## Summary

Technical indicators in HorizonTrader:
- ✅ **5 indicators** (SMA, EMA, RSI, MACD, Bollinger Bands)
- ✅ **Automatic signal generation** (buy/hold/sell)
- ✅ **Confidence scoring** (signal strength)
- ✅ **Strategy-based** (indicators selected based on investment horizon)
- ✅ **10 years of data** (robust historical context)
- ✅ **Daily updates** (current, relevant signals)

The system combines multiple indicators to generate reliable trading signals, helping users make informed decisions about their portfolio.

