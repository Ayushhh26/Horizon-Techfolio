/**
 * Populate database with historical price data for the 20 stocks
 * This should be run once to seed the database with initial data
 */

require('dotenv').config();
const { connectDB, isDBConnected } = require('../src/db/connection');
const PriceDataService = require('../src/services/PriceDataService');

// The 20 stocks we'll be using in the project
const STOCKS_TO_POPULATE = [
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

async function populateDatabase() {
  console.log('🚀 Starting database population...\n');
  
  // Check database connection
  try {
    await connectDB();
    if (!isDBConnected()) {
      throw new Error('Database not connected. Please check your MONGODB_URI in .env');
    }
    console.log('✅ Database connected\n');
  } catch (error) {
    console.error('❌ Failed to connect to database:', error.message);
    process.exit(1);
  }

  const priceDataService = new PriceDataService();
  
  // Calculate date range (last 10 years for comprehensive historical data)
  const today = new Date();
  const endDate = today.toISOString().split('T')[0];
  const startDate = new Date(today);
  startDate.setFullYear(startDate.getFullYear() - 10);
  const startDateStr = startDate.toISOString().split('T')[0];

  console.log(`📅 Fetching 10 years of data from ${startDateStr} to ${endDate}`);
  console.log(`📊 Processing ${STOCKS_TO_POPULATE.length} stocks...\n`);

  const results = {
    success: [],
    failed: [],
    skipped: []
  };

  for (let i = 0; i < STOCKS_TO_POPULATE.length; i++) {
    const ticker = STOCKS_TO_POPULATE[i];
    console.log(`[${i + 1}/${STOCKS_TO_POPULATE.length}] Processing ${ticker}...`);

    try {
      // Check if data already exists (skip AAPL if it has data)
      const existingData = await priceDataService.getFromDatabase(ticker, startDateStr, endDate, 'daily');
      
      if (existingData && existingData.length > 0) {
        console.log(`  ⏭️  ${ticker}: Data already exists (${existingData.length} records), skipping...`);
        results.skipped.push(ticker);
        continue;
      }
      
      // Explicitly skip AAPL if it's in the list and we want to skip it
      if (ticker === 'AAPL') {
        console.log(`  ⏭️  ${ticker}: Skipping AAPL as requested`);
        results.skipped.push(ticker);
        continue;
      }

      // Fetch and save data
      const priceData = await priceDataService.getPriceData(ticker, startDateStr, endDate, 'daily');
      
      if (priceData && priceData.length > 0) {
        // Save to database
        await priceDataService.saveToDatabase(ticker, priceData, 'daily');
        console.log(`  ✅ ${ticker}: Saved ${priceData.length} data points to database`);
        results.success.push({ ticker, count: priceData.length });
      } else {
        console.log(`  ⚠️  ${ticker}: No data retrieved`);
        results.failed.push({ ticker, reason: 'No data retrieved' });
      }

      // Add delay between API calls to respect rate limits
      // Alpha Vantage free tier: 5 calls/min = 12 seconds between calls minimum
      if (i < STOCKS_TO_POPULATE.length - 1) {
        console.log('  ⏳ Waiting 15 seconds to respect API rate limits...');
        await new Promise(resolve => setTimeout(resolve, 15000));
      }
    } catch (error) {
      console.error(`  ❌ ${ticker}: Error - ${error.message}`);
      results.failed.push({ ticker, reason: error.message });
      
      // Continue with next stock even if one fails
      if (i < STOCKS_TO_POPULATE.length - 1) {
        console.log('  ⏳ Waiting 15 seconds before next stock...');
        await new Promise(resolve => setTimeout(resolve, 15000));
      }
    }

    console.log(''); // Empty line for readability
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 POPULATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successfully populated: ${results.success.length} stocks`);
  results.success.forEach(r => {
    console.log(`   - ${r.ticker}: ${r.count} data points`);
  });
  
  if (results.skipped.length > 0) {
    console.log(`\n⏭️  Skipped (already exists): ${results.skipped.length} stocks`);
    results.skipped.forEach(t => console.log(`   - ${t}`));
  }
  
  if (results.failed.length > 0) {
    console.log(`\n❌ Failed: ${results.failed.length} stocks`);
    results.failed.forEach(r => {
      console.log(`   - ${r.ticker}: ${r.reason}`);
    });
  }
  
  console.log('\n✨ Database population complete!');
  console.log('\n💡 Note: This script respects Alpha Vantage rate limits (5 calls/min).');
  console.log('   With 20 stocks and 10 years of data, this will take approximately 5-6 minutes to complete.');
  console.log('   You can run this script again - it will skip stocks that already have data.\n');
  
  process.exit(0);
}

// Run the population
if (require.main === module) {
  populateDatabase()
    .catch((error) => {
      console.error('\n💥 Fatal error:', error.message);
      process.exit(1);
    });
}

module.exports = { populateDatabase, STOCKS_TO_POPULATE };

