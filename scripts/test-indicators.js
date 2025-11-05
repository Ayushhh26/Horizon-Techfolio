/**
 * Test All Technical Indicators
 * Tests SMA, EMA, RSI, MACD, and Bollinger Bands with real data from database
 */

require('dotenv').config();
const { connectDB, isDBConnected } = require('../src/db/connection');
const PriceDataService = require('../src/services/PriceDataService');
const { IndicatorService } = require('../src/services/IndicatorService');

// Test with a few stocks
const TEST_STOCKS = ['AAPL', 'MSFT', 'TSLA', 'NVDA', 'GOOGL'];

async function testIndicators() {
  console.log('🧪 Testing All Technical Indicators with Real Data\n');
  console.log('='.repeat(80) + '\n');

  try {
    // Connect to database
    await connectDB();
    if (!isDBConnected()) {
      throw new Error('Database not connected');
    }
    console.log('✅ Database connected\n');

    const priceDataService = new PriceDataService();

    for (const ticker of TEST_STOCKS) {
      console.log(`📊 Testing ${ticker}`);
      console.log('-'.repeat(80));

      try {
        // Get last 100 days of data (enough for all indicators)
        const today = new Date();
        const endDate = today.toISOString().split('T')[0];
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 100);
        const startDateStr = startDate.toISOString().split('T')[0];

        const priceData = await priceDataService.getFromDatabase(ticker, startDateStr, endDate, 'daily');

        if (!priceData || priceData.length === 0) {
          console.log(`  ⚠️  No data found for ${ticker}\n`);
          continue;
        }

        console.log(`  📅 Data points: ${priceData.length} days`);
        console.log(`  📅 Date range: ${priceData[0].date} to ${priceData[priceData.length - 1].date}`);
        console.log(`  💰 Latest price: $${priceData[priceData.length - 1].close.toFixed(2)}\n`);

        // Format price data for indicators (array of {date, close, ...})
        const formattedData = priceData.map(point => ({
          date: point.date,
          open: point.open,
          high: point.high,
          low: point.low,
          close: point.close,
          volume: point.volume
        }));

        // Test each indicator
        const indicators = [
          { type: 'SMA', params: { window: 20 }, name: 'Simple Moving Average (20-day)' },
          { type: 'EMA', params: { window: 12 }, name: 'Exponential Moving Average (12-day)' },
          { type: 'RSI', params: { window: 14, overbought: 70, oversold: 30 }, name: 'Relative Strength Index (14-day)' },
          { type: 'MACD', params: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 }, name: 'MACD (12,26,9)' },
          { type: 'BOLLINGER', params: { window: 20, multiplier: 2 }, name: 'Bollinger Bands (20-day, 2σ)' }
        ];

        const results = {};

        for (const config of indicators) {
          try {
            console.log(`  🔹 ${config.name}:`);
            
            const indicator = IndicatorService.createIndicator(config.type, config.params);
            const values = indicator.compute(formattedData);
            const signals = indicator.getAllSignals();
            const latestSignal = indicator.getLatestSignal();
            const latestIndex = signals.length - 1;
            const signalStrength = indicator.getSignalStrength(latestIndex);
            const metadata = indicator.getMetadata();

            // Get latest value based on indicator type
            let latestValue;
            let valueDisplay;

            if (config.type === 'MACD') {
              // MACD returns an object with macdLine, signalLine, histogram
              if (values && typeof values === 'object' && values.macdLine && Array.isArray(values.macdLine) && values.macdLine.length > 0) {
                // Find the last valid index where both macdLine and signalLine have values
                let lastIndex = -1;
                for (let i = values.macdLine.length - 1; i >= 0; i--) {
                  if (values.macdLine[i] !== undefined && values.signalLine && values.signalLine[i] !== undefined) {
                    lastIndex = i;
                    break;
                  }
                }
                
                if (lastIndex >= 0) {
                  latestValue = {
                    macd: values.macdLine[lastIndex].toFixed(4),
                    signal: values.signalLine[lastIndex].toFixed(4),
                    histogram: values.histogram && values.histogram[lastIndex] !== undefined 
                      ? values.histogram[lastIndex].toFixed(4) 
                      : 'N/A'
                  };
                  valueDisplay = `MACD: ${latestValue.macd}, Signal: ${latestValue.signal}, Histogram: ${latestValue.histogram}`;
                } else {
                  throw new Error('MACD values not properly calculated');
                }
              } else {
                throw new Error('MACD values structure invalid');
              }
            } else if (config.type === 'BOLLINGER') {
              // Bollinger Bands returns an object with upper, middle, lower
              if (values && typeof values === 'object' && values.upper && Array.isArray(values.upper) && values.upper.length > 0) {
                const lastIndex = values.upper.length - 1;
                const currentPrice = formattedData[formattedData.length - 1].close;
                latestValue = {
                  upper: values.upper[lastIndex].toFixed(2),
                  middle: values.middle[lastIndex].toFixed(2),
                  lower: values.lower[lastIndex].toFixed(2),
                  currentPrice: currentPrice.toFixed(2)
                };
                valueDisplay = `Upper: $${latestValue.upper}, Middle: $${latestValue.middle}, Lower: $${latestValue.lower}, Price: $${latestValue.currentPrice}`;
              } else {
                throw new Error('Bollinger Bands values not properly calculated');
              }
            } else {
              // Simple numeric values (SMA, EMA, RSI)
              if (Array.isArray(values) && values.length > 0) {
                latestValue = values[values.length - 1];
                if (config.type === 'RSI') {
                  valueDisplay = `${latestValue.toFixed(2)} (${latestValue < 30 ? 'Oversold' : latestValue > 70 ? 'Overbought' : 'Neutral'})`;
                } else {
                  valueDisplay = `$${latestValue.toFixed(2)}`;
                }
              } else {
                throw new Error('Indicator values not properly calculated');
              }
            }

            // Map signal strength to description
            const strengthMap = {
              'Very Strong': signalStrength >= 0.8,
              'Strong': signalStrength >= 0.6,
              'Moderate': signalStrength >= 0.4,
              'Weak': signalStrength >= 0.2,
              'Very Weak': signalStrength < 0.2
            };
            const strengthDesc = Object.keys(strengthMap).find(key => strengthMap[key]) || 'Very Weak';

            // Count signal distribution
            const buyCount = signals.filter(s => s === 'buy').length;
            const sellCount = signals.filter(s => s === 'sell').length;
            const holdCount = signals.filter(s => s === 'hold').length;

            console.log(`     Latest Value: ${valueDisplay}`);
            console.log(`     Latest Signal: ${latestSignal.toUpperCase()} (${strengthDesc})`);
            console.log(`     Signal Strength: ${(signalStrength * 100).toFixed(1)}%`);
            console.log(`     Signal Distribution: ${buyCount} buy, ${sellCount} sell, ${holdCount} hold`);
            console.log(`     Data Points: ${metadata.valueCount} values, ${metadata.signalCount} signals`);
            
            // Show last 5 signals for context
            const recentSignals = signals.slice(-5);
            console.log(`     Recent Signals (last 5): ${recentSignals.map(s => s.toUpperCase()).join(' → ')}`);

            results[config.type] = {
              latestValue,
              latestSignal,
              signalStrength,
              strengthDesc,
              buyCount,
              sellCount,
              holdCount,
              metadata
            };

            console.log('');
          } catch (error) {
            console.log(`     ❌ Error: ${error.message}\n`);
          }
        }

        // Summary for this stock
        console.log(`  📋 Summary for ${ticker}:`);
        const summarySignals = Object.values(results).map(r => r.latestSignal);
        const buyVotes = summarySignals.filter(s => s === 'buy').length;
        const sellVotes = summarySignals.filter(s => s === 'sell').length;
        const holdVotes = summarySignals.filter(s => s === 'hold').length;
        
        console.log(`     Indicator Consensus: ${buyVotes} buy, ${sellVotes} sell, ${holdVotes} hold`);
        
        let consensus;
        if (buyVotes > sellVotes && buyVotes > holdVotes) {
          consensus = 'BUY';
        } else if (sellVotes > buyVotes && sellVotes > holdVotes) {
          consensus = 'SELL';
        } else {
          consensus = 'HOLD';
        }
        
        console.log(`     Overall Consensus: ${consensus}`);
        console.log('\n' + '='.repeat(80) + '\n');

      } catch (error) {
        console.error(`  ❌ Error testing ${ticker}:`, error.message);
        console.log('\n' + '='.repeat(80) + '\n');
      }
    }

    // Final summary
    console.log('✨ Indicator Testing Complete!\n');
    console.log('📊 Tested Indicators:');
    console.log('   1. SMA (Simple Moving Average) - Trend following');
    console.log('   2. EMA (Exponential Moving Average) - Trend following (responsive)');
    console.log('   3. RSI (Relative Strength Index) - Momentum/overbought-oversold');
    console.log('   4. MACD - Momentum convergence/divergence');
    console.log('   5. Bollinger Bands - Volatility and mean reversion\n');
    
    console.log('💡 Notes:');
    console.log('   - Each indicator uses different calculations and logic');
    console.log('   - Signals are generated based on indicator-specific rules');
    console.log('   - Multiple indicators agreeing = stronger signal');
    console.log('   - Always consider market context when interpreting signals');

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

// Run tests
if (require.main === module) {
  testIndicators();
}

module.exports = { testIndicators };

