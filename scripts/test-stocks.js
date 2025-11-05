/**
 * Test script to validate 20 stocks through the API
 * Tests Alpha Vantage API integration and stock validation
 */

const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000';

// 20 common stocks to test
const TEST_STOCKS = [
  'AAPL',   // Apple
  'MSFT',   // Microsoft
  'GOOGL',  // Alphabet
  'AMZN',   // Amazon
  'TSLA',   // Tesla
  'META',   // Meta
  'NVDA',   // NVIDIA
  'JPM',    // JPMorgan Chase
  'JNJ',    // Johnson & Johnson
  'V',      // Visa
  'WMT',    // Walmart
  'PG',     // Procter & Gamble
  'UNH',    // UnitedHealth
  'HD',     // Home Depot
  'MA',     // Mastercard
  'DIS',    // Disney
  'BAC',    // Bank of America
  'XOM',    // Exxon Mobil
  'CVX',    // Chevron
  'NFLX'    // Netflix
];

async function testStockSearch() {
  console.log('🧪 Testing Stock Search API...\n');
  console.log(`Testing ${TEST_STOCKS.length} stocks:\n${TEST_STOCKS.join(', ')}\n`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/stocks/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ symbols: TEST_STOCKS })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    
    console.log('📊 Results:');
    console.log(`Total: ${result.total || TEST_STOCKS.length}`);
    console.log(`Valid: ${result.valid || 0}`);
    console.log(`Invalid: ${result.invalid || 0}\n`);
    
    if (result.results && result.results.length > 0) {
      console.log('✅ Valid Stocks:');
      result.results
        .filter(stock => stock.valid)
        .forEach(stock => {
          const meta = stock.metadata || {};
          console.log(`  ✓ ${stock.symbol.padEnd(6)} - ${meta.name || 'N/A'}`);
        });
      
      console.log('\n❌ Invalid Stocks:');
      const invalid = result.results.filter(stock => !stock.valid);
      if (invalid.length > 0) {
        invalid.forEach(stock => {
          console.log(`  ✗ ${stock.symbol.padEnd(6)} - ${stock.error || 'Not found'}`);
        });
      } else {
        console.log('  (none)');
      }
    }
    
    console.log('\n✅ Test completed successfully!');
    return result;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Make sure the server is running: npm start');
    }
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testStockSearch()
    .then(() => {
      console.log('\n✨ All tests passed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Tests failed:', error.message);
      process.exit(1);
    });
}

module.exports = { testStockSearch, TEST_STOCKS };

