/**
 * Debug script to test ticker validation
 */

require('dotenv').config();
const { connectDB, isDBConnected } = require('../src/db/connection');
const PriceDataService = require('../src/services/PriceDataService');
const PriceDataModel = require('../src/db/models/PriceDataModel');

async function debugValidation() {
  console.log('🔍 Debugging AAPL validation...\n');
  
  await connectDB();
  console.log(`Database connected: ${isDBConnected()}\n`);
  
  const ticker = 'AAPL';
  const priceDataService = new PriceDataService();
  
  // Test 1: Check database directly
  console.log('Test 1: Checking database directly...');
  try {
    const priceDataDoc = await PriceDataModel.findOne({ ticker, interval: 'daily' });
    if (priceDataDoc) {
      console.log(`✅ Found in database: ${priceDataDoc.data.length} records`);
      console.log(`   First date: ${priceDataDoc.data[0]?.date}`);
      console.log(`   Last date: ${priceDataDoc.data[priceDataDoc.data.length - 1]?.date}`);
    } else {
      console.log('❌ Not found in database');
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  
  console.log('');
  
  // Test 2: Check via PriceDataService
  console.log('Test 2: Checking via PriceDataService...');
  try {
    const today = new Date();
    const endDate = today.toISOString().split('T')[0];
    const startDate = new Date(today);
    startDate.setFullYear(startDate.getFullYear() - 10);
    const startDateStr = startDate.toISOString().split('T')[0];
    
    const data = await priceDataService.getFromDatabase(ticker, startDateStr, endDate, 'daily');
    if (data && Array.isArray(data) && data.length > 0) {
      console.log(`✅ Found via PriceDataService: ${data.length} records`);
    } else {
      console.log(`❌ Not found via PriceDataService (returned: ${data})`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  
  console.log('');
  
  // Test 3: Known ticker check
  console.log('Test 3: Known ticker check...');
  const knownTickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'JNJ', 'V', 'WMT', 'PG', 'UNH', 'HD', 'MA', 'DIS', 'BAC', 'XOM', 'CVX', 'NFLX'];
  if (knownTickers.includes(ticker.toUpperCase())) {
    console.log(`✅ AAPL is in known tickers list`);
  } else {
    console.log(`❌ AAPL is NOT in known tickers list`);
  }
  
  process.exit(0);
}

debugValidation().catch(console.error);


